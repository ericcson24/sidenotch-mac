import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../utils/soundEffects';

// Subcomponents
import { NotchFillets } from './notch/NotchFillets';
import { NotchBubbles } from './notch/NotchBubbles';
import { MiniCLIInput } from './notch/MiniCLIInput';

interface ClaudeData {
  isLinked: boolean;
  percent: number;
  maxBadge: string;
  fiveHourPercent: number;
  weeklyPercent: number;
  weeklyResetText: string;
  weeklyFablePercent: number;
  weeklyFableResetText: string;
}

interface OpenAIData {
  isLinked: boolean;
  percent: number;
  maxBadge: string;
  tiers: { label: string; percent: number; resetText?: string }[];
}

interface AntigravityData {
  isLinked: boolean;
  plan: string;
  availableCredits: number;
  enableOverages: boolean;
  geminiFiveHour: number;
  geminiFiveHourText: string;
  geminiWeekly: number;
  geminiWeeklyText: string;
  claudeGptFiveHour: number;
  claudeGptWeekly: number;
}

// Master Apple Fluid Spring Constants (SwiftUI .spring(response: 0.42, dampingFraction: 0.74))
const liquidSpring = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 26,
  mass: 0.6,
};

const microSpring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 24,
  mass: 0.4,
};

export const NativeMacSideNotch: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<'claude' | 'openai' | 'antigravity'>('claude');
  const [quickPrompt, setQuickPrompt] = useState<string>('');
  const [quickResponse, setQuickResponse] = useState<string>('');
  const [isProcessingQuickPrompt, setIsProcessingQuickPrompt] = useState<boolean>(false);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [claudeData, setClaudeData] = useState<ClaudeData>({
    isLinked: false,
    percent: 100,
    maxBadge: '5h',
    fiveHourPercent: 100,
    weeklyPercent: 100,
    weeklyResetText: 'En 5 días',
    weeklyFablePercent: 100,
    weeklyFableResetText: 'En 5 días',
  });

  const [openAIData, setOpenAIData] = useState<OpenAIData>({
    isLinked: false,
    percent: 100,
    maxBadge: 'Tier 1',
    tiers: [
      { label: 'GPT-4o', percent: 100, resetText: '5h restantes' },
      { label: 'o3-mini', percent: 100, resetText: '5h restantes' },
    ],
  });

  const [antigravityData, setAntigravityData] = useState<AntigravityData>({
    isLinked: true,
    plan: 'Google AI Studio',
    availableCredits: 2016,
    enableOverages: true,
    geminiFiveHour: 99,
    geminiFiveHourText: 'Recarga en 4 horas, 59 minutos.',
    geminiWeekly: 17,
    geminiWeeklyText: 'Recarga en 3 días, 12 horas.',
    claudeGptFiveHour: 100,
    claudeGptWeekly: 100,
  });

  const updateTelemetry = useCallback((data: {
    geminiFiveHour?: number;
    geminiFiveHourText?: string;
    geminiWeekly?: number;
    geminiWeeklyText?: string;
    credits?: number;
    plan?: string;
    enableOverages?: boolean;
    claudeFiveHour?: number;
    claudeWeekly?: number;
    gptFiveHour?: number;
    claudeLinked?: boolean;
    openaiLinked?: boolean;
  }) => {
    if (data.geminiFiveHour !== undefined) {
      setAntigravityData(prev => ({
        ...prev,
        geminiFiveHour: data.geminiFiveHour ?? prev.geminiFiveHour,
        geminiFiveHourText: data.geminiFiveHourText || prev.geminiFiveHourText,
        geminiWeekly: data.geminiWeekly ?? prev.geminiWeekly,
        geminiWeeklyText: data.geminiWeeklyText || prev.geminiWeeklyText,
        availableCredits: data.credits ?? prev.availableCredits,
        plan: data.plan || prev.plan,
        enableOverages: data.enableOverages ?? prev.enableOverages,
      }));
    }

    if (data.claudeFiveHour !== undefined || data.claudeLinked !== undefined) {
      setClaudeData(prev => ({
        ...prev,
        percent: data.claudeFiveHour ?? prev.percent,
        fiveHourPercent: data.claudeFiveHour ?? prev.fiveHourPercent,
        weeklyPercent: data.claudeWeekly ?? prev.weeklyPercent,
        isLinked: data.claudeLinked ?? prev.isLinked,
      }));
    }

    if (data.gptFiveHour !== undefined || data.openaiLinked !== undefined) {
      setOpenAIData(prev => ({
        ...prev,
        percent: data.gptFiveHour ?? prev.percent,
        isLinked: data.openaiLinked ?? prev.isLinked,
        tiers: [
          { label: 'GPT-4o', percent: data.gptFiveHour ?? 100, resetText: '5h restantes' },
          { label: 'o3-mini', percent: data.gptFiveHour ?? 100, resetText: '5h restantes' },
        ],
      }));
    }
  }, []);

  useEffect(() => {
    try {
      const electron = (window as unknown as { require?: (mod: string) => { ipcRenderer: { on: (ch: string, cb: (e: unknown, data: any) => void) => void; invoke: (ch: string) => Promise<any>; removeAllListeners: (ch: string) => void } } }).require?.('electron');
      if (electron?.ipcRenderer) {
        electron.ipcRenderer.invoke('get-real-quotas').then(quotas => {
          if (quotas) updateTelemetry(quotas);
        }).catch(() => {});

        electron.ipcRenderer.on('quotas-updated', (_event, data) => {
          if (data) updateTelemetry(data);
        });
      }
    } catch {}

    const interval = setInterval(() => {
      try {
        const electron = (window as unknown as { require?: (mod: string) => { ipcRenderer: { invoke: (ch: string) => Promise<any> } } }).require?.('electron');
        if (electron?.ipcRenderer) {
          electron.ipcRenderer.invoke('get-real-quotas').then(quotas => {
            if (quotas) updateTelemetry(quotas);
          }).catch(() => {});
        }
      } catch {}
    }, 15000);

    return () => clearInterval(interval);
  }, [updateTelemetry]);

  const handleMouseEnter = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    if (!isExpanded) {
      sounds.playIslandExpand();
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    collapseTimerRef.current = setTimeout(() => {
      sounds.playIslandCollapse();
      setIsExpanded(false);
      setQuickPrompt('');
      setQuickResponse('');
    }, 400);
  };

  const handleOpenDashboard = () => {
    sounds.playHoverTick();
    try {
      const electron = (window as unknown as { require?: (mod: string) => { ipcRenderer: { send: (ch: string) => void; invoke: (ch: string) => Promise<any> } } }).require?.('electron');
      if (electron?.ipcRenderer) {
        electron.ipcRenderer.send('open-dashboard');
        electron.ipcRenderer.send('open-settings');
      } else {
        window.location.hash = 'dashboard';
      }
    } catch {
      window.location.hash = 'dashboard';
    }
  };

  const handleQuickExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim() || isProcessingQuickPrompt) return;

    setIsProcessingQuickPrompt(true);
    sounds.playShutter();

    try {
      const electron = (window as unknown as { require?: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: any) => Promise<any> } } }).require?.('electron');
      if (electron?.ipcRenderer) {
        const modelName = activeModel === 'antigravity' ? 'gemini-3.7-pro' : activeModel === 'claude' ? 'claude-3.7-sonnet' : 'gpt-4o';
        const response = await electron.ipcRenderer.invoke('execute-single-agent', {
          agent: { name: currentModelName, model: modelName, role: 'Asistente IA' },
          prompt: quickPrompt.trim(),
          workspace: ''
        });
        setQuickResponse(response?.text || 'Tarea procesada correctamente.');
      } else {
        setQuickResponse('Instrucción enviada.');
      }
    } catch {
      setQuickResponse('Error al procesar.');
    } finally {
      setIsProcessingQuickPrompt(false);
    }
  };

  const currentColor = activeModel === 'claude'
    ? '#FF6B4A'
    : activeModel === 'openai'
      ? '#10A37F'
      : '#D4FF00';

  const currentPercent = activeModel === 'claude'
    ? claudeData.percent
    : activeModel === 'openai'
      ? openAIData.percent
      : antigravityData.geminiFiveHour;

  const currentModelName = activeModel === 'claude'
    ? 'Claude 3.7 Sonnet'
    : activeModel === 'openai'
      ? 'OpenAI GPT-4o'
      : 'Gemini 3.7 Pro';

  const currentPlan = activeModel === 'claude'
    ? (claudeData.isLinked ? 'Anthropic Pro' : 'Sin conectar')
    : activeModel === 'openai'
      ? (openAIData.isLinked ? 'OpenAI Tier 1' : 'Sin conectar')
      : antigravityData.plan;

  const bubbleModels = [
    {
      id: 'claude' as const,
      name: 'Claude 3.7 Sonnet (Anthropic)',
      shortName: 'CLD',
      percent: claudeData.percent,
      color: '#FF6B4A',
      glowColor: 'rgba(255, 107, 74, 0.4)',
      isLinked: claudeData.isLinked,
      badgeText: claudeData.isLinked ? `5h: ${claudeData.percent}%` : 'Conectar API',
    },
    {
      id: 'openai' as const,
      name: 'OpenAI GPT-4o',
      shortName: 'GPT',
      percent: openAIData.percent,
      color: '#10A37F',
      glowColor: 'rgba(16, 163, 127, 0.4)',
      isLinked: openAIData.isLinked,
      badgeText: openAIData.isLinked ? `Cuota: ${openAIData.percent}%` : 'Conectar API',
    },
    {
      id: 'antigravity' as const,
      name: 'Gemini 3.7 Pro (Google AI)',
      shortName: 'GEM',
      percent: antigravityData.geminiFiveHour,
      color: '#D4FF00',
      glowColor: 'rgba(212, 255, 0, 0.4)',
      isLinked: true,
      badgeText: `${antigravityData.availableCredits} Cr · 5h: ${antigravityData.geminiFiveHour}%`,
    },
  ];

  return (
    <div
      className="fixed top-0 right-0 h-screen flex items-center justify-end pointer-events-none select-none z-50 overflow-visible font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','Helvetica_Neue',sans-serif]"
    >
      <motion.div
        layout
        initial={{ width: 56, height: 260 }}
        animate={{
          width: isExpanded ? 360 : 56,
          height: isExpanded ? 440 : 260,
        }}
        transition={liquidSpring}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`pointer-events-auto relative flex flex-col justify-between overflow-hidden bg-[#050508] border-l border-t border-b border-white/[0.12] shadow-2xl backdrop-blur-3xl transition-colors duration-300 ${
          isExpanded ? 'rounded-l-[30px] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.88)]' : 'rounded-l-[26px] py-3.5 px-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.75)] cursor-pointer'
        }`}
      >
        {/* Concave Bezier Anchors to Screen Border */}
        <NotchFillets />

        {/* 
          1. COMPACT LIQUID BUBBLES STATE (CodeBurn CapacityDock Rail)
        */}
        {!isExpanded && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={microSpring}
              className="h-full flex flex-col items-center justify-between"
            >
              <NotchBubbles
                models={bubbleModels}
                activeModel={activeModel}
                onSelectModel={setActiveModel}
                onExpandNotch={handleMouseEnter}
                onOpenSettings={handleOpenDashboard}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* 
          2. EXPANDED CAPACITY DOCK DETAIL STATE (CodeBurn CapacityDockDetailView)
        */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={microSpring}
            className="h-full flex flex-col justify-between space-y-3"
          >
            {/* Header: Provider Title, Plan Badge & Settings Button */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentColor }} />
                <span className="text-sm font-semibold text-[#FAF5E6] tracking-tight">{currentModelName} Usage</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-neutral-400 bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/10">
                  {currentPlan}
                </span>
                <button
                  onClick={handleOpenDashboard}
                  title="Abrir Dashboard Completo"
                  className="p-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Model Selector Segmented Tabs */}
            <div className="p-1 rounded-xl bg-black/50 border border-white/[0.06] flex items-center gap-1">
              {[
                { id: 'claude' as const, label: 'Claude', color: '#FF6B4A' },
                { id: 'openai' as const, label: 'OpenAI', color: '#10A37F' },
                { id: 'antigravity' as const, label: 'Gemini', color: '#D4FF00' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveModel(tab.id); sounds.playHoverTick(); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeModel === tab.id
                      ? 'bg-white/10 text-white shadow-sm border border-white/10'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tab.color }} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Capacity Breakdown Rows (CodeBurn Style) */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2.5">
              {/* Row 1: 5-Hour Limit */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-300">5-hour limit</span>
                  <span className="font-mono font-bold text-[#FAF5E6]">{currentPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${currentPercent}%`, backgroundColor: currentColor }}
                  />
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  {activeModel === 'antigravity' ? antigravityData.geminiFiveHourText : 'Recarga automática calculada'}
                </div>
              </div>

              {/* Row 2: Weekly Limit (if Gemini) or Credits */}
              {activeModel === 'antigravity' && (
                <div className="space-y-1 pt-1.5 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-300">Weekly limit</span>
                    <span className="font-mono font-bold text-[#FAF5E6]">{antigravityData.geminiWeekly}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out bg-[#D4FF00]"
                      style={{ width: `${antigravityData.geminiWeekly}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                    <span>{antigravityData.geminiWeeklyText}</span>
                    <span className="text-white font-semibold">{antigravityData.availableCredits} cr</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mini-CLI Direct Prompt Input */}
            <MiniCLIInput
              activeModelName={currentModelName}
              quickPrompt={quickPrompt}
              setQuickPrompt={setQuickPrompt}
              quickResponse={quickResponse}
              isProcessing={isProcessingQuickPrompt}
              onSubmit={handleQuickExecute}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
