import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LLMQuota, SnipItem, ChatMessage, WorkspaceFolder, SidecarTab, DockPosition, ColorSample } from '../types';
import { INITIAL_QUOTAS, INITIAL_WORKSPACES, INITIAL_MESSAGES, INITIAL_SNIPS } from '../utils/mockData';
import { sounds } from '../utils/soundEffects';

interface AppContextType {
  // Sidecar & Notch state
  isExpanded: boolean;
  isPeekOpen: boolean;
  activeTab: SidecarTab;
  dockPosition: DockPosition;
  toggleExpand: () => void;
  openSidecar: (tab?: SidecarTab) => void;
  closeSidecar: () => void;
  setIsPeekOpen: (open: boolean) => void;
  setActiveTab: (tab: SidecarTab) => void;
  setDockPosition: (pos: DockPosition) => void;

  // Quotas & LLM
  quotas: LLMQuota[];
  selectedQuotaId: string;
  setSelectedQuotaId: (id: string) => void;
  selectedQuota: LLMQuota;
  consumeTokens: (quotaId: string, amount: number) => void;
  refillQuota: (quotaId: string) => void;
  totalTokensRemaining: number;
  totalTokensCapacity: number;

  // Snipaste & Screen Capture
  isSnipMode: boolean;
  startSnipMode: () => void;
  cancelSnipMode: () => void;
  snips: SnipItem[];
  pinnedSnips: SnipItem[];
  addSnip: (snip: Omit<SnipItem, 'id' | 'timestamp'>) => void;
  togglePinSnip: (id: string) => void;
  removeSnip: (id: string) => void;
  updateSnipPosition: (id: string, x: number, y: number) => void;
  updateSnipOpacity: (id: string, opacity: number) => void;
  activeColor: ColorSample;
  setActiveColor: (color: ColorSample) => void;

  // Prompter & Chat
  messages: ChatMessage[];
  sendMessage: (text: string, model?: string, attachedSnipUrl?: string) => Promise<void>;
  isGenerating: boolean;
  clearHistory: () => void;

  // Workspaces
  workspaces: WorkspaceFolder[];
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  activeWorkspace: WorkspaceFolder | undefined;

  // Desktop Simulator & Config
  wallpaper: string;
  setWallpaper: (wp: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  isMobileDeviceView: boolean;
  setIsMobileDeviceView: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const WALLPAPERS = [
  { id: 'sequoia-dark', name: 'macOS Sequoia Dark', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&auto=format&fit=crop&q=85' },
  { id: 'sonoma-night', name: 'Sonoma Horizon', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&auto=format&fit=crop&q=85' },
  { id: 'dark-cyber', name: 'Obsidian Aurora', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1920&auto=format&fit=crop&q=85' },
  { id: 'studio-abstract', name: 'Vision Liquid Mesh', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1920&auto=format&fit=crop&q=85' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Notch & Sidecar state
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isPeekOpen, setIsPeekOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<SidecarTab>('quotas');
  const [dockPosition, setDockPosition] = useState<DockPosition>('right');

  // Quotas
  const [quotas, setQuotas] = useState<LLMQuota[]>(INITIAL_QUOTAS);
  const [selectedQuotaId, setSelectedQuotaId] = useState<string>('antigravity');

  // Snipaste
  const [isSnipMode, setIsSnipMode] = useState<boolean>(false);
  const [snips, setSnips] = useState<SnipItem[]>(INITIAL_SNIPS);
  const [activeColor, setActiveColor] = useState<ColorSample>({ hex: '#38bdf8', rgb: '56, 189, 248', hsl: '199, 89%, 60%' });

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Workspaces
  const [workspaces] = useState<WorkspaceFolder[]>(INITIAL_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws-1');

  // Simulator
  const [wallpaper, setWallpaper] = useState<string>(WALLPAPERS[0].url);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isMobileDeviceView, setIsMobileDeviceView] = useState<boolean>(false);

  const selectedQuota = quotas.find(q => q.id === selectedQuotaId) || quotas[0];
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
  const pinnedSnips = snips.filter(s => s.isPinned);

  const totalTokensCapacity = quotas.reduce((acc, q) => acc + q.totalTokens, 0);
  const totalTokensRemaining = quotas.reduce((acc, q) => acc + (q.totalTokens - q.usedTokens), 0);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  const toggleExpand = () => {
    setIsExpanded(prev => {
      const next = !prev;
      if (next) sounds.playIslandExpand();
      return next;
    });
  };

  const openSidecar = (tab?: SidecarTab) => {
    if (tab) setActiveTab(tab);
    setIsExpanded(true);
    sounds.playIslandExpand();
  };

  const closeSidecar = () => {
    setIsExpanded(false);
  };

  const consumeTokens = (quotaId: string, amount: number) => {
    setQuotas(prev =>
      prev.map(q => {
        if (q.id !== quotaId) return q;
        const newUsed = Math.min(q.totalTokens, q.usedTokens + amount);
        const newPercent = (newUsed / q.totalTokens) * 100;
        const status = newPercent > 90 ? 'critical' : newPercent > 75 ? 'warning' : 'healthy';
        return {
          ...q,
          usedTokens: newUsed,
          usedPercentage: Number(newPercent.toFixed(1)),
          requestsToday: q.requestsToday + 1,
          status,
        };
      })
    );
  };

  const refillQuota = (quotaId: string) => {
    setQuotas(prev =>
      prev.map(q => {
        if (q.id !== quotaId) return q;
        return {
          ...q,
          usedTokens: Math.max(0, q.usedTokens - q.refillAmount),
          usedPercentage: Number((Math.max(0, q.usedTokens - q.refillAmount) / q.totalTokens * 100).toFixed(1)),
          status: 'healthy',
          resetInMinutes: 180,
          nextRefillTime: new Date(Date.now() + 180 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );
    sounds.playColorCopy();
  };

  // Snipaste operations
  const startSnipMode = () => {
    setIsSnipMode(true);
    setIsExpanded(false);
    sounds.playHoverTick();
  };

  const cancelSnipMode = () => {
    setIsSnipMode(false);
  };

  const addSnip = (snipData: Omit<SnipItem, 'id' | 'timestamp'>) => {
    const newSnip: SnipItem = {
      ...snipData,
      id: `snip-${Date.now()}`,
      timestamp: Date.now(),
    };
    setSnips(prev => [newSnip, ...prev]);
    sounds.playShutter();
  };

  const togglePinSnip = (id: string) => {
    setSnips(prev =>
      prev.map(s => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
    sounds.playHoverTick();
  };

  const removeSnip = (id: string) => {
    setSnips(prev => prev.filter(s => s.id !== id));
  };

  const updateSnipPosition = (id: string, x: number, y: number) => {
    setSnips(prev => prev.map(s => (s.id === id ? { ...s, x, y } : s)));
  };

  const updateSnipOpacity = (id: string, opacity: number) => {
    setSnips(prev => prev.map(s => (s.id === id ? { ...s, opacity } : s)));
  };

  // Chat & Prompts
  const sendMessage = async (text: string, model = 'Gemini 3.7 Flash', attachedSnipUrl?: string) => {
    if (!text.trim() && !attachedSnipUrl) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      model,
      text,
      timestamp: Date.now(),
      tokensUsed: 250 + Math.floor(Math.random() * 300),
      attachedSnipUrl,
    };

    setMessages(prev => [...prev, userMsg]);
    consumeTokens('antigravity', userMsg.tokensUsed || 300);
    setIsGenerating(true);

    // Realistic streaming simulation with Apple/Antigravity intelligence
    setTimeout(() => {
      let replyText = '';
      const sampleActions: string[] = [];

      if (attachedSnipUrl) {
        replyText = `📸 **Captura Snipaste analizada con éxito (${model})**:\n\nHe extraído el bloque visual y verificado el contexto. Se detecta una interfaz con renderizado Liquid Glass y curvas de resorte nativas. Los tokens de tu cuenta en Antigravity han registrado esta petición (-480 tokens) y tu cuota restante sigue en nivel óptimo (71%).`;
        sampleActions.push('📌 Fijar análisis en ventana flotante', '📋 Copiar código extraído', '🚀 Enviar a VS Code');
      } else if (text.toLowerCase().includes('cuota') || text.toLowerCase().includes('token')) {
        replyText = `📊 **Diagnóstico de Cuotas y Límites:**\n- **Antigravity IDE**: ${quotas[0].totalTokens - quotas[0].usedTokens} tokens disponibles. Próximo reset a las ${quotas[0].nextRefillTime}.\n- **VS Code Copilot**: ${500 - quotas[1].usedTokens} solicitudes disponibles.\n- **Velocidad de quema**: ~18.4k tokens/hora.\n\nTodo opera dentro del rango seguro sin riesgo de estrangulamiento de tasa (rate-limit).`;
        sampleActions.push('⚡ Optimizar prompts largos', '🔄 Forzar sincronización de cuotas');
      } else {
        replyText = `Entendido. He procesado tu solicitud en el workspace \`${activeWorkspace?.name}\` usando **${model}**. El contexto de los archivos activos está sincronizado y listo para ejecutar en tu entorno local.`;
        sampleActions.push('📂 Ver archivos afectados', '⚡ Ver tokens consumidos');
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        model,
        text: replyText,
        timestamp: Date.now(),
        tokensUsed: 520 + Math.floor(Math.random() * 400),
        suggestedActions: sampleActions,
      };

      setMessages(prev => [...prev, assistantMsg]);
      consumeTokens('antigravity', assistantMsg.tokensUsed || 500);
      setIsGenerating(false);
      sounds.playHoverTick();
    }, 1200);
  };

  const clearHistory = () => {
    setMessages([]);
  };

  // Keyboard global shortcuts (Option + Space, Option + S for Snipaste)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Option + Space (Alt + Space) to toggle sidecar
      if (e.altKey && e.code === 'Space') {
        e.preventDefault();
        toggleExpand();
      }
      // Option + S (Alt + S) for Snipaste
      if (e.altKey && (e.code === 'KeyS' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        startSnipMode();
      }
      // Escape to cancel snip or close expanded
      if (e.key === 'Escape') {
        if (isSnipMode) {
          cancelSnipMode();
        } else if (isExpanded) {
          closeSidecar();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSnipMode, isExpanded]);

  return (
    <AppContext.Provider
      value={{
        isExpanded,
        isPeekOpen,
        activeTab,
        dockPosition,
        toggleExpand,
        openSidecar,
        closeSidecar,
        setIsPeekOpen,
        setActiveTab,
        setDockPosition,
        quotas,
        selectedQuotaId,
        setSelectedQuotaId,
        selectedQuota,
        consumeTokens,
        refillQuota,
        totalTokensRemaining,
        totalTokensCapacity,
        isSnipMode,
        startSnipMode,
        cancelSnipMode,
        snips,
        pinnedSnips,
        addSnip,
        togglePinSnip,
        removeSnip,
        updateSnipPosition,
        updateSnipOpacity,
        activeColor,
        setActiveColor,
        messages,
        sendMessage,
        isGenerating,
        clearHistory,
        workspaces,
        activeWorkspaceId,
        setActiveWorkspaceId,
        activeWorkspace,
        wallpaper,
        setWallpaper,
        soundEnabled,
        toggleSound,
        isMobileDeviceView,
        setIsMobileDeviceView,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
