const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

// Runs prompts through the official CLIs so they are billed to the user's own
// subscriptions: Claude Code (Claude Pro/Max) and Gemini CLI (Google AI Pro).

const HOME = os.homedir();
const RUN_TIMEOUT_MS = 3 * 60 * 1000;

function isExecutable(file) {
  try {
    fs.accessSync(file, fs.constants.X_OK);
    return fs.statSync(file).isFile();
  } catch {
    return false;
  }
}

function newestMatch(dir, prefix, relativeBinary) {
  try {
    const versions = fs.readdirSync(dir)
      .filter(name => name.startsWith(prefix))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    for (const version of versions) {
      const file = path.join(dir, version, relativeBinary);
      if (isExecutable(file)) return file;
    }
  } catch {}
  return null;
}

let claudeBinary;
function findClaudeBinary() {
  if (claudeBinary !== undefined) return claudeBinary;
  const direct = [
    path.join(HOME, '.local/bin/claude'),
    path.join(HOME, '.claude/local/claude'),
    '/opt/homebrew/bin/claude',
    '/usr/local/bin/claude',
  ].find(isExecutable);
  // Otherwise use the copy bundled with the Claude Code editor extension.
  const bundled = ['.antigravity-ide', '.vscode', '.cursor', '.windsurf']
    .map(editor => newestMatch(path.join(HOME, editor, 'extensions'), 'anthropic.claude-code-', 'resources/native-binary/claude'))
    .find(Boolean);
  claudeBinary = direct || bundled || null;
  return claudeBinary;
}

let geminiBinary;
function findGeminiBinary() {
  if (geminiBinary !== undefined) return geminiBinary;
  const candidates = [
    '/opt/homebrew/bin/gemini',
    '/usr/local/bin/gemini',
    path.join(HOME, '.npm-global/bin/gemini'),
  ];
  const nvmDir = path.join(HOME, '.nvm/versions/node');
  try {
    for (const version of fs.readdirSync(nvmDir).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))) {
      candidates.push(path.join(nvmDir, version, 'bin/gemini'));
    }
  } catch {}
  geminiBinary = candidates.find(isExecutable) || null;
  return geminiBinary;
}

function runProcess(binary, args, cwd) {
  if (process.env.SIDENOTCH_DISABLE_SUBSCRIPTIONS === '1') {
    return Promise.resolve({ code: -1, stdout: '', stderr: 'Suscripciones desactivadas (SIDENOTCH_DISABLE_SUBSCRIPTIONS)' });
  }
  return new Promise((resolve) => {
    const env = { ...process.env };
    // Never fall back to pay-per-use keys, and don't leak Electron's node mode.
    delete env.ANTHROPIC_API_KEY;
    delete env.GEMINI_API_KEY;
    delete env.ELECTRON_RUN_AS_NODE;
    // GUI apps get a minimal PATH; the Gemini CLI needs the `node` next to it.
    env.PATH = [path.dirname(binary), '/opt/homebrew/bin', '/usr/local/bin', env.PATH].filter(Boolean).join(':');

    const child = spawn(binary, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill('SIGTERM'), RUN_TIMEOUT_MS);
    child.stdout.on('data', (c) => { stdout += c; });
    child.stderr.on('data', (c) => { stderr += c; });
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: err.message });
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      resolve({ code: signal ? -1 : code, stdout, stderr: signal ? 'Tiempo de espera agotado' : stderr });
    });
  });
}

function resolveCwd(workspace) {
  return workspace && fs.existsSync(workspace) ? workspace : HOME;
}

function claudeModelAlias(modelName = '') {
  const m = modelName.toLowerCase();
  if (m.includes('opus')) return 'opus';
  if (m.includes('haiku')) return 'haiku';
  return 'sonnet';
}

async function runClaudeSubscription({ prompt, systemPrompt, workspace, model }) {
  const binary = findClaudeBinary();
  if (!binary) {
    return { success: false, error: 'Claude Code no está instalado. Instálalo e inicia sesión con tu cuenta de Claude.' };
  }
  const args = [
    '-p', prompt,
    '--model', claudeModelAlias(model),
    '--tools', '',
    '--output-format', 'json',
    '--no-session-persistence',
  ];
  if (systemPrompt) args.push('--append-system-prompt', systemPrompt);

  const res = await runProcess(binary, args, resolveCwd(workspace));
  let json = null;
  try { json = JSON.parse(res.stdout); } catch {}
  if (json && !json.is_error && typeof json.result === 'string') {
    return { success: true, text: json.result, model: `Claude ${claudeModelAlias(model)}`, source: 'subscription' };
  }
  const detail = json?.result || res.stderr.trim() || res.stdout.trim() || `código ${res.code}`;
  if (/log ?in|login|auth/i.test(detail)) {
    return { success: false, error: 'Claude Code no tiene sesión iniciada. Ábrelo y ejecuta /login.' };
  }
  return { success: false, error: `Claude: ${detail.slice(0, 300)}` };
}

async function runGeminiSubscription({ prompt, systemPrompt, workspace }) {
  const binary = findGeminiBinary();
  if (!binary) {
    return {
      success: false,
      error: 'Gemini CLI no está instalado. Ejecuta "npm install -g @google/gemini-cli" y luego "gemini" para iniciar sesión con tu cuenta de Google AI Pro.',
    };
  }
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  const res = await runProcess(binary, ['-p', fullPrompt, '--output-format', 'json'], resolveCwd(workspace));
  let json = null;
  try { json = JSON.parse(res.stdout); } catch {}
  if (json && typeof json.response === 'string' && !json.error) {
    return { success: true, text: json.response, model: 'Gemini', source: 'subscription' };
  }
  if (res.code === 0 && !json && res.stdout.trim()) {
    return { success: true, text: res.stdout.trim(), model: 'Gemini', source: 'subscription' };
  }
  const detail = json?.error?.message || res.stderr.trim() || `código ${res.code}`;
  if (/auth|login|credential/i.test(detail)) {
    return { success: false, error: 'Gemini CLI no tiene sesión iniciada. Ejecuta "gemini" en la terminal y elige "Login with Google".' };
  }
  return { success: false, error: `Gemini: ${detail.slice(0, 300)}` };
}

function getSubscriptionRunnersStatus() {
  return {
    claude: Boolean(findClaudeBinary()),
    gemini: Boolean(findGeminiBinary()),
  };
}

module.exports = {
  runClaudeSubscription,
  runGeminiSubscription,
  getSubscriptionRunnersStatus,
};
