const { app, BrowserWindow, screen, ipcMain, globalShortcut, Menu, Tray, nativeImage, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const { getAntigravityRealUsage, fetchLiveAntigravityUsage } = require('./quotaReader.cjs');
const {
  loadStoredCredentials,
  saveStoredCredentials,
  fetchAllRealAccountQuotas,
  validateAndFetchClaude,
  validateAndFetchOpenAI,
  validateAndFetchOpenRouter,
  validateAndFetchDeepSeek,
  executeRealClaudePrompt,
  executeRealOpenAIPrompt,
  dispatchMultiAgentWorkflow,
  generateIntelligentLocalResponse,
  scanWorkspaceContext,
  buildDeveloperSystemPrompt,
  executeArenaPrompt,
  optimizePromptStudio,
  diagnoseErrorTrace,
  analyzePromptComplexity,
} = require('./accountProviders.cjs');

app.name = 'SideNotch';

// Enable GPU rasterization for smooth 120Hz rendering
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

let mainWindow = null;
let settingsWindow = null;
let tray = null;
let currentNotchPosition = 'top-right';

function performNativeScreenCapture() {
  exec('screencapture -i -c', (error) => {
    if (!error && mainWindow) {
      mainWindow.webContents.send('snip-completed');
    }
  });
}

function openSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    if (settingsWindow.isMinimized()) settingsWindow.restore();
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 980,
    height: 660,
    minWidth: 860,
    minHeight: 580,
    title: 'SideNotch - AI Command Center & Dashboard',
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundColor: '#00000000',
    trafficLightPosition: { x: 16, y: 16 },
    resizable: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    settingsWindow.loadURL('http://localhost:5173#dashboard');
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'dashboard' });
  }

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
    settingsWindow.focus();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

ipcMain.on('open-dashboard', () => {
  openSettingsWindow();
});
ipcMain.handle('open-dashboard', () => {
  openSettingsWindow();
  return { success: true };
});

// IPC handlers for real AI Account Providers & Live Quotas
ipcMain.handle('get-real-quotas', async () => {
  return await fetchAllRealAccountQuotas();
});

ipcMain.handle('get-credentials', () => {
  return loadStoredCredentials();
});

ipcMain.handle('save-and-test-credentials', async (event, creds) => {
  if (creds) {
    saveStoredCredentials(creds);
  }
  const result = await fetchAllRealAccountQuotas();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('quotas-updated', result);
  }
  return result;
});

ipcMain.handle('test-single-provider', async (event, { provider, apiKey }) => {
  if (provider === 'claude') return await validateAndFetchClaude(apiKey);
  if (provider === 'openai') return await validateAndFetchOpenAI(apiKey);
  if (provider === 'openrouter') return await validateAndFetchOpenRouter(apiKey);
  if (provider === 'deepseek') return await validateAndFetchDeepSeek(apiKey);
  return { isLinked: false, error: 'Proveedor desconocido' };
});

// Real Multi-Agent Execution Handlers
ipcMain.handle('dispatch-multiagent-task', async (event, { agents, prompt, workspace }) => {
  return await dispatchMultiAgentWorkflow(agents, prompt, workspace);
});

ipcMain.handle('execute-single-agent', async (event, { agent, prompt, workspace }) => {
  const creds = loadStoredCredentials();
  if (agent.model.toLowerCase().includes('claude') && creds.claudeApiKey) {
    return await executeRealClaudePrompt(creds.claudeApiKey, prompt, `Eres ${agent.name} trabajando en ${workspace}.`);
  }
  if (agent.model.toLowerCase().includes('gpt') && creds.openaiApiKey) {
    return await executeRealOpenAIPrompt(creds.openaiApiKey, prompt, `Eres ${agent.name} trabajando en ${workspace}.`);
  }
  const dynamicResp = generateIntelligentLocalResponse(agent, prompt, workspace);
  return {
    success: true,
    text: dynamicResp,
    model: agent.model,
  };
});

// AI Arena Multi-Model Handler
ipcMain.handle('execute-arena-prompt', async (event, { prompt, workspace }) => {
  return await executeArenaPrompt(prompt, workspace);
});

// AI Prompt Studio Optimizer Handler
ipcMain.handle('optimize-prompt', async (event, { prompt, techStack }) => {
  return optimizePromptStudio(prompt, techStack);
});

// AI Error Explainer & Fixer Handler
ipcMain.handle('diagnose-error', async (event, { errorTrace, workspace }) => {
  return diagnoseErrorTrace(errorTrace, workspace);
});

// AI Prompt Complexity & Multi-Agent Auto-Routing Handler
ipcMain.handle('analyze-prompt-complexity', async (event, prompt) => {
  return analyzePromptComplexity(prompt);
});

// Expo / Metro Bundler Status Inspector
ipcMain.handle('check-expo-metro-status', async (event, port = 8081) => {
  const http = require('http');
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/status`, { timeout: 1500 }, (res) => {
      resolve({ isRunning: res.statusCode === 200, port, type: 'metro' });
    });
    req.on('error', () => {
      // Fallback check standard dev server port 5173
      const req5173 = http.get('http://localhost:5173', { timeout: 1200 }, (res2) => {
        resolve({ isRunning: res2.statusCode === 200, port: 5173, type: 'vite' });
      });
      req5173.on('error', () => {
        resolve({ isRunning: false, port, type: 'none' });
      });
    });
  });
});

// Native macOS Workspace Directory Dialog
ipcMain.handle('select-workspace-dialog', async () => {
  const win = settingsWindow || mainWindow;
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
    title: 'Seleccionar Carpeta del Proyecto / Workspace',
    defaultPath: os.homedir(),
    buttonLabel: 'Seleccionar Workspace',
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Workspace File Tree Inspector
ipcMain.handle('get-workspace-tree', async (event, dirPath) => {
  try {
    const target = dirPath || process.cwd();
    if (!fs.existsSync(target)) return [];
    const items = fs.readdirSync(target, { withFileTypes: true });
    return items.slice(0, 40).map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      path: path.join(target, item.name),
    }));
  } catch (err) {
    return [];
  }
});

// Workspace Deep Context Scanner (.agents, package.json, git, tech stack)
ipcMain.handle('get-workspace-context', async (event, dirPath) => {
  return scanWorkspaceContext(dirPath);
});

// Create .agents rule file in workspace
ipcMain.handle('create-agent-rule', async (event, { workspace, ruleName, content }) => {
  try {
    const target = workspace || process.cwd();
    const rulesDir = path.join(target, '.agents', 'rules');
    if (!fs.existsSync(rulesDir)) {
      fs.mkdirSync(rulesDir, { recursive: true });
    }
    const cleanName = ruleName.endsWith('.md') ? ruleName : `${ruleName}.md`;
    const filePath = path.join(rulesDir, cleanName);
    fs.writeFileSync(filePath, content || `# ${cleanName}\n\nReglas de desarrollo para el proyecto.`, 'utf8');
    return { success: true, filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Create .agents skill file in workspace
ipcMain.handle('create-agent-skill', async (event, { workspace, skillName, description, content }) => {
  try {
    const target = workspace || process.cwd();
    const skillDir = path.join(target, '.agents', 'skills', skillName);
    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }
    const skillMd = path.join(skillDir, 'SKILL.md');
    const fullContent = `---
name: ${skillName}
description: ${description || 'Habilidad de desarrollo especializada'}
---

# ${skillName}

${content || 'Instrucciones para este flujo de trabajo.'}
`;
    fs.writeFileSync(skillMd, fullContent, 'utf8');
    return { success: true, skillMd };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Read file from workspace
ipcMain.handle('read-workspace-file', async (event, filePath) => {
  try {
    if (!fs.existsSync(filePath)) return { success: false, error: 'Archivo no encontrado' };
    const stats = fs.statSync(filePath);
    if (stats.size > 200 * 1024) {
      return { success: false, error: 'Archivo demasiado grande para previsualizar (>200KB)' };
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return { success: true, content, extension: path.extname(filePath), size: stats.size };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Open Workspace Folder in macOS Finder
ipcMain.handle('open-in-finder', async (event, dirPath) => {
  try {
    const target = dirPath || process.cwd();
    shell.openPath(target);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Open Workspace in Visual Studio Code / Cursor
ipcMain.handle('open-in-editor', async (event, dirPath) => {
  try {
    const target = dirPath || process.cwd();
    exec(`code "${target}" || cursor "${target}"`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Get Workspace Git Status
ipcMain.handle('get-workspace-git-status', async (event, cwd) => {
  const target = cwd || process.cwd();
  return new Promise((resolve) => {
    exec('git status --porcelain -b', { cwd: target }, (err, stdout) => {
      if (err) {
        resolve({ isGit: false, branch: '', files: [] });
        return;
      }
      const lines = (stdout || '').trim().split('\n').filter(Boolean);
      let branch = 'main';
      const files = [];

      for (const line of lines) {
        if (line.startsWith('## ')) {
          branch = line.replace('## ', '').split('...')[0].trim();
        } else {
          const status = line.slice(0, 2).trim();
          const file = line.slice(3).trim();
          files.push({ status, file });
        }
      }
      resolve({ isGit: true, branch, files });
    });
  });
});

// Advanced GitFlow Visual Graph Generator
ipcMain.handle('get-git-graph', async (event, cwd) => {
  const target = cwd || process.cwd();
  return new Promise((resolve) => {
    exec('git log -n 35 --pretty=format:"%H|%h|%P|%D|%s|%an|%cr"', { cwd: target }, (err, stdout) => {
      if (err || !stdout) {
        resolve({ success: false, commits: [] });
        return;
      }

      const lines = stdout.trim().split('\n').filter(Boolean);
      const branchesMap = new Map();
      let nextLane = 0;

      const commits = lines.map((line, index) => {
        const [fullHash, hash, parentHashesStr, refsStr, message, author, timeAgo] = line.split('|');
        const parentHashes = (parentHashesStr || '').split(' ').filter(Boolean);
        const refs = (refsStr || '').split(',').map(r => r.trim()).filter(Boolean);

        // Determine lane & branch
        let branchName = 'main';
        if (refsStr && refsStr.includes('feature/')) {
          branchName = refsStr.match(/feature\/[a-zA-Z0-9_\-]+/)?.[0] || 'feature';
        } else if (refsStr && refsStr.includes('develop')) {
          branchName = 'develop';
        } else if (refsStr && refsStr.includes('hotfix/')) {
          branchName = refsStr.match(/hotfix\/[a-zA-Z0-9_\-]+/)?.[0] || 'hotfix';
        }

        if (!branchesMap.has(branchName)) {
          branchesMap.set(branchName, nextLane++);
        }
        const lane = branchesMap.get(branchName) % 4;

        return {
          id: hash,
          fullHash,
          parentHashes,
          refs,
          message: message || 'Commit sin mensaje',
          author: author || 'Autor',
          timeAgo: timeAgo || 'Reciente',
          branch: branchName,
          lane,
          index,
        };
      });

      resolve({ success: true, commits });
    });
  });
});

// Git Branches
ipcMain.handle('get-git-branches', async (event, cwd) => {
  const target = cwd || process.cwd();
  return new Promise((resolve) => {
    exec('git branch -a', { cwd: target }, (err, stdout) => {
      if (err) {
        resolve({ success: false, branches: [] });
        return;
      }
      const branches = (stdout || '')
        .split('\n')
        .map(b => b.trim())
        .filter(Boolean)
        .map(b => ({
          name: b.replace('* ', '').trim(),
          isCurrent: b.startsWith('* '),
          isRemote: b.startsWith('remotes/'),
        }));
      resolve({ success: true, branches });
    });
  });
});

// Git Checkout Branch
ipcMain.handle('git-checkout-branch', async (event, { branch, cwd }) => {
  const target = cwd || process.cwd();
  return new Promise((resolve) => {
    exec(`git checkout ${branch}`, { cwd: target }, (err, stdout, stderr) => {
      resolve({ success: !err, output: stdout || stderr });
    });
  });
});

// GitFlow: Start Feature Branch
ipcMain.handle('gitflow-start-feature', async (event, { featureName, cwd }) => {
  const target = cwd || process.cwd();
  const safeName = featureName.toLowerCase().replace(/[^a-z0-9_\-]/g, '-');
  const branchName = `feature/${safeName}`;
  return new Promise((resolve) => {
    exec(`git checkout -b ${branchName}`, { cwd: target }, (err, stdout, stderr) => {
      resolve({ success: !err, branch: branchName, output: stdout || stderr });
    });
  });
});

// GitFlow: Finish Feature Branch
ipcMain.handle('gitflow-finish-feature', async (event, { featureBranch, targetBranch, cwd }) => {
  const target = cwd || process.cwd();
  const base = targetBranch || 'main';
  return new Promise((resolve) => {
    exec(`git checkout ${base} && git merge --no-ff ${featureBranch} -m "merge: integrate ${featureBranch} into ${base}"`, { cwd: target }, (err, stdout, stderr) => {
      resolve({ success: !err, output: stdout || stderr });
    });
  });
});

// GitFlow: Generate Release & Tag
ipcMain.handle('gitflow-create-release', async (event, { versionTag, cwd }) => {
  const target = cwd || process.cwd();
  const tag = versionTag.startsWith('v') ? versionTag : `v${versionTag}`;
  return new Promise((resolve) => {
    exec(`git tag -a ${tag} -m "Release ${tag}"`, { cwd: target }, (err, stdout, stderr) => {
      resolve({ success: !err, tag, output: stdout || stderr });
    });
  });
});

// Export Session Markdown
ipcMain.handle('export-session-markdown', async (event, { content, filename }) => {
  try {
    const exportDir = path.join(os.homedir(), '.sidenotch', 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    const targetFile = path.join(exportDir, filename || `session-${Date.now()}.md`);
    fs.writeFileSync(targetFile, content, 'utf8');
    return { success: true, filePath: targetFile };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Scratchpad Handlers
ipcMain.handle('get-scratchpad', async () => {
  try {
    const scratchpadFile = path.join(os.homedir(), '.sidenotch', 'scratchpad.md');
    if (!fs.existsSync(scratchpadFile)) {
      const defaultScratchpad = `# Scratchpad de Desarrollo
Notas, snippets de codigo y arquitectura compartida con los agentes de SideNotch.

- [x] Workspace activo conectado
- [ ] Implementar nuevas funciones
`;
      const dir = path.dirname(scratchpadFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(scratchpadFile, defaultScratchpad, 'utf8');
      return defaultScratchpad;
    }
    return fs.readFileSync(scratchpadFile, 'utf8');
  } catch (err) {
    return '# Scratchpad\n\nError al cargar notas.';
  }
});

ipcMain.handle('save-scratchpad', async (event, content) => {
  try {
    const scratchpadFile = path.join(os.homedir(), '.sidenotch', 'scratchpad.md');
    const dir = path.dirname(scratchpadFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(scratchpadFile, content, 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// NPM Audit Inspector
ipcMain.handle('run-npm-audit', async (event, cwd) => {
  const target = cwd || process.cwd();
  return new Promise((resolve) => {
    exec('npm audit --json', { cwd: target }, (err, stdout, stderr) => {
      try {
        const parsed = JSON.parse(stdout || '{}');
        const vulns = parsed.metadata?.vulnerabilities || { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 };
        resolve({
          success: true,
          vulnerabilities: vulns,
          total: vulns.total || 0,
        });
      } catch {
        resolve({
          success: false,
          error: stderr || 'No se pudo analizar el informe de auditoria',
          total: 0,
        });
      }
    });
  });
});

// Execute terminal command in workspace
ipcMain.handle('run-workspace-command', async (event, { command, cwd }) => {
  return new Promise((resolve) => {
    exec(command, { cwd: cwd || process.cwd() }, (err, stdout, stderr) => {
      resolve({
        success: !err,
        stdout: stdout || '',
        stderr: stderr || (err ? err.message : ''),
      });
    });
  });
});

ipcMain.on('trigger-native-screencapture', () => {
  performNativeScreenCapture();
});

ipcMain.on('open-settings', () => {
  openSettingsWindow();
});

ipcMain.on('quit-app', () => {
  app.quit();
});

ipcMain.on('force-quit-app', () => {
  app.exit(0);
});

const SETTINGS_DIR = path.join(os.homedir(), '.sidenotch');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');

const DEFAULT_FULL_STATE = {
  config: {
    launchAtLogin: true,
    showInDock: true,
    autoHide: true,
    notchPosition: 'top-right',
    shutterSound: true,
    blurIntensity: 85,
    autoRefillAlerts: true,
  },
  agents: [
    {
      id: 'agent-gemini',
      name: 'Gemini Engine',
      role: 'Arquitecto de Software & Desarrollo',
      model: 'Gemini 3.7 Pro',
      status: 'idle',
      currentTask: '',
      avatarColor: 'from-emerald-400 to-lime-500',
      assignedWorkspace: '',
      memoryUsage: 'Activo',
      temperature: 0.2,
    },
    {
      id: 'agent-claude',
      name: 'Claude Engine',
      role: 'Implementación TypeScript & React',
      model: 'Claude 3.7 Sonnet',
      status: 'idle',
      currentTask: '',
      avatarColor: 'from-amber-400 to-orange-500',
      assignedWorkspace: '',
      memoryUsage: 'Activo',
      temperature: 0.3,
    },
    {
      id: 'agent-openai',
      name: 'OpenAI Engine',
      role: 'Validación QA & Lógica',
      model: 'GPT-4o / o3-mini',
      status: 'idle',
      currentTask: '',
      avatarColor: 'from-teal-400 to-emerald-600',
      assignedWorkspace: '',
      memoryUsage: 'Activo',
      temperature: 0.1,
    },
    {
      id: 'agent-deepseek',
      name: 'DeepSeek Engine',
      role: 'Auditoría & Optimización',
      model: 'DeepSeek-V3',
      status: 'idle',
      currentTask: '',
      avatarColor: 'from-sky-400 to-blue-600',
      assignedWorkspace: '',
      memoryUsage: 'Activo',
      temperature: 0.1,
    },
  ],
  tasks: [],
};

function loadPersistedState() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        config: { ...DEFAULT_FULL_STATE.config, ...(parsed.config || parsed) },
        agents: Array.isArray(parsed.agents) && parsed.agents.length > 0 ? parsed.agents : DEFAULT_FULL_STATE.agents,
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      };
    }
  } catch (err) {
    console.error('Error reading persisted state:', err);
  }
  return DEFAULT_FULL_STATE;
}

function savePersistedState(fullState) {
  try {
    if (!fs.existsSync(SETTINGS_DIR)) {
      fs.mkdirSync(SETTINGS_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(fullState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing persisted state:', err);
  }
}

// Initial settings load
const persistedState = loadPersistedState();
if (persistedState.config && persistedState.config.notchPosition) {
  currentNotchPosition = persistedState.config.notchPosition;
}

ipcMain.handle('get-full-state', () => {
  return loadPersistedState();
});

ipcMain.handle('get-settings', () => {
  return loadPersistedState().config;
});

ipcMain.on('save-full-state', (event, fullState) => {
  if (fullState) {
    savePersistedState(fullState);
    if (fullState.config && fullState.config.notchPosition) {
      currentNotchPosition = fullState.config.notchPosition;
      repositionMainWindow();
    }
  }
});

ipcMain.on('save-settings', (event, newSettings) => {
  if (newSettings) {
    const current = loadPersistedState();
    current.config = { ...current.config, ...newSettings };
    savePersistedState(current);
    if (newSettings.notchPosition) {
      currentNotchPosition = newSettings.notchPosition;
    }
  }
  repositionMainWindow();
});

function repositionMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const windowWidth = 480;
    const windowHeight = 520;
    const windowX = screenWidth - windowWidth;
    let windowY = 32;

    if (currentNotchPosition === 'center-right') {
      windowY = Math.max(32, Math.round((screenHeight - windowHeight) / 2));
    } else {
      windowY = 32;
    }

    mainWindow.setPosition(windowX, windowY, true);
    mainWindow.webContents.send('settings-updated', loadPersistedState().config);
  }
}

// Dynamic mouse pass-through: When mouse is outside the active notch/card, forward clicks to background apps
ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && !win.isDestroyed()) {
    win.setIgnoreMouseEvents(ignore, options || { forward: true });
  }
});

function createSystemTray() {
  try {
    // Generate a clean 16x16 status bar template icon
    const canvas = `
      <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="12" height="12" rx="4" fill="black"/>
        <circle cx="8" cy="8" r="2.5" fill="white"/>
      </svg>
    `;
    const icon = nativeImage.createFromBuffer(Buffer.from(canvas));
    icon.setTemplateImage(true);

    tray = new Tray(icon);
    tray.setToolTip('SideNotch - Dynamic AI Quotas');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'SideNotch Activo (79% Gemini)',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Abrir Ajustes...',
        click() {
          openSettingsWindow();
        },
      },
      {
        label: 'Captura Snipaste (⌥S)',
        click() {
          performNativeScreenCapture();
        },
      },
      { type: 'separator' },
      {
        label: 'Reiniciar SideNotch',
        click() {
          app.relaunch();
          app.exit(0);
        },
      },
      {
        label: 'Forzar Salida (Cerrar)',
        accelerator: 'CmdOrCtrl+Q',
        click() {
          app.exit(0);
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
  } catch (err) {
    console.error('Tray creation error:', err);
  }
}

function setupApplicationMenu() {
  const template = [
    {
      label: 'SideNotch',
      submenu: [
        {
          label: 'Acerca de SideNotch',
          role: 'about',
        },
        { type: 'separator' },
        {
          label: 'Ajustes...',
          accelerator: 'CmdOrCtrl+,',
          click() {
            openSettingsWindow();
          },
        },
        {
          label: 'Capturar Pantalla (⌥S)',
          accelerator: 'Alt+S',
          click() {
            performNativeScreenCapture();
          },
        },
        { type: 'separator' },
        {
          label: 'Ocultar SideNotch',
          role: 'hide',
        },
        {
          label: 'Ocultar Otros',
          role: 'hideOthers',
        },
        {
          label: 'Mostrar Todo',
          role: 'unhide',
        },
        { type: 'separator' },
        {
          label: 'Forzar Salida de SideNotch',
          accelerator: 'CmdOrCtrl+Q',
          click() {
            app.exit(0);
          },
        },
      ],
    },
    {
      label: 'Edición',
      submenu: [
        { role: 'undo', label: 'Deshacer' },
        { role: 'redo', label: 'Rehacer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Pegar' },
        { role: 'selectAll', label: 'Seleccionar todo' },
      ],
    },
    {
      label: 'Ventana',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Cerrar' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  const windowWidth = 480;
  const windowHeight = 520;
  const windowX = screenWidth - windowWidth;
  const windowY = 32;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: windowX,
    y: windowY,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    focusable: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
    },
  });

  if (process.platform === 'darwin') {
    if (app.dock) {
      app.dock.show();
    }
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    mainWindow.setAlwaysOnTop(true, 'floating', 1);

    // Enable full clickability on the notch overlay
    mainWindow.setIgnoreMouseEvents(false);

    const dockMenu = Menu.buildFromTemplate([
      {
        label: 'Abrir Ajustes de SideNotch...',
        click() {
          openSettingsWindow();
        },
      },
      {
        label: 'Captura Snipaste (⌥S)',
        click() {
          performNativeScreenCapture();
        },
      },
      { type: 'separator' },
      {
        label: 'Reiniciar SideNotch',
        click() {
          app.relaunch();
          app.exit(0);
        },
      },
      {
        label: 'Forzar Salida (⌘Q)',
        click() {
          app.exit(0);
        },
      },
    ]);
    app.dock.setMenu(dockMenu);
  } else {
    mainWindow.setAlwaysOnTop(true, 'floating');
  }

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Global hotkey Option+S for Snipaste
  globalShortcut.register('Alt+S', () => {
    performNativeScreenCapture();
  });

  // Watch Antigravity directory for live instant quota updates
  try {
    const antigravityDir = path.join(os.homedir(), '.gemini', 'antigravity-ide');
    if (fs.existsSync(antigravityDir)) {
      fs.watch(antigravityDir, { recursive: true }, async () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          const quotas = await fetchAllRealQuotas();
          mainWindow.webContents.send('quotas-updated', quotas);
        }
      });
    }
  } catch (err) {
    console.error('Error setting up file watcher:', err);
  }

  // Periodic live check every 2.5 seconds
  const quotaInterval = setInterval(async () => {
    try {
      const quotas = await fetchAllRealAccountQuotas();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('quotas-updated', quotas);
      }
      if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.webContents.send('quotas-updated', quotas);
      }
    } catch (err) {
      console.error('Error in periodic quota check:', err);
    }
  }, 2500);

  mainWindow.on('closed', () => {
    clearInterval(quotaInterval);
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupApplicationMenu();
  createSystemTray();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
