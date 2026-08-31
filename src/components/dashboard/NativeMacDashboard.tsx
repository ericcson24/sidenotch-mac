import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../../utils/soundEffects';

type DashboardTab = 'console' | 'arena' | 'swarm' | 'debugger' | 'code-viewer' | 'git-manager' | 'scratchpad' | 'agents-context' | 'models' | 'linking' | 'tasks' | 'settings';

interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  status: 'idle' | 'running' | 'completed' | 'paused';
  currentTask: string;
  avatarColor: string;
  assignedWorkspace: string;
  memoryUsage: string;
  temperature: number;
}

interface TaskItem {
  id: string;
  title: string;
  assignedAgentId: string;
  status: 'pending' | 'in-progress' | 'done';
  timestamp: string;
  logs: string[];
}

interface SavedConfig {
  launchAtLogin: boolean;
  showInDock: boolean;
  autoHide: boolean;
  notchPosition: 'top-right' | 'center-right';
  shutterSound: boolean;
  blurIntensity: number;
  autoRefillAlerts: boolean;
}

interface AccountCredentials {
  claudeApiKey: string;
  openaiApiKey: string;
  deepseekApiKey: string;
  openrouterApiKey: string;
}

interface WorkspaceContextData {
  path: string;
  folderName: string;
  techStack: string;
  packageJson: { name?: string; version?: string; dependencies?: Record<string, string>; scripts?: Record<string, string> } | null;
  totalFiles: number;
  filesList: { name: string; isDirectory: boolean; path: string }[];
  agentsCustomizations: {
    hasAgentsDir: boolean;
    skills: { name: string; description: string }[];
    rules: { name: string; preview: string }[];
  };
  contextSummary: string;
}

interface GitFileInfo {
  status: string;
  file: string;
}

interface GitCommitNode {
  id: string;
  fullHash: string;
  parentHashes: string[];
  refs: string[];
  message: string;
  author: string;
  timeAgo: string;
  branch: string;
  lane: number;
  index: number;
}

interface GitBranchItem {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
}

interface ArenaResult {
  modelId: string;
  modelName: string;
  provider: string;
  color: string;
  isRealAPI: boolean;
  latencyMs: number;
  text: string;
  tokenEstimate: number;
}

const DEFAULT_CONFIG: SavedConfig = {
  launchAtLogin: true,
  showInDock: true,
  autoHide: true,
  notchPosition: 'top-right',
  shutterSound: true,
  blurIntensity: 85,
  autoRefillAlerts: true,
};

// Swimlane Lane Colors for Git Graph
const LANE_COLORS = ['#30d158', '#bf5af2', '#ff9f0a', '#ff453a', '#00d2ff', '#ffd60a'];

// Clean Circular Progress Gauge
const MetricRing: React.FC<{ percent: number; color?: string; size?: number }> = ({
  percent,
  color = '#30d158',
  size = 32,
}) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.min(100, Math.max(0, percent));
  const offset = circumference - (circumference * safePercent) / 100;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
    </div>
  );
};

export const NativeMacDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('console');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [config, setConfig] = useState<SavedConfig>(DEFAULT_CONFIG);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-gemini');

  // Auto Multi-Agent Swarm Mode ('auto' | 'single' | 'swarm')
  const [agentDispatchMode, setAgentDispatchMode] = useState<'auto' | 'single' | 'swarm'>('auto');
  const [isComplexityDetected, setIsComplexityDetected] = useState<boolean>(false);

  // Mobile Simulator & Expo Inspector State
  const [showMobileSimulator, setShowMobileSimulator] = useState<boolean>(false);
  const [simulatorDevice, setSimulatorDevice] = useState<'iphone-16' | 'pixel-8' | 'ipad'>('iphone-16');
  const [simulatorOrientation, setSimulatorOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [simulatorUrl, setSimulatorUrl] = useState<string>('http://localhost:8081');
  const [metroStatus, setMetroStatus] = useState<{ isRunning: boolean; port: number; type: string }>({ isRunning: false, port: 8081, type: 'none' });
  const [iframeKey, setIframeKey] = useState<number>(1);

  // Workspace Path & Deep Context (.agents, package.json, stack)
  const [currentWorkspace, setCurrentWorkspace] = useState<string>('/Users/eric/Desktop/Applicacion Sidebar');
  const [workspaceContext, setWorkspaceContext] = useState<WorkspaceContextData | null>(null);

  // Quick Command Palette (Cmd + K)
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [paletteQuery, setPaletteQuery] = useState<string>('');

  // AI Arena State
  const [arenaPrompt, setArenaPrompt] = useState<string>('');
  const [isExecutingArena, setIsExecutingArena] = useState<boolean>(false);
  const [arenaResults, setArenaResults] = useState<ArenaResult[]>([]);
  const [arenaExecutionTime, setArenaExecutionTime] = useState<number>(0);

  // AI Error Explainer State
  const [errorInput, setErrorInput] = useState<string>('');
  const [errorDiagnosis, setErrorDiagnosis] = useState<{ affectedFile: string; lineNumber: string; summary: string; explanation: string; recommendedFix: string } | null>(null);

  // Code Viewer State
  const [selectedFileForViewer, setSelectedFileForViewer] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Scratchpad State
  const [scratchpadText, setScratchpadText] = useState<string>('');
  const [isSavingScratchpad, setIsSavingScratchpad] = useState<boolean>(false);

  // Advanced GitFlow & Git Graph State
  const [gitStatus, setGitStatus] = useState<{ isGit: boolean; branch: string; files: GitFileInfo[] }>({
    isGit: true,
    branch: 'main',
    files: [],
  });
  const [gitCommits, setGitCommits] = useState<GitCommitNode[]>([]);
  const [gitBranches, setGitBranches] = useState<GitBranchItem[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<GitCommitNode | null>(null);
  const [commitMessage, setCommitMessage] = useState<string>('');
  const [isGeneratingCommit, setIsGeneratingCommit] = useState<boolean>(false);

  // GitFlow Feature & Release Modals
  const [newFeatureName, setNewFeatureName] = useState<string>('');
  const [isStartingFeature, setIsStartingFeature] = useState<boolean>(false);
  const [newReleaseTag, setNewReleaseTag] = useState<string>('');
  const [isCreatingRelease, setIsCreatingRelease] = useState<boolean>(false);

  // New Rule creation modal state
  const [newRuleName, setNewRuleName] = useState<string>('');
  const [newRuleContent, setNewRuleContent] = useState<string>('');
  const [isCreatingRule, setIsCreatingRule] = useState<boolean>(false);

  // Multi-agent selection for Swarm execution
  const [selectedSwarmAgentIds, setSelectedSwarmAgentIds] = useState<string[]>(['agent-gemini', 'agent-claude', 'agent-openai']);
  const [swarmPrompt, setSwarmPrompt] = useState<string>('');
  const [isExecutingSwarm, setIsExecutingSwarm] = useState<boolean>(false);
  const [swarmProgressLogs, setSwarmProgressLogs] = useState<string[]>([]);

  // Credentials State
  const [credentials, setCredentials] = useState<AccountCredentials>({
    claudeApiKey: '',
    openaiApiKey: '',
    deepseekApiKey: '',
    openrouterApiKey: '',
  });

  const [providerStatuses, setProviderStatuses] = useState<{
    claude?: { isLinked: boolean; percent: number; error?: string; maxBadge?: string };
    openai?: { isLinked: boolean; percent: number; error?: string; maxBadge?: string };
    deepseek?: { isLinked: boolean; balance?: string; error?: string };
    openrouter?: { isLinked: boolean; credits?: number; error?: string };
  }>({});

  const [isTestingProvider, setIsTestingProvider] = useState<string | null>(null);

  // Live Telemetry straight from Antigravity & linked APIs
  const [realQuotas, setRealQuotas] = useState<{
    geminiFiveHour: number;
    geminiFiveHourText: string;
    geminiWeekly: number;
    geminiWeeklyText: string;
    credits: number;
    plan: string;
    enableOverages: boolean;
    claudeFiveHour: number;
    claudeWeekly: number;
    gptFiveHour: number;
    claudeLinked: boolean;
    openaiLinked: boolean;
    deepseekLinked: boolean;
    openrouterLinked: boolean;
  }>({
    geminiFiveHour: 99,
    geminiFiveHourText: 'Recarga en 4 horas, 59 minutos.',
    geminiWeekly: 17,
    geminiWeeklyText: 'Recarga en 3 dias, 12 horas.',
    credits: 2016,
    plan: 'Google AI Pro',
    enableOverages: true,
    claudeFiveHour: 100,
    claudeWeekly: 100,
    gptFiveHour: 100,
    claudeLinked: false,
    openaiLinked: false,
    deepseekLinked: false,
    openrouterLinked: false,
  });

  // Prompt Chat
  const [promptInput, setPromptInput] = useState<string>('');
  const [isSendingPrompt, setIsSendingPrompt] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string; isAgent: boolean; isSwarmBadge?: boolean }[]>([]);

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Check Metro / Expo Status
  const checkMetroStatus = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, p?: number) => Promise<{ isRunning: boolean; port: number; type: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('check-expo-metro-status');
          if (res) {
            setMetroStatus(res);
            if (res.isRunning && !simulatorUrl.includes(String(res.port))) {
              setSimulatorUrl(`http://localhost:${res.port}`);
            }
          }
        }
      } catch {
        // fallback
      }
    }
  }, [simulatorUrl]);

  // Real-time prompt complexity check as the user types
  useEffect(() => {
    const p = promptInput.toLowerCase();
    const isComplex = p.length > 35 && (
      p.includes('crear') || p.includes('diseñar') || p.includes('arquitectura') ||
      p.includes('refactor') || p.includes('fullstack') || p.includes('sistema') ||
      p.includes('componente') || p.includes('test') || p.includes('seguridad') ||
      p.includes('optimizar') || p.includes(' y ') || p.includes('implementa')
    );
    setIsComplexityDetected(isComplex);
  }, [promptInput]);

  // Load Scratchpad Content
  const loadScratchpad = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string) => Promise<string> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const content = await electron.ipcRenderer.invoke('get-scratchpad');
          if (content) setScratchpadText(content);
        }
      } catch (err) {
        console.error('Error loading scratchpad:', err);
      }
    }
  }, []);

  // Save Scratchpad Content
  const handleSaveScratchpad = async (text: string) => {
    setScratchpadText(text);
    setIsSavingScratchpad(true);
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, c: string) => Promise<unknown> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          await electron.ipcRenderer.invoke('save-scratchpad', text);
        }
      } catch (err) {
        console.error('Error saving scratchpad:', err);
      }
    }
    setTimeout(() => setIsSavingScratchpad(false), 600);
  };

  // Run AI Arena Execution
  const handleRunArena = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!arenaPrompt.trim() || isExecutingArena) return;

    setIsExecutingArena(true);
    sounds.playIslandExpand();

    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ results: ArenaResult[]; totalTimeMs: number }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('execute-arena-prompt', {
            prompt: arenaPrompt.trim(),
            workspace: currentWorkspace,
          });
          if (res && res.results) {
            setArenaResults(res.results);
            setArenaExecutionTime(res.totalTimeMs);
            sounds.playIslandExpand();
          }
        }
      } catch (err) {
        console.error('Arena error:', err);
      }
    }
    setIsExecutingArena(false);
  };

  // Run AI Error Diagnosis
  const handleDiagnoseError = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!errorInput.trim()) return;

    sounds.playHoverTick();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ affectedFile: string; lineNumber: string; summary: string; explanation: string; recommendedFix: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const diag = await electron.ipcRenderer.invoke('diagnose-error', {
            errorTrace: errorInput.trim(),
            workspace: currentWorkspace,
          });
          if (diag) {
            setErrorDiagnosis(diag);
            sounds.playIslandExpand();
          }
        }
      } catch (err) {
        console.error('Diagnostic error:', err);
      }
    }
  };

  // Prompt Optimizer (Enhance prompt)
  const handleOptimizePrompt = async () => {
    if (!promptInput.trim()) return;
    sounds.playHoverTick();

    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<string> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const enhanced = await electron.ipcRenderer.invoke('optimize-prompt', {
            prompt: promptInput.trim(),
            techStack: workspaceContext?.techStack || 'React + TypeScript',
          });
          if (enhanced) {
            setPromptInput(enhanced);
            sounds.playIslandExpand();
          }
        }
      } catch (err) {
        console.error('Optimize error:', err);
      }
    }
  };

  // Load Git Graph & Commits Visualizer
  const loadGitGraph = useCallback(async (dir: string) => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, p: string) => Promise<{ success: boolean; commits: GitCommitNode[] }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('get-git-graph', dir);
          if (res && res.commits) setGitCommits(res.commits);
        }
      } catch (err) {
        console.error('Error fetching git graph:', err);
      }
    }
  }, []);

  // Load Git Branches
  const loadGitBranches = useCallback(async (dir: string) => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, p: string) => Promise<{ success: boolean; branches: GitBranchItem[] }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('get-git-branches', dir);
          if (res && res.branches) setGitBranches(res.branches);
        }
      } catch (err) {
        console.error('Error fetching git branches:', err);
      }
    }
  }, []);

  // Load Git Status
  const loadGitStatus = useCallback(async (dir: string) => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, p: string) => Promise<{ isGit: boolean; branch: string; files: GitFileInfo[] }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('get-workspace-git-status', dir);
          if (res) setGitStatus(res);
        }
      } catch (err) {
        console.error('Error fetching git status:', err);
      }
    }
    loadGitGraph(dir);
    loadGitBranches(dir);
  }, [loadGitGraph, loadGitBranches]);

  // Load Deep Workspace Context (.agents, package.json, tech stack)
  const loadWorkspaceDeepContext = useCallback(async (dirPath: string) => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, p: string) => Promise<WorkspaceContextData> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const ctx = await electron.ipcRenderer.invoke('get-workspace-context', dirPath);
          if (ctx) setWorkspaceContext(ctx);
        }
      } catch (err) {
        console.error('Error loading workspace context:', err);
      }
    }
    loadGitStatus(dirPath);
    checkMetroStatus();
  }, [loadGitStatus, checkMetroStatus]);

  // Read File Content for Code Viewer
  const handleOpenFileInViewer = async (filePath: string) => {
    sounds.playHoverTick();
    setSelectedFileForViewer(filePath);
    setIsLoadingFile(true);
    setActiveTab('code-viewer');

    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, p: string) => Promise<{ success: boolean; content?: string; error?: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('read-workspace-file', filePath);
          if (res && res.success && res.content !== undefined) {
            setFileContent(res.content);
          } else {
            setFileContent(`// Error: ${res?.error || 'No se pudo leer el archivo'}`);
          }
        }
      } catch (err) {
        setFileContent(`// Error al leer archivo: ${err}`);
      }
    }
    setIsLoadingFile(false);
  };

  // Switch Git Branch
  const handleCheckoutBranch = async (branchName: string) => {
    sounds.playHoverTick();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          await electron.ipcRenderer.invoke('git-checkout-branch', { branch: branchName, cwd: currentWorkspace });
          sounds.playIslandExpand();
          loadGitStatus(currentWorkspace);
        }
      } catch (err) {
        console.error('Error switching branch:', err);
      }
    }
  };

  // GitFlow: Start Feature Branch
  const handleStartFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;

    sounds.playHoverTick();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean; branch: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('gitflow-start-feature', {
            featureName: newFeatureName.trim(),
            cwd: currentWorkspace,
          });
          if (res && res.success) {
            sounds.playIslandExpand();
            setIsStartingFeature(false);
            setNewFeatureName('');
            loadGitStatus(currentWorkspace);
            setChatMessages(prev => [
              ...prev,
              {
                sender: 'GitFlow',
                text: `Nueva rama de Feature creada: \`${res.branch}\`.\nLos agentes ahora tienen esta rama como contexto de trabajo.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isAgent: true,
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Error starting feature branch:', err);
      }
    }
  };

  // GitFlow: Create Release Tag
  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReleaseTag.trim()) return;

    sounds.playHoverTick();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean; tag: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('gitflow-create-release', {
            versionTag: newReleaseTag.trim(),
            cwd: currentWorkspace,
          });
          if (res && res.success) {
            sounds.playIslandExpand();
            setIsCreatingRelease(false);
            setNewReleaseTag('');
            loadGitStatus(currentWorkspace);
          }
        }
      } catch (err) {
        console.error('Error creating release tag:', err);
      }
    }
  };

  // Keyboard shortcut listener for Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
        sounds.playHoverTick();
      } else if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pick Workspace Folder Dialog
  const handleSelectWorkspace = async () => {
    sounds.playHoverTick();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string) => Promise<string | null> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const chosenDir = await electron.ipcRenderer.invoke('select-workspace-dialog');
          if (chosenDir) {
            setCurrentWorkspace(chosenDir);
            loadWorkspaceDeepContext(chosenDir);
            sounds.playIslandExpand();
            setChatMessages(prev => [
              ...prev,
              {
                sender: 'Sistema',
                text: `Workspace actualizado a: \`${chosenDir}\`.\nContexto y dependencias re-escaneados para todos los agentes.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isAgent: true,
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Error selecting workspace folder:', err);
      }
    }
  };

  // Generate AI Commit Message
  const handleGenerateAICommitMessage = () => {
    if (gitStatus.files.length === 0) {
      setCommitMessage('chore: update project files and sync dependencies');
      return;
    }
    setIsGeneratingCommit(true);
    sounds.playHoverTick();

    const changedNames = gitStatus.files.map(f => f.file).join(', ');
    const hasFix = changedNames.toLowerCase().includes('fix') || changedNames.toLowerCase().includes('bug');
    const hasFeat = changedNames.toLowerCase().includes('component') || changedNames.toLowerCase().includes('dash');

    setTimeout(() => {
      let prefix = 'refactor';
      if (hasFeat) prefix = 'feat';
      else if (hasFix) prefix = 'fix';

      setCommitMessage(`${prefix}: integrate improvements in ${gitStatus.files.slice(0, 3).map(f => f.file.split('/').pop()).join(', ')}`);
      setIsGeneratingCommit(false);
      sounds.playIslandExpand();
    }, 400);
  };

  // Export Session to Markdown
  const handleExportSession = async () => {
    sounds.playHoverTick();
    const markdownContent = `# Registro de Sesion SideNotch
Fecha: ${new Date().toLocaleString()}
Workspace: ${currentWorkspace}
Stack: ${workspaceContext?.techStack || 'No especificado'}

## Mensajes y Acciones:
${chatMessages.map(m => `### ${m.sender} (${m.time})\n${m.text}\n`).join('\n---\n')}
`;

    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean; filePath: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('export-session-markdown', {
            content: markdownContent,
            filename: `sidenotch-session-${Date.now()}.md`,
          });
          if (res && res.success) {
            sounds.playIslandExpand();
            alert(`Sesion exportada con exito en:\n${res.filePath}`);
          }
        }
      } catch (err) {
        console.error('Error exporting session:', err);
      }
    }
  };

  // Create .agents Rule
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean; filePath: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('create-agent-rule', {
            workspace: currentWorkspace,
            ruleName: newRuleName.trim(),
            content: newRuleContent.trim() || `# ${newRuleName}\n\nDirectiva de desarrollo para el proyecto.`,
          });
          if (res && res.success) {
            sounds.playIslandExpand();
            setIsCreatingRule(false);
            setNewRuleName('');
            setNewRuleContent('');
            loadWorkspaceDeepContext(currentWorkspace);
          }
        }
      } catch (err) {
        console.error('Error creating rule:', err);
      }
    }
  };

  // 1. Load full persistent state & credentials
  useEffect(() => {
    const loadState = async () => {
      if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
        try {
          const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string) => Promise<unknown> } } }).require('electron');
          if (electron && electron.ipcRenderer) {
            const state = (await electron.ipcRenderer.invoke('get-full-state')) as {
              config?: SavedConfig;
              agents?: Agent[];
              tasks?: TaskItem[];
            };
            if (state) {
              if (state.config) setConfig(state.config);
              if (state.agents && state.agents.length > 0) {
                setAgents(state.agents);
                setSelectedAgentId(state.agents[0].id);
                setSelectedSwarmAgentIds(state.agents.slice(0, 3).map(a => a.id));
              }
              if (state.tasks) setTasks(state.tasks);
            }
            const creds = (await electron.ipcRenderer.invoke('get-credentials')) as AccountCredentials;
            if (creds) {
              setCredentials(creds);
            }
          }
        } catch (err) {
          console.error('Error loading state:', err);
        }
      }
    };
    loadState();
    loadScratchpad();
    loadWorkspaceDeepContext(currentWorkspace);
  }, [currentWorkspace, loadScratchpad, loadWorkspaceDeepContext]);

  // 2. Telemetry polling (strictly real APIs)
  const updateQuotasFromPayload = useCallback((data: {
    antigravity?: { isLinked: boolean; plan: string; availableCredits: number; enableOverages: boolean; geminiModels: { fiveHourRemaining: number; weeklyRemaining: number; fiveHourRefreshText: string; weeklyRefreshText: string }; claudeGptModels: { fiveHourRemaining: number; weeklyRemaining: number } };
    claude?: { isLinked: boolean; percent: number; maxBadge: string; error?: string };
    openai?: { isLinked: boolean; percent: number; maxBadge: string; error?: string };
    deepseek?: { isLinked: boolean; balance?: string; error?: string };
    openrouter?: { isLinked: boolean; credits?: number; error?: string };
  }) => {
    if (!data) return;

    if (data.antigravity) {
      setRealQuotas(prev => ({
        ...prev,
        geminiFiveHour: data.antigravity?.geminiModels?.fiveHourRemaining ?? prev.geminiFiveHour,
        geminiFiveHourText: data.antigravity?.geminiModels?.fiveHourRefreshText || prev.geminiFiveHourText,
        geminiWeekly: data.antigravity?.geminiModels?.weeklyRemaining ?? prev.geminiWeekly,
        geminiWeeklyText: data.antigravity?.geminiModels?.weeklyRefreshText || prev.geminiWeeklyText,
        credits: data.antigravity?.availableCredits ?? prev.credits,
        plan: data.antigravity?.plan || prev.plan,
        enableOverages: data.antigravity?.enableOverages ?? prev.enableOverages,
        claudeFiveHour: data.claude?.percent ?? (data.antigravity?.claudeGptModels?.fiveHourRemaining ?? 100),
        claudeWeekly: data.antigravity?.claudeGptModels?.weeklyRemaining ?? 100,
        gptFiveHour: data.openai?.percent ?? 100,
        claudeLinked: data.claude?.isLinked ?? false,
        openaiLinked: data.openai?.isLinked ?? false,
        deepseekLinked: data.deepseek?.isLinked ?? false,
        openrouterLinked: data.openrouter?.isLinked ?? false,
      }));
    }

    setProviderStatuses({
      claude: data.claude,
      openai: data.openai,
      deepseek: data.deepseek,
      openrouter: data.openrouter,
    });
  }, []);

  const fetchLiveTelemetry = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string) => Promise<unknown> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const data = (await electron.ipcRenderer.invoke('get-real-quotas')) as Parameters<typeof updateQuotasFromPayload>[0];
          updateQuotasFromPayload(data);
        }
      } catch {
        // fallback
      }
    }
  }, [updateQuotasFromPayload]);

  useEffect(() => {
    fetchLiveTelemetry();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { on: (ch: string, cb: (e: unknown, data: unknown) => void) => void; removeAllListeners: (ch: string) => void } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          electron.ipcRenderer.on('quotas-updated', (_event, data) => {
            updateQuotasFromPayload(data as Parameters<typeof updateQuotasFromPayload>[0]);
          });
          return () => {
            electron.ipcRenderer.removeAllListeners('quotas-updated');
          };
        }
      } catch {
        // fallback
      }
    }
    const interval = setInterval(fetchLiveTelemetry, 2500);
    return () => clearInterval(interval);
  }, [fetchLiveTelemetry, updateQuotasFromPayload]);

  // Test & save single provider
  const handleTestAndSaveProvider = async (provider: 'claude' | 'openai' | 'deepseek' | 'openrouter') => {
    setIsTestingProvider(provider);
    sounds.playHoverTick();

    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<unknown> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          await electron.ipcRenderer.invoke('save-and-test-credentials', credentials);
          await fetchLiveTelemetry();
          sounds.playIslandExpand();
        }
      } catch {
        // fallback
      }
    }
    setIsTestingProvider(null);
  };

  const autoSaveToDisk = useCallback((updatedConfig: SavedConfig, updatedAgents: Agent[], updatedTasks: TaskItem[]) => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { send: (ch: string, data: unknown) => void } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          electron.ipcRenderer.send('save-full-state', {
            config: updatedConfig,
            agents: updatedAgents,
            tasks: updatedTasks,
          });
        }
      } catch {
        // fallback
      }
    }
  }, []);

  // REAL MULTI-AGENT SWARM DISPATCHER
  const handleRunSwarmPipeline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!swarmPrompt.trim() || isExecutingSwarm) return;

    const participatingAgents = agents.filter(a => selectedSwarmAgentIds.includes(a.id));
    if (participatingAgents.length === 0) return;

    setIsExecutingSwarm(true);
    sounds.playIslandExpand();
    const promptText = swarmPrompt.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setSwarmProgressLogs([`Iniciando pipeline Swarm con ${participatingAgents.length} agentes en "${currentWorkspace}"...`]);

    const newTaskId = `swarm-${Date.now()}`;
    const initialTask: TaskItem = {
      id: newTaskId,
      title: `[Swarm] ${promptText}`,
      assignedAgentId: 'swarm-pipeline',
      status: 'in-progress',
      timestamp: now,
      logs: [`Pipeline iniciado en ${currentWorkspace} con: ${participatingAgents.map(a => a.name).join(' -> ')}`],
    };

    setTasks(prev => [initialTask, ...prev]);

    // Call real Multi-Agent Engine
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean; stepLogs: string[]; results: { agentName: string; output: string }[]; finalSynthesis: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const swarmResult = await electron.ipcRenderer.invoke('dispatch-multiagent-task', {
            agents: participatingAgents,
            prompt: promptText,
            workspace: currentWorkspace,
          });

          if (swarmResult && swarmResult.stepLogs) {
            setSwarmProgressLogs(swarmResult.stepLogs);

            // Add results to chat messages
            if (swarmResult.results) {
              for (const res of swarmResult.results) {
                setChatMessages(prev => [
                  ...prev,
                  {
                    sender: res.agentName,
                    text: res.output,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isAgent: true,
                  },
                ]);
              }
            }

            const updatedTasks = tasks.map(t => t.id === newTaskId ? {
              ...t,
              status: 'done' as const,
              logs: swarmResult.stepLogs,
            } : t);

            setTasks(updatedTasks);
            autoSaveToDisk(config, agents, updatedTasks);
            sounds.playIslandExpand();
          }
        }
      } catch (err) {
        console.error('Swarm execution error:', err);
      }
    }

    setIsExecutingSwarm(false);
    setSwarmPrompt('');
  };

  // SMART AUTO-ROUTED PROMPT HANDLER (Collaborative Multi-Agent Routing)
  const handleSendPrompt = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const userMsg = (overrideText || promptInput).trim();
    if (!userMsg || isSendingPrompt) return;

    setIsSendingPrompt(true);
    sounds.playHoverTick();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages(prev => [...prev, { sender: 'Tu', text: userMsg, time: now, isAgent: false }]);
    setPromptInput('');

    // 1. Check if Multi-Agent Swarm execution is recommended
    let shouldRunSwarm = agentDispatchMode === 'swarm';
    if (agentDispatchMode === 'auto') {
      if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
        try {
          const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ isMultiAgentRecommended: boolean }> } } }).require('electron');
          if (electron && electron.ipcRenderer) {
            const analysis = await electron.ipcRenderer.invoke('analyze-prompt-complexity', userMsg);
            if (analysis && analysis.isMultiAgentRecommended) {
              shouldRunSwarm = true;
            }
          }
        } catch {
          // fallback
        }
      }
    }

    // 2. Execute Multi-Agent Swarm Collaboration if recommended
    if (shouldRunSwarm && agents.length > 1) {
      const activeSwarm = agents.slice(0, 3);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'Orquestador Multi-Agente',
          text: `Tarea compleja detectada. Desplegando colaboracion de ${activeSwarm.length} agentes especializados:\n${activeSwarm.map((a, i) => `› Fase ${i + 1}: ${a.name} (${a.role})`).join('\n')}`,
          time: now,
          isAgent: true,
          isSwarmBadge: true,
        },
      ]);

      const newTaskId = `swarm-auto-${Date.now()}`;
      const newTask: TaskItem = {
        id: newTaskId,
        title: `[Auto-Swarm] ${userMsg}`,
        assignedAgentId: 'swarm-pipeline',
        status: 'in-progress',
        timestamp: now,
        logs: [`Orquestacion multi-agente en ${currentWorkspace}: ${activeSwarm.map(a => a.name).join(' -> ')}`],
      };

      const currentTasks = [newTask, ...tasks];
      setTasks(currentTasks);
      autoSaveToDisk(config, agents, currentTasks);

      if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
        try {
          const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean; results: { agentName: string; output: string }[]; stepLogs: string[] }> } } }).require('electron');
          if (electron && electron.ipcRenderer) {
            const swarmResult = await electron.ipcRenderer.invoke('dispatch-multiagent-task', {
              agents: activeSwarm,
              prompt: userMsg,
              workspace: currentWorkspace,
            });

            if (swarmResult && swarmResult.results) {
              for (const res of swarmResult.results) {
                setChatMessages(prev => [
                  ...prev,
                  {
                    sender: res.agentName,
                    text: res.output,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isAgent: true,
                  },
                ]);
              }
            }

            const finishedTasks = currentTasks.map(t => t.id === newTaskId ? {
              ...t,
              status: 'done' as const,
              logs: swarmResult.stepLogs || ['Ejecucion Swarm completada'],
            } : t);

            setTasks(finishedTasks);
            autoSaveToDisk(config, agents, finishedTasks);
            sounds.playIslandExpand();
          }
        } catch (err) {
          console.error('Swarm execution error:', err);
        }
      }

      setIsSendingPrompt(false);
      return;
    }

    // 3. Single Agent Execution
    const currentAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
    const updatedAgents: Agent[] = agents.map(a => a.id === currentAgent.id ? { ...a, status: 'running' as const, currentTask: userMsg } : a);
    setAgents(updatedAgents);

    const newTaskId = `task-${Date.now()}`;
    const newTask: TaskItem = {
      id: newTaskId,
      title: userMsg,
      assignedAgentId: currentAgent.id,
      status: 'in-progress',
      timestamp: now,
      logs: [`Enviado a ${currentAgent.name} (${currentAgent.model})`, `Workspace: ${currentWorkspace}`, 'Procesando en tiempo real con contexto pre-ingestado...'],
    };

    const currentTasks = [newTask, ...tasks];
    setTasks(currentTasks);
    autoSaveToDisk(config, updatedAgents, currentTasks);

    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean; text: string; error?: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const resp = await electron.ipcRenderer.invoke('execute-single-agent', {
            agent: currentAgent,
            prompt: userMsg,
            workspace: currentWorkspace,
          });

          sounds.playIslandExpand();
          setChatMessages(prev => [
            ...prev,
            {
              sender: currentAgent.name,
              text: resp.text || resp.error || 'Respuesta completada.',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAgent: true,
            },
          ]);

          const finishedAgents = agents.map(a => a.id === currentAgent.id ? { ...a, status: 'completed' as const } : a);
          const finishedTasks = currentTasks.map(t => t.id === newTaskId ? {
            ...t,
            status: 'done' as const,
            logs: [...t.logs, resp.text ? 'Ejecucion exitosa.' : `Error: ${resp.error}`],
          } : t);

          setAgents(finishedAgents);
          setTasks(finishedTasks);
          autoSaveToDisk(config, finishedAgents, finishedTasks);
        }
      } catch (err) {
        console.error('Agent execution error:', err);
      }
    }

    setIsSendingPrompt(false);
  };

  // Run Terminal Command in Workspace
  const handleRunCommand = async (command: string) => {
    sounds.playHoverTick();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'Tu', text: `> ${command}`, time: now, isAgent: false }]);

    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: { command: string; cwd: string }) => Promise<{ success: boolean; stdout: string; stderr: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('run-workspace-command', {
            command,
            cwd: currentWorkspace,
          });

          const outputText = res.stdout || res.stderr || 'Comando completado sin salida.';
          setChatMessages(prev => [
            ...prev,
            {
              sender: 'Terminal',
              text: `\`\`\`bash\n${outputText.trim()}\n\`\`\``,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAgent: true,
            },
          ]);
          sounds.playIslandExpand();
          loadGitStatus(currentWorkspace);
          checkMetroStatus();
        }
      } catch (err) {
        console.error('Terminal command error:', err);
      }
    }
  };

  // Trigger Mobile UI Visual Audit with AI Agent
  const handleAuditMobileUI = () => {
    sounds.playHoverTick();
    const deviceSpec = simulatorDevice === 'iphone-16' ? 'iPhone 16 Pro (393x852)' : simulatorDevice === 'pixel-8' ? 'Google Pixel 8 (412x915)' : 'iPad Mini (744x1133)';
    handleSendPrompt(
      undefined,
      `Auditar exhaustivamente la vista móvil de la aplicación en viewport ${deviceSpec} (${simulatorOrientation}):\n- Verificar zonas seguras de iOS (Dynamic Island y barra inferior de gestos).\n- Comprobar que los targets táctiles tengan mínimo 44x44px.\n- Validar ausencia de scroll horizontal no deseado y legibilidad tipográfica en pantallas reducidas.`
    );
    setShowMobileSimulator(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0] || {
    id: 'agent-gemini',
    name: 'Gemini Engine',
    role: 'Arquitecto de Software & Desarrollo',
    model: 'Gemini 3.7 Pro',
    status: 'idle',
    avatarColor: 'from-emerald-400 to-lime-500',
    assignedWorkspace: '',
  };

  return (
    <div className="w-screen h-screen bg-[#0a0a0c]/98 text-[#f5f5f7] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','Helvetica_Neue',sans-serif] flex select-none overflow-hidden rounded-2xl border border-white/[0.09] shadow-2xl backdrop-blur-2xl">
      {/* 
        ========================================================================
        0. COMMAND PALETTE (CMD + K)
        ========================================================================
      */}
      {showCommandPalette && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20 backdrop-blur-md"
          onClick={() => setShowCommandPalette(false)}
        >
          <div
            className="w-[500px] bg-[#16161c] border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 px-3 py-2 bg-black/40 rounded-xl border border-white/10">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current text-neutral-400" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                autoFocus
                value={paletteQuery}
                onChange={e => setPaletteQuery(e.target.value)}
                placeholder="Buscar comando, agente o navegacion..."
                className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-neutral-400 font-mono">ESC</kbd>
            </div>

            <div className="text-[10px] font-bold text-neutral-500 uppercase px-2 pt-1 tracking-wider">Acciones Rapidas</div>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('console'); setShowCommandPalette(false); sounds.playHoverTick(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer text-left"
              >
                <span>Ir a Consola & Dev</span>
                <span className="text-[10px] opacity-70 font-mono">Tab 1</span>
              </button>
              <button
                onClick={() => { setShowMobileSimulator(true); setShowCommandPalette(false); sounds.playHoverTick(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer text-left"
              >
                <span>Abrir Simulador Móvil & Expo</span>
                <span className="text-[10px] opacity-70 font-mono">Móvil</span>
              </button>
              <button
                onClick={() => { setActiveTab('arena'); setShowCommandPalette(false); sounds.playHoverTick(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer text-left"
              >
                <span>Arena Multi-Modelos en Paralelo</span>
                <span className="text-[10px] opacity-70 font-mono">Tab 2</span>
              </button>
              <button
                onClick={() => { setActiveTab('git-manager'); setShowCommandPalette(false); sounds.playHoverTick(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer text-left"
              >
                <span>GitFlow & Graph Visual</span>
                <span className="text-[10px] opacity-70 font-mono">Tab 5</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MOBILE SIMULATOR & EXPO DEVICE INSPECTOR MODAL
        ========================================================================
      */}
      {showMobileSimulator && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setShowMobileSimulator(false)}
        >
          <div
            className="bg-[#15151b] border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] max-w-4xl w-full p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Controls */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Simulador Móvil & Inspector Expo</h3>
                  <p className="text-[11px] text-neutral-400">Previsualiza y permite que los agentes de IA auditen tu UI móvil en vivo.</p>
                </div>
              </div>

              {/* Device Selector & Rotation */}
              <div className="flex items-center gap-2">
                <div className="flex bg-black/50 p-0.5 rounded-xl border border-white/10 text-xs font-mono">
                  <button
                    onClick={() => { setSimulatorDevice('iphone-16'); sounds.playHoverTick(); }}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${simulatorDevice === 'iphone-16' ? 'bg-[#0071e3] text-white font-bold' : 'text-neutral-400 hover:text-white'}`}
                  >
                    iPhone 16 Pro
                  </button>
                  <button
                    onClick={() => { setSimulatorDevice('pixel-8'); sounds.playHoverTick(); }}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${simulatorDevice === 'pixel-8' ? 'bg-[#0071e3] text-white font-bold' : 'text-neutral-400 hover:text-white'}`}
                  >
                    Pixel 8
                  </button>
                  <button
                    onClick={() => { setSimulatorDevice('ipad'); sounds.playHoverTick(); }}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${simulatorDevice === 'ipad' ? 'bg-[#0071e3] text-white font-bold' : 'text-neutral-400 hover:text-white'}`}
                  >
                    iPad Mini
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSimulatorOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
                    sounds.playHoverTick();
                  }}
                  title="Rotar Orientación"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </button>

                <button
                  onClick={() => setShowMobileSimulator(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 text-neutral-400 transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* URL Input Bar & Action Triggers */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-white">
                <span className="text-neutral-500 font-bold">URL:</span>
                <input
                  type="text"
                  value={simulatorUrl}
                  onChange={e => setSimulatorUrl(e.target.value)}
                  placeholder="http://localhost:8081 o http://localhost:5173"
                  className="flex-1 bg-transparent focus:outline-none text-neutral-200"
                />
                <button
                  onClick={() => { setIframeKey(k => k + 1); sounds.playHoverTick(); }}
                  title="Recargar frame"
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-neutral-300 transition-colors cursor-pointer"
                >
                  Recargar
                </button>
              </div>

              {/* Iniciar Expo / Metro */}
              <button
                onClick={() => handleRunCommand('npx expo start --web || npm run dev')}
                className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Iniciar Expo/Metro</span>
              </button>

              {/* Botón Auditar con IA */}
              <button
                onClick={handleAuditMobileUI}
                className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span>Auditar UI con IA</span>
              </button>
            </div>

            {/* Mobile Frame Container */}
            <div className="flex-1 flex items-center justify-center p-4 bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
              <div
                className={`relative bg-black rounded-[48px] border-[10px] border-[#2c2c34] shadow-2xl overflow-hidden transition-all duration-300 flex flex-col items-center justify-between ${
                  simulatorOrientation === 'portrait'
                    ? simulatorDevice === 'iphone-16' ? 'w-[375px] h-[640px]' : simulatorDevice === 'pixel-8' ? 'w-[390px] h-[640px]' : 'w-[520px] h-[640px]'
                    : 'w-[640px] h-[375px]'
                }`}
              >
                {/* iPhone Dynamic Island Notch */}
                {simulatorDevice === 'iphone-16' && simulatorOrientation === 'portrait' && (
                  <div className="absolute top-2.5 z-30 w-24 h-6 rounded-full bg-black flex items-center justify-between px-2 shadow-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/10" />
                    <span className="w-2 h-2 rounded-full bg-[#0a192f] border border-blue-500/30" />
                  </div>
                )}

                {/* Live Web / Metro Iframe */}
                <iframe
                  key={iframeKey}
                  src={simulatorUrl}
                  title="Mobile App Viewport"
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />

                {/* iOS Home Indicator Bar */}
                {simulatorOrientation === 'portrait' && (
                  <div className="absolute bottom-1.5 w-32 h-1 rounded-full bg-white/40 z-30 pointer-events-none" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        1. LEFT SIDEBAR (ICON ONLY & CLEAR CATEGORIES)
        ========================================================================
      */}
      <div className="w-[215px] bg-[#121216]/90 border-r border-white/[0.08] flex flex-col justify-between shrink-0 p-3 select-none text-[13px] backdrop-blur-xl">
        <div className="space-y-4">
          {/* Traffic Lights Area */}
          <div className="flex items-center gap-2 px-1 pt-1 pb-2 [-webkit-app-region:drag]">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:brightness-90 cursor-pointer shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:brightness-90 cursor-pointer shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:brightness-90 cursor-pointer shadow-sm" />
          </div>

          {/* Section: Centro de Mando */}
          <div className="space-y-1">
            <div className="px-2.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Agentes Dev</div>

            {/* 1. Consola & Dev */}
            <button
              onClick={() => { setActiveTab('console'); sounds.playHoverTick(); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
                activeTab === 'console' ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20' : 'text-[#d1d1d6] hover:bg-white/[0.06]'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span>Consola & Dev</span>
            </button>

            {/* 2. Arena Multi-Modelos */}
            <button
              onClick={() => { setActiveTab('arena'); sounds.playHoverTick(); }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
                activeTab === 'arena' ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20' : 'text-[#d1d1d6] hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>Arena de Modelos</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono">4x</span>
            </button>

            {/* 3. Depurador IA */}
            <button
              onClick={() => { setActiveTab('debugger'); sounds.playHoverTick(); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
                activeTab === 'debugger' ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20' : 'text-[#d1d1d6] hover:bg-white/[0.06]'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Depurador IA</span>
            </button>

            {/* 4. Swarm Multi-Agente */}
            <button
              onClick={() => { setActiveTab('swarm'); sounds.playHoverTick(); }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
                activeTab === 'swarm' ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20' : 'text-[#d1d1d6] hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span>Swarm Multi-Agente</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">{agents.length}</span>
            </button>

            {/* 5. Visor de Codigo */}
            <button
              onClick={() => { setActiveTab('code-viewer'); sounds.playHoverTick(); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
                activeTab === 'code-viewer' ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20' : 'text-[#d1d1d6] hover:bg-white/[0.06]'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <span>Visor de Codigo</span>
            </button>

            {/* 6. GitFlow & Graph Visual */}
            <button
              onClick={() => { setActiveTab('git-manager'); sounds.playHoverTick(); }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
                activeTab === 'git-manager' ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20' : 'text-[#d1d1d6] hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                  <circle cx="18" cy="18" r="3" />
                  <circle cx="6" cy="6" r="3" />
                  <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                  <line x1="6" y1="9" x2="6" y2="21" />
                </svg>
                <span>GitFlow & Graph</span>
              </div>
              {gitStatus.files.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono">{gitStatus.files.length}</span>
              )}
            </button>

            {/* 7. Scratchpad */}
            <button
              onClick={() => { setActiveTab('scratchpad'); sounds.playHoverTick(); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
                activeTab === 'scratchpad' ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20' : 'text-[#d1d1d6] hover:bg-white/[0.06]'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Scratchpad & Notas</span>
            </button>

            {/* 8. Contexto & .agents */}
            <button
              onClick={() => { setActiveTab('agents-context'); sounds.playHoverTick(); }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
                activeTab === 'agents-context' ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20' : 'text-[#d1d1d6] hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span>Contexto & .agents</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                {workspaceContext?.agentsCustomizations?.rules?.length || 0} Reglas
              </span>
            </button>

            {/* 9. Modelos & Cuotas */}
            <button
              onClick={() => { setActiveTab('models'); sounds.playHoverTick(); }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
                activeTab === 'models' ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20' : 'text-[#d1d1d6] hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span>Modelos & Cuotas</span>
              </div>
              <span className="font-mono text-[10px] font-bold text-lime-400">{realQuotas.geminiFiveHour}%</span>
            </button>

            {/* 10. Vinculacion de APIs */}
            <button
              onClick={() => { setActiveTab('linking'); sounds.playHoverTick(); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
                activeTab === 'linking' ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20' : 'text-[#d1d1d6] hover:bg-white/[0.06]'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>Vinculacion de APIs</span>
            </button>
          </div>

          {/* Section: Sistema */}
          <div className="space-y-1">
            <div className="px-2.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Sistema</div>

            <button
              onClick={() => { setActiveTab('settings'); sounds.playHoverTick(); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
                activeTab === 'settings' ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20' : 'text-[#d1d1d6] hover:bg-white/[0.06]'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Ajustes del Notch</span>
            </button>
          </div>
        </div>

        {/* Bottom Sidebar Status */}
        <div className="pt-3 border-t border-white/[0.08] text-[11px] text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
            <span className="font-semibold text-neutral-300">Antigravity</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">{realQuotas.credits} Cr</span>
        </div>
      </div>

      {/* 
        ========================================================================
        2. RIGHT MAIN CONTENT AREA
        ========================================================================
      */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0c0f]">
        {/* Top Header Bar with Context HUD */}
        <div className="h-[58px] w-full flex items-center justify-between px-6 border-b border-white/[0.08] bg-[#131317]/60 shrink-0 backdrop-blur-md [-webkit-app-region:drag]">
          {/* Workspace Path Picker & Tech Stack Badge */}
          <div className="flex items-center gap-2.5 [-webkit-app-region:no-drag]">
            <button
              onClick={handleSelectWorkspace}
              title="Cambiar carpeta de proyecto activa"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-mono text-neutral-200 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-sky-400 text-sky-400">
                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
              </svg>
              <span className="font-semibold text-white max-w-[180px] truncate">{workspaceContext?.folderName || currentWorkspace.split('/').pop()}</span>
              <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold">Cambiar</span>
            </button>

            {/* Tech Stack Badge */}
            <div className="px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-[11px] font-mono text-purple-300 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>{workspaceContext?.techStack || 'React + TypeScript'}</span>
            </div>

            {/* Git Branch Badge */}
            <button
              onClick={() => setActiveTab('git-manager')}
              className="px-2.5 py-1 rounded-xl bg-sky-500/15 border border-sky-500/30 text-[11px] font-mono text-sky-300 flex items-center gap-1.5 cursor-pointer hover:bg-sky-500/25 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                <circle cx="18" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                <line x1="6" y1="9" x2="6" y2="21" />
              </svg>
              <span>{gitStatus.branch || 'main'}</span>
              {gitStatus.files.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>

            {/* .agents Status Pill */}
            <button
              onClick={() => setActiveTab('agents-context')}
              className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 cursor-pointer hover:bg-emerald-500/25 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{workspaceContext?.agentsCustomizations?.rules?.length || 0} Reglas</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 [-webkit-app-region:no-drag]">
            {/* Mobile / Expo Inspector Trigger Button */}
            <button
              onClick={() => {
                setShowMobileSimulator(prev => !prev);
                sounds.playHoverTick();
                checkMetroStatus();
              }}
              className={`px-3 py-1 rounded-xl border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                showMobileSimulator
                  ? 'bg-[#0071e3] border-[#0071e3] text-white font-bold shadow-md shadow-blue-500/20'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-neutral-300'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span>Simulador Móvil</span>
              {metroStatus.isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            </button>

            <button
              onClick={() => setShowCommandPalette(true)}
              className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-mono text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Paleta</span>
              <kbd className="px-1 py-0.5 rounded bg-black/40 text-[9px] font-mono text-neutral-400">⌘K</kbd>
            </button>

            <div className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{realQuotas.credits.toLocaleString()} Creditos IA</span>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* 
            TAB 1: CONSOLE & INTERACTIVE DEV CHAT WITH SMART MULTI-AGENT ROUTING
          */}
          {activeTab === 'console' && (
            <div className="h-full flex flex-col rounded-2xl bg-[#17171c]/90 border border-white/[0.08] overflow-hidden shadow-xl backdrop-blur-md">
              {/* Agent Selector & Dev Action Header */}
              <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                  <select
                    value={selectedAgentId}
                    onChange={e => { setSelectedAgentId(e.target.value); sounds.playHoverTick(); }}
                    className="bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#0071e3] cursor-pointer"
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.id} className="bg-[#1c1c22] text-white">
                        {a.name} ({a.model}) - {a.role}
                      </option>
                    ))}
                  </select>

                  {/* 3-Mode Dispatch Selector (Auto-Swarm | Único | Swarm) */}
                  <div className="flex bg-black/40 p-0.5 rounded-xl border border-white/10 text-[11px] font-semibold">
                    <button
                      onClick={() => { setAgentDispatchMode('auto'); sounds.playHoverTick(); }}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${agentDispatchMode === 'auto' ? 'bg-[#0071e3] text-white font-bold shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Auto-Multiagente
                    </button>
                    <button
                      onClick={() => { setAgentDispatchMode('single'); sounds.playHoverTick(); }}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${agentDispatchMode === 'single' ? 'bg-white/20 text-white font-bold shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Único
                    </button>
                    <button
                      onClick={() => { setAgentDispatchMode('swarm'); sounds.playHoverTick(); }}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${agentDispatchMode === 'swarm' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Swarm
                    </button>
                  </div>
                </div>

                {/* Developer Quick Action Chips */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setShowMobileSimulator(true); sounds.playHoverTick(); }}
                    title="Abrir Simulador Móvil para auditar UI"
                    className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-[11px] font-medium text-purple-300 border border-purple-500/30 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                    <span>Auditar Móvil</span>
                  </button>

                  <button
                    onClick={() => handleSendPrompt(undefined, 'analizar estructura del workspace, dependencias y reglas de .agents')}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-neutral-300 border border-white/10 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>Analizar</span>
                  </button>

                  <button
                    onClick={() => handleRunCommand('npx tsc --noEmit || npm test')}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-neutral-300 border border-white/10 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    <span>Typecheck</span>
                  </button>

                  <button
                    onClick={() => handleRunCommand('npm run build || ls -la')}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-neutral-300 border border-white/10 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>Build</span>
                  </button>

                  <button
                    onClick={handleExportSession}
                    title="Exportar sesion a archivo Markdown"
                    className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-neutral-300 border border-white/10 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Exportar</span>
                  </button>

                  <button
                    onClick={() => { setChatMessages([]); sounds.playHoverTick(); }}
                    title="Limpiar pantalla de chat"
                    className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Dynamic Package.json Scripts Bar */}
              {workspaceContext?.packageJson?.scripts && Object.keys(workspaceContext.packageJson.scripts).length > 0 && (
                <div className="px-4 py-1.5 bg-black/40 border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
                  <span className="text-neutral-500 font-bold shrink-0">Scripts:</span>
                  {Object.keys(workspaceContext.packageJson.scripts).map((scriptName, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleRunCommand(`npm run ${scriptName}`)}
                      className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.1] text-sky-300 border border-white/10 shrink-0 transition-colors cursor-pointer"
                    >
                      npm run {scriptName}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-black/30">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-400">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current" strokeWidth="1.5">
                        <polyline points="4 17 10 11 4 5" />
                        <line x1="12" y1="19" x2="20" y2="19" />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold text-white">Consola de Desarrollo SideNotch Lista</div>
                    <div className="text-xs text-neutral-400 max-w-sm">
                      Escribe cualquier instrucción técnica. Si la tarea requiere arquitectura, implementación y tests, el modo <span className="text-sky-400 font-bold">Auto-Multiagente</span> orquestará automáticamente a varios agentes especializados en cadena.
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.isAgent ? 'items-start' : 'items-end'}`}>
                      <div className="text-[10px] text-neutral-400 mb-1 px-1">{msg.sender} · {msg.time}</div>
                      <div
                        className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          msg.isSwarmBadge
                            ? 'bg-purple-500/15 border border-purple-500/30 text-purple-200 font-mono shadow-md whitespace-pre-wrap'
                            : (msg.isAgent ? 'bg-white/[0.08] border border-white/10 text-neutral-100 shadow-sm whitespace-pre-wrap' : 'bg-[#0071e3] text-white shadow-md')
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isSendingPrompt && (
                  <div className="flex items-center gap-2 text-xs text-neutral-400 italic px-2">
                    <div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    <span>{agentDispatchMode === 'auto' ? 'Analizando complejidad y orquestando agentes...' : `${activeAgent.name} esta procesando...`}</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Prompt Quick Templates Bar & Optimizer */}
              <div className="px-3 py-1.5 bg-black/50 border-t border-white/[0.06] flex items-center justify-between gap-1.5 overflow-x-auto text-[10.5px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500 font-bold shrink-0">Plantillas:</span>
                  <button
                    onClick={() => handleSendPrompt(undefined, 'Diseñar arquitectura de modulo, implementar componentes TypeScript y generar suite de tests unitarios')}
                    className="px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold border border-purple-500/30 shrink-0 transition-colors cursor-pointer"
                  >
                    Flujo Fullstack Multi-Agente
                  </button>
                  <button
                    onClick={() => handleSendPrompt(undefined, 'Generar suite de tests unitarios exhaustivos para los modulos principales del workspace')}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 shrink-0 transition-colors cursor-pointer"
                  >
                    Tests Unitarios
                  </button>
                  <button
                    onClick={() => handleSendPrompt(undefined, 'Auditar posibles cuellos de botella de rendimiento y optimizar renderizados')}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 shrink-0 transition-colors cursor-pointer"
                  >
                    Optimizar Rendimiento
                  </button>
                </div>

                <button
                  onClick={handleOptimizePrompt}
                  title="Enriquecer prompt con estandares y tipos"
                  className="px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold border border-purple-500/30 shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-current" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span>Optimizar Prompt</span>
                </button>
              </div>

              {/* Real-time Multi-Agent Suggestion Banner */}
              {isComplexityDetected && agentDispatchMode === 'auto' && (
                <div className="px-4 py-1.5 bg-purple-500/15 border-t border-purple-500/20 flex items-center justify-between text-[11px] font-mono text-purple-300 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    <span>Tarea compleja: Se orquestara automaticamente entre Gemini (Arquitectura), Claude (Dev) y OpenAI (QA).</span>
                  </div>
                  <span className="text-[10px] bg-purple-500/30 px-1.5 py-0.5 rounded font-bold">Auto-Swarm Activo</span>
                </div>
              )}

              {/* Prompt Input Form */}
              <form onSubmit={handleSendPrompt} className="p-3 border-t border-white/[0.08] bg-black/40 flex items-center gap-2">
                <input
                  type="text"
                  value={promptInput}
                  onChange={e => setPromptInput(e.target.value)}
                  placeholder={`Instruccion para ${agentDispatchMode === 'auto' ? 'desarrollo (Auto-Swarm)' : activeAgent.name} en ${workspaceContext?.folderName || 'workspace'}...`}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                />
                <button
                  type="submit"
                  disabled={!promptInput.trim() || isSendingPrompt}
                  className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold active:scale-95 cursor-pointer transition-all disabled:opacity-40"
                >
                  Enviar
                </button>
              </form>
            </div>
          )}

          {/* 
            TAB 2: ARENA MULTI-MODELOS (PARALLEL EXECUTION)
          */}
          {activeTab === 'arena' && (
            <div className="h-full flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Arena de Modelos de IA en Paralelo</h2>
                  <p className="text-xs text-neutral-400">Compara las respuestas, velocidad (ms) y calidad de código entre Gemini, Claude, GPT y DeepSeek simultáneamente.</p>
                </div>
                {arenaExecutionTime > 0 && (
                  <span className="text-xs font-mono text-emerald-400">
                    Tiempo total: {arenaExecutionTime}ms
                  </span>
                )}
              </div>

              {/* Arena Prompt Bar */}
              <form onSubmit={handleRunArena} className="p-3 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] flex items-center gap-2 shadow-lg backdrop-blur-md">
                <input
                  type="text"
                  value={arenaPrompt}
                  onChange={e => setArenaPrompt(e.target.value)}
                  placeholder="Escribe la tarea o problema para que los 4 modelos compitan en directo..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3]"
                />
                <button
                  type="submit"
                  disabled={isExecutingArena || !arenaPrompt.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold active:scale-95 cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isExecutingArena ? 'Ejecutando Arena...' : 'Lanzar Batalla'}
                </button>
              </form>

              {/* Split Cards Grid */}
              <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto">
                {(arenaResults.length > 0 ? arenaResults : [
                  { modelId: 'gemini-3.7', modelName: 'Gemini 3.7 Pro', provider: 'Antigravity Local Engine', color: '#D4FF00', isRealAPI: true, latencyMs: 0, text: 'Enfoque arquitectónico y comprensión holística del repositorio.', tokenEstimate: 0 },
                  { modelId: 'claude-3.7', modelName: 'Claude 3.7 Sonnet', provider: 'Anthropic', color: '#FF6B4A', isRealAPI: false, latencyMs: 0, text: 'Generación limpia de TypeScript, hooks React y componentes modulares.', tokenEstimate: 0 },
                  { modelId: 'gpt-4o', modelName: 'OpenAI GPT-4o', provider: 'OpenAI', color: '#10A37F', isRealAPI: false, latencyMs: 0, text: 'QA, análisis de límites, aserciones y tests de integración.', tokenEstimate: 0 },
                  { modelId: 'deepseek-v3', modelName: 'DeepSeek V3 Reasoner', provider: 'DeepSeek', color: '#4D6BFE', isRealAPI: false, latencyMs: 0, text: 'Razonamiento profundo, auditoría de seguridad y optimización de memoria.', tokenEstimate: 0 },
                ]).map((res, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] flex flex-col justify-between space-y-3 shadow-xl backdrop-blur-md">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: res.color }} />
                          <span className="text-xs font-bold text-white">{res.modelName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                          {res.latencyMs > 0 && <span className="text-emerald-400">{res.latencyMs}ms</span>}
                          <span>{res.provider}</span>
                        </div>
                      </div>
                      <div className="mt-3 font-mono text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto">
                        {res.text}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-500">~{res.tokenEstimate} tokens</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(res.text);
                          sounds.playIslandExpand();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-neutral-300 transition-colors cursor-pointer"
                      >
                        Copiar Solucion
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 
            TAB 3: DEPURADOR IA DE ERRORES
          */}
          {activeTab === 'debugger' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Depurador IA de Errores & Stack Traces</h2>
                <p className="text-xs text-neutral-400">Pega cualquier error de compilación o ejecución para que el agente localice el archivo causante y sugiera el arreglo exacto.</p>
              </div>

              {/* Trace Input */}
              <form onSubmit={handleDiagnoseError} className="p-5 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-3 backdrop-blur-md shadow-xl">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Pega el Error o Stack Trace de la Terminal</div>
                <textarea
                  rows={4}
                  value={errorInput}
                  onChange={e => setErrorInput(e.target.value)}
                  placeholder="Ejemplo: TypeError: Cannot read properties of undefined (reading 'map') at src/components/Dashboard.tsx:42:15..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 font-mono text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!errorInput.trim()}
                    className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Diagnosticar Error
                  </button>
                </div>
              </form>

              {/* Diagnosis Output Card */}
              {errorDiagnosis && (
                <div className="p-5 rounded-2xl bg-[#17171c]/90 border border-emerald-500/40 space-y-4 backdrop-blur-md shadow-xl animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Diagnóstico de Causa Raíz</div>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono text-neutral-300">{errorDiagnosis.affectedFile}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 font-mono text-xs text-neutral-200 space-y-1">
                    <div className="font-bold text-white">{errorDiagnosis.summary}</div>
                    <div className="text-neutral-400">{errorDiagnosis.explanation}</div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-neutral-300">Solución Recomendada:</div>
                    <div className="p-3 rounded-xl bg-black/40 font-mono text-xs text-sky-300 whitespace-pre-wrap">
                      {errorDiagnosis.recommendedFix}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenFileInViewer(`${currentWorkspace}/${errorDiagnosis.affectedFile}`)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      Abrir Archivo en Visor
                    </button>
                    <button
                      onClick={() => handleSendPrompt(undefined, `Arregla este error en ${errorDiagnosis.affectedFile}:\n\n${errorInput}`)}
                      className="px-4 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      Aplicar Arreglo con Agente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 
            TAB 4: CODE & FILE VIEWER
          */}
          {activeTab === 'code-viewer' && (
            <div className="h-full flex rounded-2xl bg-[#17171c]/90 border border-white/[0.08] overflow-hidden shadow-xl backdrop-blur-md">
              {/* Left File Tree */}
              <div className="w-64 border-r border-white/10 bg-black/30 p-3 overflow-y-auto space-y-1">
                <div className="text-xs font-bold text-neutral-400 uppercase px-2 py-1 tracking-wider">Archivos del Proyecto</div>
                {workspaceContext?.filesList?.map((f, fIdx) => (
                  <button
                    key={fIdx}
                    onClick={() => handleOpenFileInViewer(f.path)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
                      selectedFileForViewer === f.path ? 'bg-[#0071e3] text-white' : 'text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current shrink-0" strokeWidth="2">
                      {f.isDirectory ? (
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      ) : (
                        <>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </>
                      )}
                    </svg>
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
              </div>

              {/* Right Code Content Preview */}
              <div className="flex-1 flex flex-col overflow-hidden bg-black/50">
                <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/40">
                  <div className="text-xs font-mono text-neutral-300 truncate">
                    {selectedFileForViewer || 'Selecciona un archivo para inspeccionar'}
                  </div>
                  {selectedFileForViewer && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(fileContent);
                          setCopySuccess(true);
                          sounds.playIslandExpand();
                          setTimeout(() => setCopySuccess(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono text-neutral-200 transition-colors cursor-pointer"
                      >
                        {copySuccess ? '✓ Copiado' : 'Copiar'}
                      </button>
                      <button
                        onClick={() => handleSendPrompt(undefined, `Refactoriza y analiza el archivo ${selectedFileForViewer.split('/').pop()}:\n\n${fileContent.slice(0, 800)}`)}
                        className="px-3 py-1 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white text-[11px] font-bold transition-all cursor-pointer active:scale-95"
                      >
                        Analizar con Agente
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-neutral-200 whitespace-pre leading-relaxed">
                  {isLoadingFile ? (
                    <div className="flex items-center gap-2 text-neutral-400">
                      <div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      <span>Cargando archivo...</span>
                    </div>
                  ) : (
                    fileContent || '// Selecciona cualquier archivo en la columna izquierda para leer su contenido.'
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 
            TAB 5: ADVANCED GITFLOW & VISUAL GIT GRAPH
          */}
          {activeTab === 'git-manager' && (
            <div className="space-y-6">
              {/* Header with GitFlow Actions */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">GitFlow & Grafo Visual en Tiempo Real</h2>
                  <p className="text-xs text-neutral-400">Control de ramas, commits en vivo y orquestación de ramas con agentes.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsStartingFeature(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>+ Nueva Feature</span>
                  </button>

                  <button
                    onClick={() => setIsCreatingRelease(true)}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold border border-purple-500/30 active:scale-95 cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <span>Tag / Release</span>
                  </button>

                  <button
                    onClick={() => loadGitStatus(currentWorkspace)}
                    title="Recargar Grafo"
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10" />
                      <polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Start Feature Modal */}
              {isStartingFeature && (
                <form onSubmit={handleStartFeature} className="p-4 rounded-2xl bg-[#1c1c24] border border-[#0071e3] space-y-3 shadow-2xl animate-in fade-in">
                  <div className="text-xs font-bold text-white">Iniciar Rama GitFlow Feature (feature/...)</div>
                  <input
                    type="text"
                    value={newFeatureName}
                    onChange={e => setNewFeatureName(e.target.value)}
                    placeholder="nombre-de-la-funcionalidad (ej: arena-comparador)"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsStartingFeature(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-neutral-300 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#0071e3] text-xs font-bold text-white cursor-pointer"
                    >
                      Crear y Cambiar a Rama
                    </button>
                  </div>
                </form>
              )}

              {/* Create Release Modal */}
              {isCreatingRelease && (
                <form onSubmit={handleCreateRelease} className="p-4 rounded-2xl bg-[#1c1c24] border border-purple-500 space-y-3 shadow-2xl animate-in fade-in">
                  <div className="text-xs font-bold text-white">Crear Release Tag SemVer</div>
                  <input
                    type="text"
                    value={newReleaseTag}
                    onChange={e => setNewReleaseTag(e.target.value)}
                    placeholder="v1.2.0"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingRelease(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-neutral-300 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-purple-600 text-xs font-bold text-white cursor-pointer"
                    >
                      Crear Release Tag
                    </button>
                  </div>
                </form>
              )}

              {/* Branches Ribbon */}
              {gitBranches.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-xs font-bold text-neutral-500 shrink-0">Ramas:</span>
                  {gitBranches.map((b, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCheckoutBranch(b.name)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                        b.isCurrent
                          ? 'bg-[#0071e3] text-white font-bold shadow-md shadow-blue-500/20'
                          : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] border border-white/10'
                      }`}
                    >
                      {b.isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      <span>{b.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Visual GitFlow Graph & Commit Stream */}
              <div className="rounded-2xl bg-[#17171c]/90 border border-white/[0.08] overflow-hidden shadow-xl backdrop-blur-md flex flex-col">
                <div className="p-3.5 border-b border-white/[0.08] bg-black/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Grafo de Commits en Vivo ({gitCommits.length})</span>
                  <span className="text-[11px] font-mono text-neutral-400">Rama Activa: <span className="text-sky-400 font-bold">{gitStatus.branch}</span></span>
                </div>

                <div className="p-4 overflow-y-auto max-h-[380px] space-y-3 font-mono">
                  {gitCommits.length > 0 ? (
                    gitCommits.map((commit, cIdx) => {
                      const laneColor = LANE_COLORS[commit.lane % LANE_COLORS.length];
                      return (
                        <div
                          key={commit.id || cIdx}
                          onClick={() => { setSelectedCommit(commit); sounds.playHoverTick(); }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            selectedCommit?.id === commit.id
                              ? 'bg-[#0071e3]/15 border-[#0071e3]'
                              : 'bg-black/30 border-white/[0.06] hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Visual Track Node */}
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: laneColor }} />
                              <span className="text-[11px] font-bold text-neutral-400">{commit.id.slice(0, 7)}</span>
                            </div>

                            {/* Message & Refs */}
                            <div className="min-w-0">
                              <div className="text-xs text-white truncate font-sans">{commit.message}</div>
                              <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                                <span className="text-neutral-300">{commit.author}</span>
                                <span>·</span>
                                <span>{commit.timeAgo}</span>
                                {commit.refs && commit.refs.length > 0 && (
                                  <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">
                                    {commit.refs.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleSendPrompt(undefined, `Explica los cambios del commit ${commit.id.slice(0, 7)} (${commit.message}) y evalúa su impacto en el proyecto.`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-neutral-300 shrink-0 transition-colors cursor-pointer"
                          >
                            Explicar con IA
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-neutral-400">
                      No se han encontrado commits o el repositorio es nuevo.
                    </div>
                  )}
                </div>
              </div>

              {/* Staging & Commit Section */}
              <div className="p-5 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-4 backdrop-blur-md shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Archivos Modificados ({gitStatus.files.length})</div>
                  <button
                    onClick={handleGenerateAICommitMessage}
                    disabled={isGeneratingCommit}
                    className="px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isGeneratingCommit ? 'Generando...' : 'Sugerir Commit con IA'}
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={e => setCommitMessage(e.target.value)}
                    placeholder="feat: implement new features and cleanup"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-[#0071e3]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleRunCommand('git stash')}
                      className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 text-xs font-medium border border-white/10 transition-all cursor-pointer"
                    >
                      Git Stash
                    </button>
                    <button
                      onClick={() => handleRunCommand(`git add . && git commit -m "${commitMessage || 'update'}"`)}
                      disabled={!commitMessage.trim()}
                      className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                    >
                      Git Commit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 
            TAB 6: SCRATCHPAD & NOTES
          */}
          {activeTab === 'scratchpad' && (
            <div className="max-w-3xl mx-auto h-full flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Scratchpad de Desarrollo & Notas Persistentes</h2>
                  <p className="text-xs text-neutral-400">Guarda esquemas, snippets y notas de arquitectura compartidas con los agentes.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-neutral-400">
                    {isSavingScratchpad ? 'Guardando...' : 'Autoguardado en disco'}
                  </span>
                  <button
                    onClick={() => handleSendPrompt(undefined, `Revisa mis notas de arquitectura en el Scratchpad y propon sugerencias de implementacion:\n\n${scratchpadText}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer transition-all"
                  >
                    Consultar con Agente
                  </button>
                </div>
              </div>

              <div className="flex-1 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] overflow-hidden shadow-xl backdrop-blur-md flex flex-col">
                <textarea
                  value={scratchpadText}
                  onChange={e => handleSaveScratchpad(e.target.value)}
                  placeholder="# Escribe aqui tus notas de diseno, snippets y tareas pendientes..."
                  className="flex-1 bg-transparent p-5 font-mono text-xs text-white placeholder-neutral-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* 
            TAB 7: SWARM MULTI-AGENTE
          */}
          {activeTab === 'swarm' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Swarm Multi-Agente en Pipeline</h2>
                  <p className="text-xs text-neutral-400">Ejecuta tareas complejas con multiples agentes especializados colaborando en cadena en tu workspace.</p>
                </div>
              </div>

              {/* Swarm Dispatcher Card */}
              <div className="p-5 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-4 backdrop-blur-md shadow-xl">
                <div className="text-xs font-semibold text-white">1. Selecciona los agentes participantes en el Swarm:</div>
                <div className="grid grid-cols-4 gap-3">
                  {agents.map(agent => {
                    const isSelected = selectedSwarmAgentIds.includes(agent.id);
                    return (
                      <div
                        key={agent.id}
                        onClick={() => {
                          setSelectedSwarmAgentIds(prev =>
                            prev.includes(agent.id) ? prev.filter(id => id !== agent.id) : [...prev, agent.id]
                          );
                          sounds.playHoverTick();
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#0071e3]/20 border-[#0071e3] shadow-md shadow-blue-500/10'
                            : 'bg-black/30 border-white/[0.06] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-md border flex items-center justify-center ${isSelected ? 'bg-[#0071e3] border-[#0071e3]' : 'border-white/30'}`}>
                            {isSelected && <span className="text-[10px] text-white">✓</span>}
                          </div>
                          <span className="text-xs font-bold text-white truncate">{agent.name}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-1 truncate">{agent.role}</div>
                        <div className="text-[10px] font-mono text-sky-400 mt-0.5">{agent.model}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs font-semibold text-white pt-2">2. Asigna la mision al Swarm en <span className="text-sky-400 font-mono">{workspaceContext?.folderName}</span>:</div>
                <form onSubmit={handleRunSwarmPipeline} className="space-y-3">
                  <textarea
                    rows={3}
                    value={swarmPrompt}
                    onChange={e => setSwarmPrompt(e.target.value)}
                    placeholder="Ejemplo: Disenar la arquitectura del modulo, implementar las interfaces TypeScript y realizar auditoria de seguridad..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isExecutingSwarm || !swarmPrompt.trim() || selectedSwarmAgentIds.length === 0}
                      className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isExecutingSwarm ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Ejecutando Swarm...</span>
                        </>
                      ) : (
                        <span>Lanzar Mision Multi-Agente</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Swarm Live Execution Logs */}
                {swarmProgressLogs.length > 0 && (
                  <div className="mt-3 p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5 font-mono text-[11px]">
                    <div className="text-xs font-bold text-neutral-300 pb-1 border-b border-white/10">Logs de Ejecucion en Tiempo Real:</div>
                    {swarmProgressLogs.map((log, idx) => (
                      <div key={idx} className="text-neutral-300 flex items-center gap-2">
                        <span className="text-emerald-400">›</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 
            TAB 8: CONTEXT & .agents CUSTOMIZATIONS MANAGER
          */}
          {activeTab === 'agents-context' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Gestion de Contexto & Customizaciones (.agents)</h2>
                  <p className="text-xs text-neutral-400">Reglas, habilidades y conocimientos precargados en tu proyecto para los agentes.</p>
                </div>
                <button
                  onClick={() => setIsCreatingRule(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer transition-all"
                >
                  + Nueva Regla .agents
                </button>
              </div>

              {/* Modal Crear Regla */}
              {isCreatingRule && (
                <form onSubmit={handleCreateRule} className="p-4 rounded-2xl bg-[#1c1c24] border border-[#0071e3] space-y-3 shadow-2xl">
                  <div className="text-xs font-bold text-white">Crear Nueva Regla en .agents/rules/</div>
                  <input
                    type="text"
                    value={newRuleName}
                    onChange={e => setNewRuleName(e.target.value)}
                    placeholder="nombre-regla.md (ej: clean-code.md)"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <textarea
                    rows={3}
                    value={newRuleContent}
                    onChange={e => setNewRuleContent(e.target.value)}
                    placeholder="Directivas para los agentes (ej: Usar siempre TypeScript estricto sin tipo any)..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingRule(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-neutral-300 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#0071e3] text-xs font-bold text-white cursor-pointer"
                    >
                      Guardar Regla
                    </button>
                  </div>
                </form>
              )}

              {/* Rules List */}
              <div className="p-5 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-3 backdrop-blur-md shadow-xl">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Reglas Activas en este Workspace</div>
                {workspaceContext?.agentsCustomizations?.rules && workspaceContext.agentsCustomizations.rules.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {workspaceContext.agentsCustomizations.rules.map((rule, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-black/30 border border-white/[0.06] space-y-1">
                        <div className="text-xs font-bold text-sky-400 font-mono flex items-center gap-1.5">
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span>{rule.name}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 line-clamp-2">{rule.preview}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-xs text-neutral-400">
                    No se han encontrado archivos en `.agents/rules/`. Pulsa "+ Nueva Regla" para anadir directivas de desarrollo a tus agentes.
                  </div>
                )}
              </div>

              {/* Skills List */}
              <div className="p-5 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-3 backdrop-blur-md shadow-xl">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Habilidades Especializadas (Skills)</div>
                {workspaceContext?.agentsCustomizations?.skills && workspaceContext.agentsCustomizations.skills.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {workspaceContext.agentsCustomizations.skills.map((skill, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-black/30 border border-white/[0.06] space-y-1">
                        <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                          </svg>
                          <span>{skill.name}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400">{skill.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-xs text-neutral-400">
                    Directorio `.agents/skills/` listo para cargar flujos de trabajo personalizados.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 
            TAB 9: MODELS & USAGE
          */}
          {activeTab === 'models' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight">Models & Usage</h1>
                    <button
                      onClick={fetchLiveTelemetry}
                      title="Refrescar datos de cuota"
                      className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10" />
                        <polyline points="1 20 1 14 7 14" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">Manage your model quota and credits.</p>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sincronizacion en Vivo</span>
                </div>
              </div>

              {/* 1. Plan Card */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Plan</div>
                <div className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] flex items-center justify-between shadow-lg backdrop-blur-md">
                  <div>
                    <div className="text-sm font-semibold text-white">Your Plan: {realQuotas.plan}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">You can upgrade to a Google AI Ultra plan to receive higher rate limits.</div>
                  </div>
                  <button className="px-4 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer transition-all">
                    Upgrade
                  </button>
                </div>
              </div>

              {/* 2. Model Credits Card */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Model Credits</div>
                <div className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-4 shadow-lg backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">Enable AI Credit Overages</div>
                      <div className="text-xs text-neutral-400 mt-0.5 max-w-md">
                        When toggled on, Antigravity IDE will use your AI credits to fulfill model requests once you're out of model quota.
                      </div>
                    </div>
                    <div className="w-11 h-6 rounded-full bg-[#0071e3] p-0.5 flex items-center justify-end cursor-pointer shadow-inner">
                      <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">
                      Available AI Credits: <span className="font-mono text-emerald-400">{realQuotas.credits}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 text-xs font-medium border border-white/10 transition-colors cursor-pointer">
                        See Activity
                      </button>
                      <button className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer transition-all">
                        Get More AI Credits
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Gemini Models Card */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Gemini Models</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-4 shadow-lg backdrop-blur-md">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div>
                      <div className="text-sm font-semibold text-white">Weekly Limit Remaining</div>
                      <div className="text-xs text-neutral-400 mt-0.5">{realQuotas.geminiWeeklyText}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-amber-400 font-mono">{realQuotas.geminiWeekly}%</span>
                      <MetricRing percent={realQuotas.geminiWeekly} color="#ff9f0a" size={34} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">Five Hour Limit Remaining</div>
                      <div className="text-xs text-neutral-400 mt-0.5">{realQuotas.geminiFiveHourText}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#30d158] font-mono">{realQuotas.geminiFiveHour}%</span>
                      <MetricRing percent={realQuotas.geminiFiveHour} color="#30d158" size={34} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Claude and GPT models Card */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Claude and GPT models</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-4 shadow-lg backdrop-blur-md">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div>
                      <div className="text-sm font-semibold text-white">Weekly Limit Remaining</div>
                      <div className="text-xs text-neutral-400 mt-0.5">Modelos externos compartidos con cuota Antigravity.</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#30d158] font-mono">{realQuotas.claudeWeekly}%</span>
                      <MetricRing percent={realQuotas.claudeWeekly} color="#30d158" size={34} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">Five Hour Limit Remaining</div>
                      <div className="text-xs text-neutral-400 mt-0.5">Recarga de sesion fluida de 5 horas.</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#30d158] font-mono">{realQuotas.claudeFiveHour}%</span>
                      <MetricRing percent={realQuotas.claudeFiveHour} color="#30d158" size={34} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 
            TAB 10: VINCULACIÓN DE APIs
          */}
          {activeTab === 'linking' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Vinculacion de APIs & Modelos Externos</h2>
                <p className="text-xs text-neutral-400">Conecta tus claves directas para sincronizar telemetria de cuota real.</p>
              </div>

              {/* Claude Key */}
              <div className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-3 shadow-md backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A]" />
                    <span>Anthropic Claude API</span>
                  </div>
                  <span className={`text-xs font-mono ${providerStatuses.claude?.isLinked ? 'text-emerald-400' : 'text-neutral-400'}`}>
                    {providerStatuses.claude?.isLinked ? `Conectado (${providerStatuses.claude.percent}%)` : 'Sin Vincular'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={credentials.claudeApiKey}
                    onChange={e => setCredentials(prev => ({ ...prev, claudeApiKey: e.target.value }))}
                    placeholder="sk-ant-api03-..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0071e3]"
                  />
                  <button
                    onClick={() => handleTestAndSaveProvider('claude')}
                    disabled={isTestingProvider === 'claude'}
                    className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isTestingProvider === 'claude' ? 'Probando...' : 'Vincular'}
                  </button>
                </div>
              </div>

              {/* OpenAI Key */}
              <div className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-3 shadow-md backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10A37F]" />
                    <span>OpenAI ChatGPT API</span>
                  </div>
                  <span className={`text-xs font-mono ${providerStatuses.openai?.isLinked ? 'text-emerald-400' : 'text-neutral-400'}`}>
                    {providerStatuses.openai?.isLinked ? 'Conectado (100%)' : 'Sin Vincular'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={credentials.openaiApiKey}
                    onChange={e => setCredentials(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                    placeholder="sk-proj-..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0071e3]"
                  />
                  <button
                    onClick={() => handleTestAndSaveProvider('openai')}
                    disabled={isTestingProvider === 'openai'}
                    className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isTestingProvider === 'openai' ? 'Probando...' : 'Vincular'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 
            TAB 11: SETTINGS
          */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Preferencias del Notch de macOS</h2>
                  <p className="text-xs text-neutral-400">Comportamiento en pantalla y persistencia.</p>
                </div>
                {isSaved && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Guardado automatico en disco
                  </span>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Iniciar al encender el Mac</div>
                    <div className="text-[11px] text-neutral-400">Abre SideNotch automaticamente al iniciar sesion.</div>
                  </div>
                  <button
                    onClick={() => {
                      const next = { ...config, launchAtLogin: !config.launchAtLogin };
                      setConfig(next);
                      autoSaveToDisk(next, agents, tasks);
                      setIsSaved(true);
                      setTimeout(() => setIsSaved(false), 2000);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${config.launchAtLogin ? 'bg-[#0071e3]' : 'bg-neutral-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${config.launchAtLogin ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="h-[1px] bg-white/10" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Posicion del Notch en Pantalla</div>
                    <div className="text-[11px] text-neutral-400">Ubicacion a lo largo del borde derecho de tu monitor.</div>
                  </div>
                  <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
                    <button
                      onClick={() => {
                        const next = { ...config, notchPosition: 'top-right' as const };
                        setConfig(next);
                        autoSaveToDisk(next, agents, tasks);
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 2000);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${config.notchPosition === 'top-right' ? 'bg-white/20 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Arriba a la derecha
                    </button>
                    <button
                      onClick={() => {
                        const next = { ...config, notchPosition: 'center-right' as const };
                        setConfig(next);
                        autoSaveToDisk(next, agents, tasks);
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 2000);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${config.notchPosition === 'center-right' ? 'bg-white/20 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Centro derecho
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
