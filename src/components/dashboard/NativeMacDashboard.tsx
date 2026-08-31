import React, { useState, useEffect } from 'react';
import type {
  DashboardTab,
  Agent,
  TaskItem,
  SavedConfig,
  AccountCredentials,
  ArenaResult,
  ChatMessage,
  ErrorDiagnosis,
} from '../../types/dashboard';
import { sounds } from '../../utils/soundEffects';

// Custom Domain Hooks
import { useLiveQuotas } from '../../hooks/useLiveQuotas';
import { useWorkspaceGit } from '../../hooks/useWorkspaceGit';
import { useWorkspaceContext } from '../../hooks/useWorkspaceContext';

// Navigation & Modals
import { DashboardSidebar } from './navigation/DashboardSidebar';
import { DashboardHeader } from './navigation/DashboardHeader';
import { CommandPaletteModal } from './modals/CommandPaletteModal';
import { MobileSimulatorModal } from './modals/MobileSimulatorModal';

// Tabs
import { ConsoleTab } from './tabs/ConsoleTab';
import { ModelsQuotaTab } from './tabs/ModelsQuotaTab';
import { GitManagerTab } from './tabs/GitManagerTab';
import { ToolsHubTab } from './tabs/ToolsHubTab';
import { SettingsTab } from './tabs/SettingsTab';

const DEFAULT_CONFIG: SavedConfig = {
  launchAtLogin: true,
  showInDock: true,
  autoHide: true,
  notchPosition: 'top-right',
  shutterSound: true,
  blurIntensity: 85,
  autoRefillAlerts: true,
};

export const NativeMacDashboard: React.FC = () => {
  // Navigation & Core State
  const [activeTab, setActiveTab] = useState<DashboardTab>('console');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [config, setConfig] = useState<SavedConfig>(DEFAULT_CONFIG);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-gemini');

  // Multi-Agent Auto-Routing Mode
  const [agentDispatchMode, setAgentDispatchMode] = useState<'auto' | 'single' | 'swarm'>('auto');
  const [isComplexityDetected, setIsComplexityDetected] = useState<boolean>(false);

  // Modals State
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [paletteQuery, setPaletteQuery] = useState<string>('');
  const [showMobileSimulator, setShowMobileSimulator] = useState<boolean>(false);
  const [simulatorUrl, setSimulatorUrl] = useState<string>('http://localhost:8081');
  const [metroStatus, setMetroStatus] = useState<{ isRunning: boolean; port: number; type: string }>({ isRunning: false, port: 8081, type: 'none' });

  // Workspace Path & Custom Hooks
  const [currentWorkspace, setCurrentWorkspace] = useState<string>('/Users/eric/Desktop/Applicacion Sidebar');
  const { workspaceContext, loadWorkspaceDeepContext } = useWorkspaceContext(currentWorkspace);
  const { realQuotas, fetchLiveTelemetry } = useLiveQuotas();
  const {
    gitStatus,
    gitCommits,
    gitBranches,
    selectedCommit,
    setSelectedCommit,
    commitMessage,
    setCommitMessage,
    isGeneratingCommit,
    loadGitStatus,
    checkoutBranch,
    generateAICommitMessage,
  } = useWorkspaceGit(currentWorkspace);

  // Chat & Console & Queue
  const [promptInput, setPromptInput] = useState<string>('');
  const [isSendingPrompt, setIsSendingPrompt] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [promptQueue, setPromptQueue] = useState<string[]>([]);

  // Arena
  const [arenaPrompt, setArenaPrompt] = useState<string>('');
  const [isExecutingArena, setIsExecutingArena] = useState<boolean>(false);
  const [arenaResults, setArenaResults] = useState<ArenaResult[]>([]);
  const [arenaExecutionTime, setArenaExecutionTime] = useState<number>(0);

  // Debugger
  const [errorInput, setErrorInput] = useState<string>('');
  const [errorDiagnosis, setErrorDiagnosis] = useState<ErrorDiagnosis | null>(null);

  // Code Viewer
  const [selectedFileForViewer, setSelectedFileForViewer] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Scratchpad
  const [scratchpadText, setScratchpadText] = useState<string>('');
  const [isSavingScratchpad, setIsSavingScratchpad] = useState<boolean>(false);

  // Swarm Pipeline
  const [selectedSwarmAgentIds, setSelectedSwarmAgentIds] = useState<string[]>(['agent-gemini', 'agent-claude', 'agent-openai']);
  const [swarmPrompt, setSwarmPrompt] = useState<string>('');
  const [isExecutingSwarm, setIsExecutingSwarm] = useState<boolean>(false);
  const [swarmProgressLogs, setSwarmProgressLogs] = useState<string[]>([]);

  // Credentials
  const [_credentials, setCredentials] = useState<AccountCredentials>({
    claudeApiKey: '',
    openaiApiKey: '',
    deepseekApiKey: '',
    openrouterApiKey: '',
  });

  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Prompt complexity detector
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

  // Check Metro Status
  const checkMetroStatus = async () => {
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

  // Disk Auto-save
  const autoSaveToDisk = (updatedConfig: SavedConfig, updatedAgents: Agent[], updatedTasks: TaskItem[]) => {
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
  };

  // Initial Data Load
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
            if (creds) setCredentials(creds);

            const scratch = (await electron.ipcRenderer.invoke('get-scratchpad')) as string;
            if (scratch && typeof scratch === 'string') setScratchpadText(scratch);
          }
        } catch (err) {
          console.error('Error loading state:', err);
        }
      }
    };
    loadState();
    loadWorkspaceDeepContext(currentWorkspace);
    loadGitStatus(currentWorkspace);
  }, [currentWorkspace, loadWorkspaceDeepContext, loadGitStatus]);

  // Save Scratchpad
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

  // Select Workspace Dialog
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
            loadGitStatus(chosenDir);
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

  // Run Terminal Command
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

  // Automatic queue consumer
  useEffect(() => {
    if (!isSendingPrompt && promptQueue.length > 0) {
      const nextMsg = promptQueue[0];
      setPromptQueue(prev => prev.slice(1));
      handleSendPrompt(undefined, nextMsg);
    }
  }, [isSendingPrompt, promptQueue]);

  // Prompt Handler with Queue Support & Cooperative Squad
  const handleSendPrompt = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const userMsg = (overrideText || promptInput).trim();
    if (!userMsg) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // If currently busy, queue it and notify user
    if (isSendingPrompt) {
      sounds.playHoverTick();
      setPromptQueue(prev => [...prev, userMsg]);
      setChatMessages(prev => [
        ...prev,
        { sender: 'Tu', text: userMsg, time: now, isAgent: false },
        {
          sender: 'Equipo Cooperativo',
          text: `⏳ Tarea añadida a la cola (${promptQueue.length + 1} en espera). Se procesará automáticamente en cuanto termine la actual.`,
          time: now,
          isAgent: true,
        },
      ]);
      setPromptInput('');
      return;
    }

    setIsSendingPrompt(true);
    sounds.playHoverTick();

    setChatMessages(prev => [...prev, { sender: 'Tu', text: userMsg, time: now, isAgent: false }]);
    setPromptInput('');

    let shouldRunSwarm = agentDispatchMode === 'swarm' || agentDispatchMode === 'auto';

    if (shouldRunSwarm && agents.length > 1) {
      const activeSwarm = agents.slice(0, 3);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'Equipo Cooperativo Antigravity',
          text: `Desplegando colaboración de ${activeSwarm.length} agentes especializados:\n${activeSwarm.map((a, i) => `› Fase ${i + 1}: ${a.name} (${a.role})`).join('\n')}`,
          time: now,
          isAgent: true,
          isSwarmBadge: true,
        },
      ]);

      const newTaskId = `swarm-auto-${Date.now()}`;
      const newTask: TaskItem = {
        id: newTaskId,
        title: `[Equipo Cooperativo] ${userMsg}`,
        assignedAgentId: 'swarm-pipeline',
        status: 'in-progress',
        timestamp: now,
        logs: [`Orquestación cooperativa en ${currentWorkspace}: ${activeSwarm.map(a => a.name).join(' -> ')}`],
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
              logs: swarmResult.stepLogs || ['Ejecución cooperativa completada'],
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

    // Single Agent
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
      logs: [`Enviado a ${currentAgent.name} (${currentAgent.model})`, `Workspace: ${currentWorkspace}`, 'Procesando con contexto pre-ingestado...'],
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
            logs: [...t.logs, resp.text ? 'Ejecución exitosa.' : `Error: ${resp.error}`],
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

  // Run Arena
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

  // Run Diagnosis
  const handleDiagnoseError = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!errorInput.trim()) return;

    sounds.playHoverTick();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<ErrorDiagnosis> } } }).require('electron');
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

  // Optimize Prompt
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

  // Open File in Viewer
  const handleOpenFileInViewer = async (filePath: string) => {
    sounds.playHoverTick();
    setSelectedFileForViewer(filePath);
    setIsLoadingFile(true);
    setActiveTab('tools');

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

  // Start Feature Branch
  const handleStartFeature = async (e: React.FormEvent, featureName: string) => {
    e.preventDefault();
    sounds.playHoverTick();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean; branch: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('gitflow-start-feature', {
            featureName,
            cwd: currentWorkspace,
          });
          if (res && res.success) {
            sounds.playIslandExpand();
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

  // Create Release Tag
  const handleCreateRelease = async (e: React.FormEvent, versionTag: string) => {
    e.preventDefault();
    sounds.playHoverTick();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean; tag: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('gitflow-create-release', {
            versionTag,
            cwd: currentWorkspace,
          });
          if (res && res.success) {
            sounds.playIslandExpand();
            loadGitStatus(currentWorkspace);
          }
        }
      } catch (err) {
        console.error('Error creating release tag:', err);
      }
    }
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
            alert(`Sesión exportada con éxito en:\n${res.filePath}`);
          }
        }
      } catch (err) {
        console.error('Error exporting session:', err);
      }
    }
  };

  // Create .agents Rule
  const handleCreateRule = async (e: React.FormEvent, ruleName: string, content: string) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean; filePath: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('create-agent-rule', {
            workspace: currentWorkspace,
            ruleName,
            content: content || `# ${ruleName}\n\nDirectiva de desarrollo para el proyecto.`,
          });
          if (res && res.success) {
            sounds.playIslandExpand();
            loadWorkspaceDeepContext(currentWorkspace);
          }
        }
      } catch (err) {
        console.error('Error creating rule:', err);
      }
    }
  };

  // Swarm Pipeline Execution
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

  // Audit Mobile UI
  const handleAuditMobileUI = (deviceSpec: string, orientation: string) => {
    sounds.playHoverTick();
    handleSendPrompt(
      undefined,
      `Auditar exhaustivamente la vista móvil de la aplicación en viewport ${deviceSpec} (${orientation}):\n- Verificar zonas seguras de iOS (Dynamic Island y barra inferior de gestos).\n- Comprobar que los targets táctiles tengan mínimo 44x44px.\n- Validar ausencia de scroll horizontal no deseado y legibilidad tipográfica en pantallas reducidas.`
    );
    setShowMobileSimulator(false);
  };

  const activeAgent: Agent = agents.find(a => a.id === selectedAgentId) || agents[0] || {
    id: 'agent-gemini',
    name: 'Gemini Engine',
    role: 'Arquitecto de Software & Desarrollo',
    model: 'Gemini 3.7 Pro',
    status: 'idle',
    currentTask: '',
    avatarColor: 'from-emerald-400 to-lime-500',
    assignedWorkspace: '',
    memoryUsage: '0 MB',
    temperature: 0.2,
  };

  const isToolsActive = ['tools', 'arena', 'debugger', 'swarm', 'code-viewer', 'scratchpad', 'agents-context'].includes(activeTab);

  return (
    <div className="w-screen h-screen bg-[#0a0a0c] text-[#f5f5f7] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','Helvetica_Neue',sans-serif] flex select-none overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl backdrop-blur-2xl">
      {/* 0. Command Palette Modal (Cmd + K) */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        query={paletteQuery}
        setQuery={setPaletteQuery}
        onClose={() => setShowCommandPalette(false)}
        onNavigateTab={tab => setActiveTab(tab)}
        onOpenMobileSimulator={() => setShowMobileSimulator(true)}
      />

      {/* Mobile Simulator & Expo Inspector Modal */}
      <MobileSimulatorModal
        isOpen={showMobileSimulator}
        onClose={() => setShowMobileSimulator(false)}
        simulatorUrl={simulatorUrl}
        setSimulatorUrl={setSimulatorUrl}
        onRunCommand={handleRunCommand}
        onAuditMobileUI={handleAuditMobileUI}
      />

      {/* 1. Left Sidebar Navigation (5 Clean Sections) */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        geminiFiveHour={realQuotas.geminiFiveHour}
        credits={realQuotas.credits}
      />

      {/* 2. Right Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0c0f]">
        {/* Top Header Bar with Context HUD */}
        <DashboardHeader
          currentWorkspace={currentWorkspace}
          workspaceContext={workspaceContext}
          credits={realQuotas.credits}
          showMobileSimulator={showMobileSimulator}
          isMetroRunning={metroStatus.isRunning}
          onSelectWorkspace={handleSelectWorkspace}
          onToggleMobileSimulator={() => {
            setShowMobileSimulator(prev => !prev);
            sounds.playHoverTick();
            checkMetroStatus();
          }}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />

        {/* Main Tabs Canvas */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: ASISTENTE IA (CONSOLE) */}
          {activeTab === 'console' && (
            <ConsoleTab
              agents={agents}
              selectedAgentId={selectedAgentId}
              setSelectedAgentId={setSelectedAgentId}
              activeAgent={activeAgent}
              agentDispatchMode={agentDispatchMode}
              setAgentDispatchMode={setAgentDispatchMode}
              workspaceContext={workspaceContext}
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              isSendingPrompt={isSendingPrompt}
              promptInput={promptInput}
              setPromptInput={setPromptInput}
              isComplexityDetected={isComplexityDetected}
              onSendPrompt={handleSendPrompt}
              onRunCommand={handleRunCommand}
              onExportSession={handleExportSession}
              onOptimizePrompt={handleOptimizePrompt}
              onOpenMobileSimulator={() => setShowMobileSimulator(true)}
              promptQueueCount={promptQueue.length}
            />
          )}

          {/* TAB 2: CUOTAS Y MODELOS */}
          {activeTab === 'models' && (
            <ModelsQuotaTab
              realQuotas={realQuotas}
              onRefreshQuotas={fetchLiveTelemetry}
            />
          )}

          {/* TAB 3: PROYECTO & GIT */}
          {activeTab === 'git-manager' && (
            <GitManagerTab
              currentWorkspace={currentWorkspace}
              gitStatus={gitStatus}
              gitCommits={gitCommits}
              gitBranches={gitBranches}
              selectedCommit={selectedCommit}
              setSelectedCommit={setSelectedCommit}
              commitMessage={commitMessage}
              setCommitMessage={setCommitMessage}
              isGeneratingCommit={isGeneratingCommit}
              onRefreshGitStatus={() => loadGitStatus(currentWorkspace)}
              onCheckoutBranch={checkoutBranch}
              onStartFeature={handleStartFeature}
              onCreateRelease={handleCreateRelease}
              onGenerateAICommitMessage={generateAICommitMessage}
              onRunCommand={handleRunCommand}
              onSendPrompt={handleSendPrompt}
            />
          )}

          {/* TAB 4: HERRAMIENTAS PRO (ARENA, DEBUGGER, SWARM, CODE VIEWER, SCRATCHPAD, RULES) */}
          {isToolsActive && (
            <ToolsHubTab
              currentWorkspace={currentWorkspace}
              workspaceContext={workspaceContext}
              agents={agents}
              arenaPrompt={arenaPrompt}
              setArenaPrompt={setArenaPrompt}
              isExecutingArena={isExecutingArena}
              arenaResults={arenaResults}
              arenaExecutionTime={arenaExecutionTime}
              onRunArena={handleRunArena}
              errorInput={errorInput}
              setErrorInput={setErrorInput}
              errorDiagnosis={errorDiagnosis}
              onDiagnoseError={handleDiagnoseError}
              selectedFileForViewer={selectedFileForViewer}
              fileContent={fileContent}
              isLoadingFile={isLoadingFile}
              copySuccess={copySuccess}
              setCopySuccess={setCopySuccess}
              onOpenFileInViewer={handleOpenFileInViewer}
              scratchpadText={scratchpadText}
              isSavingScratchpad={isSavingScratchpad}
              onSaveScratchpad={handleSaveScratchpad}
              selectedSwarmAgentIds={selectedSwarmAgentIds}
              setSelectedSwarmAgentIds={setSelectedSwarmAgentIds}
              swarmPrompt={swarmPrompt}
              setSwarmPrompt={setSwarmPrompt}
              isExecutingSwarm={isExecutingSwarm}
              swarmProgressLogs={swarmProgressLogs}
              onRunSwarmPipeline={handleRunSwarmPipeline}
              onCreateRule={handleCreateRule}
              onSendPrompt={handleSendPrompt}
              onOpenMobileSimulator={() => setShowMobileSimulator(true)}
            />
          )}

          {/* TAB 4: AJUSTES & CUOTAS */}
          {activeTab === 'settings' && (
            <SettingsTab
              config={config}
              isSaved={isSaved}
              realQuotas={realQuotas}
              onRefreshQuotas={fetchLiveTelemetry}
              onUpdateConfig={newConfig => {
                setConfig(newConfig);
                autoSaveToDisk(newConfig, agents, tasks);
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};
