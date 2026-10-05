const http = require('http');
const https = require('https');
const { execFile } = require('child_process');

// All percentages exposed by this module are "remaining" (100 = full, 0 = exhausted),
// so Gemini and Claude can be rendered with the same bars and colors.

function runCommand(file, args) {
  return new Promise((resolve) => {
    execFile(file, args, { timeout: 3000, maxBuffer: 4 * 1024 * 1024 }, (err, stdout) => {
      resolve(err ? '' : stdout.toString());
    });
  });
}

function formatResetText(resetTime) {
  if (!resetTime) return '';
  const diffMs = new Date(resetTime).getTime() - Date.now();
  if (Number.isNaN(diffMs)) return '';
  if (diffMs <= 0) return 'Se recarga en breve';
  const totalMins = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMins / 1440);
  const hours = Math.floor((totalMins % 1440) / 60);
  const mins = totalMins % 60;
  if (days > 0) return `Se recarga en ${days} d ${hours} h`;
  if (hours > 0) return `Se recarga en ${hours} h ${mins} min`;
  return `Se recarga en ${mins} min`;
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function requestJson({ protocol, port, hostname, path, method, headers, body, timeout = 2000 }) {
  return new Promise((resolve) => {
    const mod = protocol === 'http' ? http : https;
    const req = mod.request({
      hostname,
      port,
      path,
      method,
      headers,
      // The local language server uses a self-signed certificate.
      rejectUnauthorized: hostname !== '127.0.0.1',
      timeout,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, json });
      });
    });
    req.on('error', () => resolve({ status: 0, json: null }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, json: null });
    });
    if (body !== undefined) req.write(body);
    req.end();
  });
}

// ─── Antigravity (Gemini + Claude/GPT shared quota) ──────────────────────────

async function getLanguageServerCandidates() {
  const ps = await runCommand('ps', ['-ax', '-o', 'pid=,command=']);
  const candidates = [];
  for (const line of ps.split('\n')) {
    if (!line.includes('language_server')) continue;
    const pidMatch = line.trim().match(/^(\d+)/);
    if (!pidMatch) continue;
    const pid = pidMatch[1];
    const csrfMatch = line.match(/--csrf_token[= ]([^\s]+)/);

    const lsof = await runCommand('lsof', ['-nP', '-iTCP', '-sTCP:LISTEN', '-a', '-p', pid]);
    const ports = [...new Set([...lsof.matchAll(/:(\d+)\s/g)].map(m => parseInt(m[1], 10)))].filter(p => p > 0);

    candidates.push({ pid, csrf: csrfMatch ? csrfMatch[1] : undefined, ports });
  }
  return candidates;
}

function callLanguageServer(endpoint, method) {
  return requestJson({
    protocol: endpoint.tls ? 'https' : 'http',
    hostname: '127.0.0.1',
    port: endpoint.port,
    path: `/exa.language_server_pb.LanguageServerService/${method}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Connect-Protocol-Version': '1',
      ...(endpoint.csrf ? { 'X-Codeium-Csrf-Token': endpoint.csrf } : {}),
    },
    body: JSON.stringify({ metadata: endpoint.csrf ? { csrf_token: endpoint.csrf } : {} }),
  });
}

// Discovering the server (ps + lsof + port probing) is expensive, so the working
// endpoint is remembered and only re-discovered when it stops answering.
let antigravityEndpoint = null;

async function discoverAntigravityEndpoint() {
  for (const candidate of await getLanguageServerCandidates()) {
    for (const port of candidate.ports) {
      for (const tls of [true, false]) {
        const endpoint = { port, tls, csrf: candidate.csrf };
        const res = await callLanguageServer(endpoint, 'RetrieveUserQuotaSummary');
        if (res.status === 200 && res.json?.response?.groups) return endpoint;
      }
    }
  }
  return null;
}

function readBuckets(group) {
  const out = { fiveHour: null, fiveHourText: '', weekly: null, weeklyText: '' };
  for (const bucket of group.buckets || []) {
    const remaining = clampPercent((bucket.remainingFraction ?? 0) * 100);
    const text = formatResetText(bucket.resetTime);
    if (bucket.window === '5h' || bucket.bucketId?.endsWith('-5h')) {
      out.fiveHour = remaining;
      out.fiveHourText = text;
    } else if (bucket.window === 'weekly' || bucket.bucketId?.endsWith('-weekly')) {
      out.weekly = remaining;
      out.weeklyText = text;
    }
  }
  return out;
}

let cachedAntigravityUsage = {
  isLinked: false,
  error: 'Antigravity no detectado',
  plan: 'Antigravity',
  availableCredits: null,
  enableOverages: false,
  geminiModels: {
    fiveHourRemaining: 0,
    fiveHourRefreshText: 'Abre Antigravity para leer la cuota',
    weeklyRemaining: 0,
    weeklyRefreshText: 'Abre Antigravity para leer la cuota',
  },
  claudeGptModels: {
    fiveHourRemaining: 0,
    fiveHourRefreshText: '',
    weeklyRemaining: 0,
    weeklyRefreshText: '',
  },
};

let antigravityInFlight = null;

async function fetchLiveAntigravityUsageUncached() {
  let quotaRes = antigravityEndpoint ? await callLanguageServer(antigravityEndpoint, 'RetrieveUserQuotaSummary') : null;
  if (!quotaRes || quotaRes.status !== 200 || !quotaRes.json?.response?.groups) {
    antigravityEndpoint = await discoverAntigravityEndpoint();
    if (!antigravityEndpoint) {
      cachedAntigravityUsage = { ...cachedAntigravityUsage, isLinked: false, error: 'Antigravity no detectado' };
      return cachedAntigravityUsage;
    }
    quotaRes = await callLanguageServer(antigravityEndpoint, 'RetrieveUserQuotaSummary');
  }

  const statusRes = await callLanguageServer(antigravityEndpoint, 'GetUserStatus');
  const status = statusRes.json?.userStatus;

  let plan = cachedAntigravityUsage.plan;
  let credits = null;
  if (status) {
    if (status.userTier?.name) plan = status.userTier.name;
    else if (status.planStatus?.planInfo?.planName) plan = `${status.planStatus.planInfo.planName} Plan`;

    // Google One AI credits are only reported when the account actually has some.
    const amount = status.userTier?.availableCredits?.find(c => c.creditAmount !== undefined)?.creditAmount;
    if (amount !== undefined) credits = parseInt(amount, 10);
  }

  const gemini = { fiveHour: null, fiveHourText: '', weekly: null, weeklyText: '' };
  let thirdParty = { fiveHour: null, fiveHourText: '', weekly: null, weeklyText: '' };
  for (const group of quotaRes.json?.response?.groups || []) {
    if (group.displayName?.includes('Gemini')) Object.assign(gemini, readBuckets(group));
    else if (group.displayName?.includes('Claude') || group.displayName?.includes('GPT')) thirdParty = readBuckets(group);
  }

  cachedAntigravityUsage = {
    isLinked: true,
    plan,
    availableCredits: credits,
    enableOverages: credits !== null,
    geminiModels: {
      fiveHourRemaining: gemini.fiveHour ?? 100,
      fiveHourRefreshText: gemini.fiveHourText,
      weeklyRemaining: gemini.weekly ?? 100,
      weeklyRefreshText: gemini.weeklyText,
    },
    claudeGptModels: {
      fiveHourRemaining: thirdParty.fiveHour ?? 100,
      fiveHourRefreshText: thirdParty.fiveHourText,
      weeklyRemaining: thirdParty.weekly ?? 100,
      weeklyRefreshText: thirdParty.weeklyText,
    },
  };
  return cachedAntigravityUsage;
}

function fetchLiveAntigravityUsage() {
  // Avoid piling up requests when the poll interval is shorter than a slow discovery.
  if (!antigravityInFlight) {
    antigravityInFlight = fetchLiveAntigravityUsageUncached()
      .catch(() => cachedAntigravityUsage)
      .finally(() => { antigravityInFlight = null; });
  }
  return antigravityInFlight;
}

function getAntigravityRealUsage() {
  fetchLiveAntigravityUsage();
  return cachedAntigravityUsage;
}

// ─── Claude subscription (Pro / Max) via the Claude Code login ───────────────

const CLAUDE_REFRESH_MS = 60 * 1000;
const CLAUDE_PLAN_NAMES = { pro: 'Claude Pro', max: 'Claude Max', team: 'Claude Team', enterprise: 'Claude Enterprise' };

let cachedClaudeUsage = {
  isLinked: false,
  source: 'subscription',
  percent: 0,
  maxBadge: 'Sin Vincular',
  error: 'Inicia sesión en Claude Code',
  fiveHourPercent: 0,
  fiveHourResetText: 'Inicia sesión en Claude Code',
  weeklyPercent: 0,
  weeklyResetText: 'Inicia sesión en Claude Code',
};
let claudeFetchedAt = 0;
let claudeInFlight = null;

async function readClaudeCodeOAuth() {
  // Claude Code stores its login in the macOS Keychain under this service name.
  const raw = await runCommand('security', ['find-generic-password', '-s', 'Claude Code-credentials', '-w']);
  try {
    return JSON.parse(raw.trim()).claudeAiOauth || null;
  } catch {
    return null;
  }
}

function claudeError(maxBadge, error) {
  return {
    ...cachedClaudeUsage,
    isLinked: false,
    percent: 0,
    maxBadge,
    error,
    fiveHourResetText: error,
    weeklyResetText: error,
  };
}

async function fetchClaudeSubscriptionUsageUncached() {
  const oauth = await readClaudeCodeOAuth();
  if (!oauth?.accessToken) {
    return claudeError('Sin Vincular', 'Inicia sesión en Claude Code');
  }
  if (oauth.expiresAt && oauth.expiresAt < Date.now()) {
    return claudeError('Sesión caducada', 'Abre Claude Code para renovar la sesión');
  }

  const res = await requestJson({
    hostname: 'api.anthropic.com',
    port: 443,
    path: '/api/oauth/usage',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${oauth.accessToken}`,
      'anthropic-beta': 'oauth-2025-04-20',
      'User-Agent': 'SideNotch-Mac',
    },
    timeout: 5000,
  });

  if (res.status === 401) return claudeError('Sesión caducada', 'Abre Claude Code para renovar la sesión');
  if (res.status !== 200 || !res.json) {
    // Keep showing the last good numbers on transient network errors.
    if (cachedClaudeUsage.isLinked) return cachedClaudeUsage;
    return claudeError('Sin Conexión', res.status ? `HTTP ${res.status}` : 'Sin conexión con Anthropic');
  }

  const fiveHour = res.json.five_hour;
  const weekly = res.json.seven_day;
  const fiveHourRemaining = clampPercent(100 - (fiveHour?.utilization ?? 0));
  const weeklyRemaining = clampPercent(100 - (weekly?.utilization ?? 0));

  return {
    isLinked: true,
    source: 'subscription',
    percent: Math.min(fiveHourRemaining, weeklyRemaining),
    maxBadge: CLAUDE_PLAN_NAMES[oauth.subscriptionType] || 'Claude',
    fiveHourPercent: fiveHourRemaining,
    fiveHourResetText: formatResetText(fiveHour?.resets_at),
    weeklyPercent: weeklyRemaining,
    weeklyResetText: formatResetText(weekly?.resets_at),
  };
}

function fetchClaudeSubscriptionUsage() {
  if (Date.now() - claudeFetchedAt < CLAUDE_REFRESH_MS) return Promise.resolve(cachedClaudeUsage);
  if (!claudeInFlight) {
    claudeInFlight = fetchClaudeSubscriptionUsageUncached()
      .catch(() => cachedClaudeUsage)
      .then((usage) => {
        cachedClaudeUsage = usage;
        claudeFetchedAt = Date.now();
        return usage;
      })
      .finally(() => { claudeInFlight = null; });
  }
  return claudeInFlight;
}

function getClaudeRealUsage() {
  fetchClaudeSubscriptionUsage();
  return cachedClaudeUsage;
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
  fetchClaudeSubscriptionUsage,
  getOpenAIRealUsage,
};
