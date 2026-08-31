export type DashboardTab =
  | 'console'
  | 'arena'
  | 'swarm'
  | 'debugger'
  | 'code-viewer'
  | 'git-manager'
  | 'scratchpad'
  | 'agents-context'
  | 'models'
  | 'linking'
  | 'tools'
  | 'tasks'
  | 'settings';

export interface Agent {
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

export interface TaskItem {
  id: string;
  title: string;
  assignedAgentId: string;
  status: 'pending' | 'in-progress' | 'done';
  timestamp: string;
  logs: string[];
}

export interface SavedConfig {
  launchAtLogin: boolean;
  showInDock: boolean;
  autoHide: boolean;
  notchPosition: 'top-right' | 'center-right';
  shutterSound: boolean;
  blurIntensity: number;
  autoRefillAlerts: boolean;
}

export interface AccountCredentials {
  claudeApiKey: string;
  openaiApiKey: string;
  deepseekApiKey: string;
  openrouterApiKey: string;
}

export interface WorkspaceContextData {
  path: string;
  folderName: string;
  techStack: string;
  packageJson: {
    name?: string;
    version?: string;
    dependencies?: Record<string, string>;
    scripts?: Record<string, string>;
  } | null;
  totalFiles: number;
  filesList: { name: string; isDirectory: boolean; path: string }[];
  agentsCustomizations: {
    hasAgentsDir: boolean;
    skills: { name: string; description: string }[];
    rules: { name: string; preview: string }[];
  };
  contextSummary: string;
}

export interface GitFileInfo {
  status: string;
  file: string;
}

export interface GitCommitNode {
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

export interface GitBranchItem {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
}

export interface ArenaResult {
  modelId: string;
  modelName: string;
  provider: string;
  color: string;
  isRealAPI: boolean;
  latencyMs: number;
  text: string;
  tokenEstimate: number;
}

export interface RealQuotasState {
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
}

export interface ChatMessage {
  sender: string;
  text: string;
  time: string;
  isAgent: boolean;
  isSwarmBadge?: boolean;
}

export interface ErrorDiagnosis {
  affectedFile: string;
  lineNumber: string;
  summary: string;
  explanation: string;
  recommendedFix: string;
}
