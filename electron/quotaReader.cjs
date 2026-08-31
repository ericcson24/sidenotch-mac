const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { execSync } = require('child_process');

function getLanguageServerProcessInfo() {
  try {
    const ps = execSync('ps aux | grep language_server_macos_arm | grep -v grep', { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const lines = ps.trim().split('\n');
    for (const line of lines) {
      const tokenMatch = line.match(/--csrf_token\s+([a-zA-Z0-9-]+)/);
      const pidMatch = line.match(/\s+(\d+)\s+.*language_server_macos_arm/);
      if (tokenMatch && pidMatch) {
        const token = tokenMatch[1];
        const pid = pidMatch[1];
        const lsof = execSync(`lsof -a -p ${pid} -iTCP -sTCP:LISTEN -n -P`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
        const ports = [];
        for (const l of lsof.split('\n')) {
          const m = l.match(/:(\d+)\s+\(LISTEN\)/);
          if (m) ports.push(parseInt(m[1]));
        }
        if (ports.length > 0) {
          return { token, ports };
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

function queryLanguageServerRpc(port, token, endpointPath, bodyObj = {}) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: '127.0.0.1',
      port,
      path: endpointPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-codeium-csrf-token': token,
      },
      rejectUnauthorized: false,
      checkServerIdentity: () => undefined,
      timeout: 1500,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
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

let cachedAntigravityUsage = {
  isLinked: false,
  plan: 'Buscando...',
  availableCredits: 0,
  enableOverages: false,
  geminiModels: {
    fiveHourRemaining: 0,
    fiveHourRefreshText: 'Conectando con Antigravity LanguageServer...',
    weeklyRemaining: 0,
    weeklyRefreshText: 'Conectando con Antigravity LanguageServer...',
  },
  claudeGptModels: {
    fiveHourRemaining: 0,
    weeklyRemaining: 0,
  },
};

async function fetchLiveAntigravityUsage() {
  const lsInfo = getLanguageServerProcessInfo();
  if (lsInfo && lsInfo.ports.length > 0) {
    for (const port of lsInfo.ports) {
      // 1. Query User Status (for plan and credits)
      const userStatusResp = await queryLanguageServerRpc(port, lsInfo.token, '/exa.language_server_pb.LanguageServerService/GetUserStatus', {
        metadata: { csrf_token: lsInfo.token },
      });

      // 2. Query Quota Summary (for live bucket quotas)
      const quotaSummaryResp = await queryLanguageServerRpc(port, lsInfo.token, '/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary', {});

      if (userStatusResp && userStatusResp.userStatus) {
        const userStatus = userStatusResp.userStatus;
        const tier = userStatus.userTier;
        const credits = tier?.availableCredits?.[0]?.creditAmount ? parseInt(tier.availableCredits[0].creditAmount) : 0;
        const planName = tier?.name || 'Google AI Pro';

        let geminiWeekly = 0;
        let geminiWeeklyText = 'it will fully refresh in 3 days, 12 hours.';
        let gemini5h = 0;
        let gemini5hText = 'it will fully refresh in 4 hours, 59 minutes.';
        let claudeWeekly = 0;
        let claude5h = 0;

        if (quotaSummaryResp && quotaSummaryResp.response && quotaSummaryResp.response.groups) {
          for (const group of quotaSummaryResp.response.groups) {
            if (group.displayName?.includes('Gemini')) {
              for (const bucket of group.buckets || []) {
                if (bucket.window === 'weekly' || bucket.bucketId === 'gemini-weekly') {
                  geminiWeekly = Math.round((bucket.remainingFraction ?? 0) * 100);
                  if (bucket.description) geminiWeeklyText = bucket.description;
                } else if (bucket.window === '5h' || bucket.bucketId === 'gemini-5h') {
                  gemini5h = Math.round((bucket.remainingFraction ?? 0) * 100);
                  if (bucket.description) gemini5hText = bucket.description;
                  else if (bucket.resetTime) gemini5hText = formatCountdown(new Date(bucket.resetTime));
                }
              }
            } else if (group.displayName?.includes('Claude') || group.displayName?.includes('GPT')) {
              for (const bucket of group.buckets || []) {
                if (bucket.window === 'weekly' || bucket.bucketId === '3p-weekly') {
                  claudeWeekly = Math.round((bucket.remainingFraction ?? 0) * 100);
                } else if (bucket.window === '5h' || bucket.bucketId === '3p-5h') {
                  claude5h = Math.round((bucket.remainingFraction ?? 0) * 100);
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
