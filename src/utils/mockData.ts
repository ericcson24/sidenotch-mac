import type { LLMQuota, WorkspaceFolder, ChatMessage, SnipItem } from '../types';

export const INITIAL_QUOTAS: LLMQuota[] = [
  {
    id: 'antigravity',
    name: 'Antigravity IDE Pro',
    provider: 'Google DeepMind',
    model: 'Gemini 3.7 Flash (High) + Claude 3.7 Sonnet',
    tier: 'Agentic Super-Tier',
    accentColor: '#38bdf8', // Cyan
    glowColor: 'rgba(56, 189, 248, 0.4)',
    usedTokens: 142500,
    totalTokens: 200000,
    usedPercentage: 71.25,
    requestsToday: 384,
    maxRequests: 500,
    burnRatePerHour: 18400,
    nextRefillTime: '14:00',
    refillAmount: 57500,
    resetInMinutes: 102,
    status: 'healthy',
    isActiveInIDE: true,
    history: [
      { time: '09:00', tokens: 25000 },
      { time: '10:00', tokens: 62000 },
      { time: '11:00', tokens: 98000 },
      { time: '12:00', tokens: 142500 },
    ],
  },
  {
    id: 'vscode-copilot',
    name: 'VS Code Copilot Hub',
    provider: 'GitHub / Microsoft',
    model: 'Copilot Chat (Claude 3.7 & GPT-4o)',
    tier: 'Copilot Business',
    accentColor: '#a855f7', // Purple
    glowColor: 'rgba(168, 85, 247, 0.4)',
    usedTokens: 310,
    totalTokens: 500, // Premium chats quota
    usedPercentage: 62.0,
    requestsToday: 89,
    maxRequests: 150,
    burnRatePerHour: 45,
    nextRefillTime: 'Mañana 00:00',
    refillAmount: 500,
    resetInMinutes: 700,
    status: 'healthy',
    isActiveInIDE: true,
    history: [
      { time: '09:00', tokens: 80 },
      { time: '10:00', tokens: 150 },
      { time: '11:00', tokens: 240 },
      { time: '12:00', tokens: 310 },
    ],
  },
  {
    id: 'claude-pro',
    name: 'Anthropic Claude 3.7',
    provider: 'Anthropic API',
    model: 'Claude 3.7 Sonnet (Thinking 8k)',
    tier: 'Tier 4 API + Claude Pro',
    accentColor: '#fb923c', // Amber / Coral
    glowColor: 'rgba(251, 146, 60, 0.4)',
    usedTokens: 412000,
    totalTokens: 500000,
    usedPercentage: 82.4,
    requestsToday: 142,
    maxRequests: 200,
    burnRatePerHour: 32000,
    nextRefillTime: '15:30',
    refillAmount: 150000,
    resetInMinutes: 192,
    status: 'warning',
    isActiveInIDE: false,
    history: [
      { time: '09:00', tokens: 90000 },
      { time: '10:00', tokens: 185000 },
      { time: '11:00', tokens: 310000 },
      { time: '12:00', tokens: 412000 },
    ],
  },
  {
    id: 'openai-o3',
    name: 'OpenAI o3 & GPT-4o',
    provider: 'OpenAI Dev Tier',
    model: 'o3-mini-high & gpt-4o-2024-11-20',
    tier: 'Usage Tier 5',
    accentColor: '#34d399', // Emerald
    glowColor: 'rgba(52, 211, 153, 0.4)',
    usedTokens: 68500,
    totalTokens: 250000,
    usedPercentage: 27.4,
    requestsToday: 54,
    maxRequests: 1000,
    burnRatePerHour: 8200,
    nextRefillTime: 'En 5h 20m',
    refillAmount: 181500,
    resetInMinutes: 320,
    status: 'healthy',
    isActiveInIDE: false,
    history: [
      { time: '09:00', tokens: 12000 },
      { time: '10:00', tokens: 31000 },
      { time: '11:00', tokens: 49000 },
      { time: '12:00', tokens: 68500 },
    ],
  },
];

export const INITIAL_WORKSPACES: WorkspaceFolder[] = [
  {
    id: 'ws-1',
    name: 'Applicacion Sidebar',
    path: '/Users/eric/Desktop/Applicacion Sidebar',
    activeFile: 'src/components/sidecar/SideNotch.tsx',
    tokenBurnTotal: 48900,
    fileCount: 24,
    branch: 'main'
  },
  {
    id: 'ws-2',
    name: 'Antigravity-AI-Engine',
    path: '/Users/eric/Development/core-agent-system',
    activeFile: 'engine/runtime/orchestrator.ts',
    tokenBurnTotal: 124500,
    fileCount: 86,
    branch: 'feature/liquid-glass'
  },
  {
    id: 'ws-3',
    name: 'Liquid-UI-DesignSystem',
    path: '/Users/eric/Design/apple-vision-tokens',
    activeFile: 'tokens/glassmorphism.css',
    tokenBurnTotal: 18200,
    fileCount: 14,
    branch: 'master'
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    model: 'Gemini 3.7 Flash',
    text: '¿Cuánta cuota me queda en Antigravity y cuándo se resetean los tokens para la sesión de la tarde?',
    timestamp: Date.now() - 1000 * 60 * 18,
    tokensUsed: 420
  },
  {
    id: 'msg-2',
    sender: 'assistant',
    model: 'Gemini 3.7 Flash',
    text: 'Te quedan **57,500 tokens disponibles (28.75% de tu cuota actual)** en Antigravity IDE. La próxima recarga programada de **+57,500 tokens** ocurrirá a las **14:00 (en 1h 42m)**. En VS Code Copilot tienes 190 solicitudes rápidas intactas.',
    timestamp: Date.now() - 1000 * 60 * 17,
    tokensUsed: 680,
    suggestedActions: [
      '⚡ Optimizar consumo con Gemini Flash',
      '📸 Capturar snippet de código con Snipaste',
      '🔄 Forzar verificación de cuota'
    ]
  },
  {
    id: 'msg-3',
    sender: 'user',
    model: 'Claude 3.7 Sonnet',
    text: 'He adjuntado una captura de la interfaz. ¿Puedes revisar la curva de refracción del Liquid Glass?',
    timestamp: Date.now() - 1000 * 60 * 5,
    tokensUsed: 890,
    attachedSnipUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'msg-4',
    sender: 'assistant',
    model: 'Claude 3.7 Sonnet',
    text: '¡Revisado! El desenfoque (`backdrop-filter: blur(32px) saturate(190%)`) y el borde especular superior con gradiente de luz reproducen la física de VisionOS y macOS. Te sugiero aumentar el resorte de apertura a `damping: 26` para una respuesta aún más orgánica.',
    timestamp: Date.now() - 1000 * 60 * 4,
    tokensUsed: 1120
  }
];

export const INITIAL_SNIPS: SnipItem[] = [
  {
    id: 'snip-1',
    timestamp: Date.now() - 1000 * 60 * 35,
    imageDataUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    width: 320,
    height: 190,
    x: 80,
    y: 120,
    isPinned: true,
    opacity: 0.95,
    scale: 1,
    ocrText: 'const liquidShader = {\n  blur: "32px",\n  saturation: "190%",\n  specular: "0.35"\n};',
    aiAnalysis: 'Estructura de objeto de configuración para shader de vidrio líquido. Sintaxis limpia sin errores.'
  }
];
