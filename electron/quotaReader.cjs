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
  plan: 'Buscando...',
  availableCredits: 0,
  enableOverages: false,
  geminiModels: {
    fiveHourRemaining: 100,
    fiveHourRefreshText: 'it will fully refresh in 4 hours, 59 minutes.',
    weeklyRemaining: 100,
    weeklyRefreshText: 'it will fully refresh in 3 days, 12 hours.',
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
        // Query User Status
        const userStatusResp = await queryLanguageServerRpc(
          port,
          tls,
          candidate.csrf,
          '/exa.language_server_pb.LanguageServerService/GetUserStatus',
          { metadata: candidate.csrf ? { csrf_token: candidate.csrf } : {} }
        );

        if (userStatusResp && userStatusResp.userStatus) {
          const status = userStatusResp.userStatus;
          const planInfo = status.planStatus?.planInfo;
          const planName = planInfo?.planName ? `${planInfo.planName} Plan` : 'Pro Plan';
          const credits = status.planStatus?.availablePromptCredits ?? status.planStatus?.monthlyPromptCredits ?? 500;

          const configs = status.cascadeModelConfigData?.clientModelConfigs || [];
          const geminiModel = configs.find(m => m.modelId?.includes('gemini-3.7') || m.modelId?.includes('gemini-pro')) || configs[0];
          const claudeModel = configs.find(m => m.modelId?.includes('claude-sonnet') || m.modelId?.includes('claude')) || null;
          const gptModel = configs.find(m => m.modelId?.includes('gpt-oss') || m.modelId?.includes('gpt')) || null;

          const gemini5h = geminiModel?.quotaInfo?.remainingFraction !== undefined
            ? Math.round(geminiModel.quotaInfo.remainingFraction * 100)
            : 100;
          const gemini5hText = geminiModel?.quotaInfo?.resetTime
            ? formatCountdown(new Date(geminiModel.quotaInfo.resetTime))
            : 'it will fully refresh in 4 hours, 59 minutes.';

          const claude5h = claudeModel?.quotaInfo?.remainingFraction !== undefined
            ? Math.round(claudeModel.quotaInfo.remainingFraction * 100)
            : 15;

          const gpt5h = gptModel?.quotaInfo?.remainingFraction !== undefined
            ? Math.round(gptModel.quotaInfo.remainingFraction * 100)
            : 0;

          cachedAntigravityUsage = {
            isLinked: true,
            plan: planName,
            availableCredits: credits,
            enableOverages: true,
            geminiModels: {
              fiveHourRemaining: gemini5h,
              fiveHourRefreshText: gemini5hText,
              weeklyRemaining: gemini5h,
              weeklyRefreshText: gemini5hText,
            },
            claudeGptModels: {
              fiveHourRemaining: claude5h,
              weeklyRemaining: claude5h,
            },
            gptModels: {
              fiveHourRemaining: gpt5h,
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
