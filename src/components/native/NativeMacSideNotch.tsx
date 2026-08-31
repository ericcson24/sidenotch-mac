import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../utils/soundEffects';

// Subcomponents
import { NotchFillets } from './notch/NotchFillets';
import { NotchBubbles } from './notch/NotchBubbles';
import { WaveformVisualizer } from './notch/WaveformVisualizer';
import { ModelSelectorPills } from './notch/ModelSelectorPills';
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
  const [activeModel, setActiveModel] = useState<'antigravity' | 'claude' | 'openai'>('antigravity');
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
    plan: 'Google AI Pro',
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
    antigravity?: {
      plan?: string;
      availableCredits?: number;
      enableOverages?: boolean;
      geminiModels?: { fiveHourRemaining: number; weeklyRemaining: number; fiveHourRefreshText: string; weeklyRefreshText: string };
      claudeGptModels?: { fiveHourRemaining: number; weeklyRemaining: number };
    };
    claude?: { isLinked: boolean; percent: number; maxBadge: string; error?: string };
    openai?: { isLinked: boolean; percent: number; maxBadge: string; error?: string };
  }) => {
    if (!data) return;

    if (data.antigravity) {
      setAntigravityData(prev => ({
        ...prev,
        isLinked: true,
        plan: data.antigravity?.plan || prev.plan,
        availableCredits: data.antigravity?.availableCredits ?? prev.availableCredits,
        enableOverages: data.antigravity?.enableOverages ?? prev.enableOverages,
        geminiFiveHour: data.antigravity?.geminiModels?.fiveHourRemaining ?? prev.geminiFiveHour,
        geminiFiveHourText: data.antigravity?.geminiModels?.fiveHourRefreshText || prev.geminiFiveHourText,
        geminiWeekly: data.antigravity?.geminiModels?.weeklyRemaining ?? prev.geminiWeekly,
        geminiWeeklyText: data.antigravity?.geminiModels?.weeklyRefreshText || prev.geminiWeeklyText,
        claudeGptFiveHour: data.antigravity?.claudeGptModels?.fiveHourRemaining ?? prev.claudeGptFiveHour,
        claudeGptWeekly: data.antigravity?.claudeGptModels?.weeklyRemaining ?? prev.claudeGptWeekly,
      }));
    }

    if (data.claude) {
      setClaudeData(prev => ({
        ...prev,
        isLinked: data.claude?.isLinked ?? prev.isLinked,
        percent: data.claude?.percent ?? prev.percent,
        maxBadge: data.claude?.maxBadge ?? prev.maxBadge,
      }));
    }

    if (data.openai) {
      setOpenAIData(prev => ({
        ...prev,
        isLinked: data.openai?.isLinked ?? prev.isLinked,
        percent: data.openai?.percent ?? prev.percent,
        maxBadge: data.openai?.maxBadge ?? prev.maxBadge,
      }));
    }
  }, []);

  const fetchLiveQuotas = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (channel: string) => Promise<unknown> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const data = (await electron.ipcRenderer.invoke('get-real-quotas')) as Parameters<typeof updateTelemetry>[0];
          updateTelemetry(data);
        }
      } catch {
        // Fallback
      }
    }
  }, [updateTelemetry]);

  useEffect(() => {
    fetchLiveQuotas();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { on: (ch: string, cb: (e: unknown, data: unknown) => void) => void; removeAllListeners: (ch: string) => void } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          electron.ipcRenderer.on('quotas-updated', (_event, data) => {
            updateTelemetry(data as Parameters<typeof updateTelemetry>[0]);
          });
          return () => {
            electron.ipcRenderer.removeAllListeners('quotas-updated');
          };
        }
      } catch {
        // Fallback
      }
    }
  }, [fetchLiveQuotas, updateTelemetry]);

  const handleMouseEnter = () => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    if (!isExpanded) {
      setIsExpanded(true);
      sounds.playIslandExpand();
      if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
        try {
          const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { send: (ch: string) => void } } }).require('electron');
          if (electron && electron.ipcRenderer) {
            electron.ipcRenderer.send('notch-hover-enter');
          }
        } catch {
          // Fallback
        }
      }
    }
  };

  const handleMouseLeave = () => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
      sounds.playIslandCollapse();
      setQuickResponse('');
      if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
        try {
          const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { send: (ch: string) => void } } }).require('electron');
          if (electron && electron.ipcRenderer) {
            electron.ipcRenderer.send('notch-hover-leave');
          }
        } catch {
          // Fallback
        }
      }
    }, 320);
  };

  const handleOpenDashboard = () => {
    sounds.playIslandExpand();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { send: (ch: string) => void } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          electron.ipcRenderer.send('open-settings-window');
        }
      } catch {
        // Fallback
      }
    }
  };

  const handleQuickExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim() || isProcessingQuickPrompt) return;

    setIsProcessingQuickPrompt(true);
    sounds.playHoverTick();

    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean; text: string; error?: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('execute-single-agent', {
            agent: {
              id: 'agent-quick',
              name: activeModel === 'antigravity' ? 'Gemini 3.7 Engine' : activeModel === 'claude' ? 'Claude 3.7 Sonnet' : 'OpenAI GPT-4o',
              model: activeModel === 'antigravity' ? 'Gemini 3.7 Pro' : activeModel === 'claude' ? 'Claude 3.7 Sonnet' : 'GPT-4o',
              role: 'Desarrollo Rápido',
            },
            prompt: quickPrompt.trim(),
            workspace: '/Users/eric/Desktop/Applicacion Sidebar',
          });

          if (res && res.text) {
            setQuickResponse(res.text);
            sounds.playIslandExpand();
          } else {
            setQuickResponse(res.error || 'Instrucción procesada.');
          }
        }
      } catch (err) {
        setQuickResponse(`Error: ${err}`);
      }
    }
    setIsProcessingQuickPrompt(false);
    setQuickPrompt('');
  };

  const currentPercent = activeModel === 'antigravity'
    ? antigravityData.geminiFiveHour
    : activeModel === 'claude'
      ? claudeData.percent
      : openAIData.percent;

  const currentColor = activeModel === 'antigravity'
    ? '#D4FF00'
    : activeModel === 'claude'
      ? '#FF6B4A'
      : '#10A37F';

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
          width: isExpanded ? 370 : 56,
          height: isExpanded ? 460 : 260,
        }}
        transition={liquidSpring}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`pointer-events-auto relative flex flex-col justify-between overflow-hidden bg-[#050508] border-l border-t border-b border-white/[0.12] shadow-2xl backdrop-blur-3xl transition-colors duration-300 ${
          isExpanded ? 'rounded-l-[32px] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)]' : 'rounded-l-[26px] py-3.5 px-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.75)] cursor-pointer'
        }`}
      >
        {/* Concave Bezier Anchors to Screen Border */}
        <NotchFillets />

        {/* 
          1. COMPACT LIQUID BUBBLES STATE (Interactive AI Badges like Reference Design)
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
              {/* Stack of Floating AI Badges + Settings Button */}
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
          2. EXPANDED MONOLITH STATE
        */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={microSpring}
            className="h-full flex flex-col justify-between space-y-3.5"
          >
            {/* Top Bar with Brand & Dashboard Trigger */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentColor }} />
                <span className="text-xs font-bold tracking-tight text-white uppercase">SideNotch AI</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">120Hz</span>
              </div>

              <button
                onClick={handleOpenDashboard}
                title="Abrir Dashboard Completo"
                className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </button>
            </div>

            {/* Model Selector Segmented Pills */}
            <ModelSelectorPills
              activeModel={activeModel}
              setActiveModel={setActiveModel}
              claudeLinked={claudeData.isLinked}
              openaiLinked={openAIData.isLinked}
            />

            {/* Quantum Live Waveform Spectrum */}
            <div className="p-3 rounded-2xl bg-black/50 border border-white/[0.06] flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[11px] font-mono font-bold text-white">Quantum Spectral Waveform</div>
                <div className="text-[9.5px] font-mono text-neutral-400">Latencia estimada: &lt; 28ms · Zero Copy</div>
              </div>
              <WaveformVisualizer color={currentColor} isExpanded={true} />
            </div>

            {/* Quota Telemetry Gauges */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">
                  {activeModel === 'antigravity' ? 'Cuota Gemini 3.7' : activeModel === 'claude' ? 'Cuota Claude 3.7' : 'Cuota OpenAI GPT'}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  {activeModel === 'antigravity' ? antigravityData.geminiFiveHourText : 'Sincronizado con Antigravity Quota Reader'}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold font-mono" style={{ color: currentColor }}>
                  {currentPercent}%
                </span>
                <div className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: currentColor }} />
                </div>
              </div>
            </div>

            {/* Mini-CLI Direct Prompt Input */}
            <MiniCLIInput
              activeModelName={activeModel === 'antigravity' ? 'Gemini 3.7' : activeModel === 'claude' ? 'Claude 3.7' : 'GPT-4o'}
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
