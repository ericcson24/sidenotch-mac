export type QuotaStatus = 'healthy' | 'warning' | 'critical' | 'refilling';

export interface TokenHistoryPoint {
  time: string;
  tokens: number;
}

export interface LLMQuota {
  id: string;
  name: string;
  provider: string;
  model: string;
  tier: string;
  accentColor: string;
  glowColor: string;
  usedTokens: number;
  totalTokens: number;
  usedPercentage: number;
  requestsToday: number;
  maxRequests: number;
  burnRatePerHour: number;
  nextRefillTime: string;
  refillAmount: number;
  resetInMinutes: number;
  status: QuotaStatus;
  history: TokenHistoryPoint[];
  isActiveInIDE?: boolean;
}

export interface SnipItem {
  id: string;
  timestamp: number;
  imageDataUrl: string;
  width: number;
  height: number;
  x: number;
  y: number;
  isPinned: boolean;
  opacity: number;
  scale: number;
  ocrText?: string;
  aiAnalysis?: string;
  annotations?: Annotation[];
}

export interface Annotation {
  id: string;
  type: 'rect' | 'arrow' | 'blur' | 'text' | 'highlight';
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  text?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  model: string;
  text: string;
  timestamp: number;
  tokensUsed?: number;
  attachedSnipId?: string;
  attachedSnipUrl?: string;
  suggestedActions?: string[];
}

export interface WorkspaceFolder {
  id: string;
  name: string;
  path: string;
  activeFile?: string;
  tokenBurnTotal: number;
  fileCount: number;
  branch?: string;
}

export type SidecarTab = 'quotas' | 'snipaste' | 'prompts' | 'workspaces' | 'mobilesync' | 'settings';
export type DockPosition = 'right' | 'left';

export interface ColorSample {
  hex: string;
  rgb: string;
  hsl: string;
}
