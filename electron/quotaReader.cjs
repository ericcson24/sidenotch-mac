const http = require('http');
const https = require('https');
const { execSync } = require('child_process');

function formatCountdown(targetDate) {
  const diffMs = targetDate.getTime() - Date.now();
  if (diffMs <= 0) return 'it will fully refresh shortly.';
  const totalMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  if (days > 0) {
    return `it will fully refresh in ${days} days, ${remHours} hours.`;
  }
  if (hours > 0) {
    return `it will fully refresh in ${hours} hours, ${mins} minutes.`;
  }
  return `it will fully refresh in ${mins} minutes.`;
}

function getLanguageServerCandidates() {
  try {
    const ps = execSync('ps -ax -o pid=,command=', { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const candidates = [];
    for (const line of ps.split('\n')) {
      if (!line.includes('language_server')) continue;
      const pidMatch = line.trim().match(/^(\d+)/);
      if (!pidMatch) continue;
      const pid = pidMatch[1];
      const csrfMatch = line.match(/--csrf_token[= ]([^\s]+)/) || line.match(/--extension_server_csrf_token[= ]([^\s]+)/);
      const extPortMatch = line.match(/--extension_server_port[= ](\d+)/);

      let ports = [];
      try {
        const lsof = execSync(`lsof -nP -iTCP -sTCP:LISTEN -a -p ${pid}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
        for (const m of lsof.matchAll(/:(\d+)\s/g)) {
          ports.push(parseInt(m[1]));
        }
      } catch {}
      if (extPortMatch) ports.push(parseInt(extPortMatch[1]));
      ports = [...new Set(ports)].filter(p => p > 0);

      candidates.push({
        pid,
        csrf: csrfMatch ? csrfMatch[1] : undefined,
        ports,
      });
    }
    return candidates;
  } catch {
    return [];
  }
}

function queryLanguageServerRpc(port, tls, token, endpointPath, bodyObj = {}) {
  return new Promise((resolve) => {
    const mod = tls ? https : http;
    const req = mod.request({
      hostname: '127.0.0.1',
      port,
      path: endpointPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Connect-Protocol-Version': '1',
        ...(token ? { 'X-Codeium-Csrf-Token': token } : {}),
      },
      rejectUnauthorized: false,
      timeout: 2000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.write(JSON.stringify(bodyObj));
    req.end();
  });
}

let cachedAntigravityUsage = {
  isLinked: false,
  plan: 'Google AI Pro',
  availableCredits: 1896,
  enableOverages: true,
  geminiModels: {
    fiveHourRemaining: 100,
    fiveHourRefreshText: 'it will fully refresh in 2 hours, 59 minutes.',
    weeklyRemaining: 1,
    weeklyRefreshText: 'You have used some of your weekly limit, it will fully refresh in 2 days, 20 hours.',
  },
  claudeGptModels: {
    fiveHourRemaining: 100,
    weeklyRemaining: 100,
  },
};

async function fetchLiveAntigravityUsage() {
  const candidates = getLanguageServerCandidates();
  for (const candidate of candidates) {
    for (const port of candidate.ports) {
      for (const tls of [false, true]) {
        // 1. Query Quota Summary (contains exact 5h and weekly remaining fraction & text)
        const quotaSummaryResp = await queryLanguageServerRpc(
          port,
          tls,
          candidate.csrf,
          '/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary',
          { metadata: candidate.csrf ? { csrf_token: candidate.csrf } : {} }
        );

        // 2. Query User Status (contains plan name and available AI credits)
        const userStatusResp = await queryLanguageServerRpc(
          port,
          tls,
          candidate.csrf,
          '/exa.language_server_pb.LanguageServerService/GetUserStatus',
          { metadata: candidate.csrf ? { csrf_token: candidate.csrf } : {} }
        );

        if (quotaSummaryResp?.response?.groups || userStatusResp?.userStatus) {
          let planName = 'Google AI Pro';
          let credits = 1896;

          if (userStatusResp?.userStatus) {
            const status = userStatusResp.userStatus;
            const userTier = status.userTier;
            if (userTier?.name) planName = userTier.name;
            else if (status.planStatus?.planInfo?.planName) planName = `${status.planStatus.planInfo.planName} Plan`;

            if (userTier?.availableCredits?.[0]?.creditAmount) {
              credits = parseInt(userTier.availableCredits[0].creditAmount, 10);
            } else if (status.planStatus?.availablePromptCredits !== undefined) {
              credits = status.planStatus.availablePromptCredits;
            }
          }

          let gemini5h = 100;
          let gemini5hText = 'it will fully refresh in 3 hours, 0 minutes.';
          let geminiWeekly = 1;
          let geminiWeeklyText = 'You have used some of your weekly limit, it will fully refresh in 2 days, 20 hours.';

          let claude5h = 100;
          let claudeWeekly = 100;

          if (quotaSummaryResp?.response?.groups) {
            for (const group of quotaSummaryResp.response.groups) {
              if (group.displayName?.includes('Gemini')) {
                for (const bucket of group.buckets || []) {
                  if (bucket.window === '5h' || bucket.bucketId === 'gemini-5h') {
                    gemini5h = Math.round((bucket.remainingFraction ?? 1) * 100);
                    if (bucket.description) gemini5hText = bucket.description;
                    else if (bucket.resetTime) gemini5hText = formatCountdown(new Date(bucket.resetTime));
                  } else if (bucket.window === 'weekly' || bucket.bucketId === 'gemini-weekly') {
                    geminiWeekly = Math.max(0, Math.round((bucket.remainingFraction ?? 0) * 100));
                    if (bucket.description) geminiWeeklyText = bucket.description;
                    else if (bucket.resetTime) geminiWeeklyText = formatCountdown(new Date(bucket.resetTime));
                  }
                }
              } else if (group.displayName?.includes('Claude') || group.displayName?.includes('GPT')) {
                for (const bucket of group.buckets || []) {
                  if (bucket.window === '5h' || bucket.bucketId === '3p-5h') {
                    claude5h = Math.round((bucket.remainingFraction ?? 1) * 100);
                  } else if (bucket.window === 'weekly' || bucket.bucketId === '3p-weekly') {
                    claudeWeekly = Math.round((bucket.remainingFraction ?? 1) * 100);
                  }
                }
              }
            }
          }

          cachedAntigravityUsage = {
            isLinked: true,
            plan: planName,
            availableCredits: credits,
            enableOverages: true,
            geminiModels: {
              fiveHourRemaining: gemini5h,
              fiveHourRefreshText: gemini5hText,
              weeklyRemaining: geminiWeekly,
              weeklyRefreshText: geminiWeeklyText,
            },
            claudeGptModels: {
              fiveHourRemaining: claude5h,
              weeklyRemaining: claudeWeekly,
            },
          };

          return cachedAntigravityUsage;
        }
      }
    }
  }

  return cachedAntigravityUsage;
}

function getAntigravityRealUsage() {
  fetchLiveAntigravityUsage();
  return cachedAntigravityUsage;
}

function getClaudeRealUsage() {
  return {
    isLinked: false,
    percent: 0,
    maxBadge: 'Sin Vincular',
    fiveHourPercent: 0,
    weeklyPercent: 0,
    weeklyResetText: 'No vinculado',
    weeklyFablePercent: 0,
    weeklyFableResetText: 'No vinculado',
  };
}

function getOpenAIRealUsage() {
  return {
    isLinked: false,
    percent: 0,
    maxBadge: 'Sin Vincular',
    tiers: [
      { label: '3-hour limit', percent: 0, resetText: 'No vinculado' },
      { label: 'GPT-4o Daily', percent: 0, resetText: 'No vinculado' },
      { label: 'o3-mini Weekly', percent: 0, resetText: 'No vinculado' },
    ],
  };
}

module.exports = {
  getAntigravityRealUsage,
  fetchLiveAntigravityUsage,
  getClaudeRealUsage,
  getOpenAIRealUsage,
};
