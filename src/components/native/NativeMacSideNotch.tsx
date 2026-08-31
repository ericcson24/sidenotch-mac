import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../utils/soundEffects';

// Subcomponents
import { NotchFillets } from './notch/NotchFillets';
import { NotchBubbles } from './notch/NotchBubbles';

interface ClaudeData {
  isLinked: boolean;
  percent: number;
  maxBadge: string;
  fiveHourPercent: number;
  fiveHourResetText: string;
  weeklyPercent: number;
  weeklyResetText: string;
  weeklyFablePercent: number;
  weeklyFableResetText: string;
}

interface OpenAIData {
  isLinked: boolean;
  percent: number;
  maxBadge: string;
  fiveHourPercent: number;
  fiveHourResetText: string;
  weeklyPercent: number;
  weeklyResetText: string;
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
}

export const NativeMacSideNotch: React.FC = () => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<'claude' | 'openai' | 'antigravity'>('claude');
  const [quickPrompt, setQuickPrompt] = useState<string>('');
  const [quickResponse, setQuickResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [claudeData, setClaudeData] = useState<ClaudeData>({
    isLinked: true,
    percent: 15,
    maxBadge: 'Max 20x',
    fiveHourPercent: 7,
    fiveHourResetText: 'Resets in 3h 1m',
    weeklyPercent: 15,
    weeklyResetText: 'Resets in 5d 22h',
    weeklyFablePercent: 13,
    weeklyFableResetText: 'Resets in 5d 22h',
  });

  const [openAIData, setOpenAIData] = useState<OpenAIData>({
    isLinked: true,
    percent: 0,
    maxBadge: 'Tier 1',
    fiveHourPercent: 0,
    fiveHourResetText: 'Resets in 5h 0m',
    weeklyPercent: 0,
    weeklyResetText: 'Resets in 7d 0h',
  });

  const [antigravityData, setAntigravityData] = useState<AntigravityData>({
    isLinked: true,
    plan: 'Pro Plan',
    availableCredits: 2016,
    enableOverages: true,
    geminiFiveHour: 100,
    geminiFiveHourText: 'Resets in 4h 59m',
    geminiWeekly: 42,
    geminiWeeklyText: 'Resets in 3d 12h',
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
        fiveHourPercent: data.gptFiveHour ?? prev.fiveHourPercent,
        isLinked: data.openaiLinked ?? prev.isLinked,
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
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    collapseTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      setQuickPrompt('');
      setQuickResponse('');
    }, 300);
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
    if (!quickPrompt.trim() || isProcessing) return;

    setIsProcessing(true);
    sounds.playShutter();

    try {
      const electron = (window as unknown as { require?: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: any) => Promise<any> } } }).require?.('electron');
      if (electron?.ipcRenderer) {
        const modelName = activeModel === 'antigravity' ? 'gemini-3.7-pro' : activeModel === 'claude' ? 'claude-3.7-sonnet' : 'gpt-4o';
        const response = await electron.ipcRenderer.invoke('execute-single-agent', {
          agent: { name: activeModel, model: modelName, role: 'Asistente IA' },
          prompt: quickPrompt.trim(),
          workspace: ''
        });
        setQuickResponse(response?.text || 'Completado con éxito.');
      } else {
        setQuickResponse('Enviado.');
      }
    } catch {
      setQuickResponse('Error al ejecutar.');
    } finally {
      setIsProcessing(false);
    }
  };

  const bubbleModels = [
    {
      id: 'claude' as const,
      name: 'Claude 3.7 Sonnet',
      shortName: 'CLD',
      percent: claudeData.percent,
      color: '#30d158',
      glowColor: 'rgba(48, 209, 88, 0.4)',
      isLinked: claudeData.isLinked,
      badgeText: '5h: 7% · W: 15%',
    },
    {
      id: 'openai' as const,
      name: 'OpenAI GPT-4o',
      shortName: 'GPT',
      percent: openAIData.percent,
      color: '#10a37f',
      glowColor: 'rgba(16, 163, 127, 0.4)',
      isLinked: openAIData.isLinked,
      badgeText: '0% usado',
    },
    {
      id: 'antigravity' as const,
      name: 'Kiro / Gemini Pro',
      shortName: 'GEM',
      percent: antigravityData.geminiFiveHour,
      color: '#ff453a',
      glowColor: 'rgba(255, 69, 58, 0.4)',
      isLinked: true,
      badgeText: `${antigravityData.availableCredits} cr · 100%`,
    },
  ];

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed top-6 right-0 flex items-center justify-end pointer-events-auto select-none z-50 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','Helvetica_Neue',sans-serif]"
    >
      {/* 
        1. THE FLOATING POPUP FLYOUT CARD (CODEBURN CapacityDockDetailView)
      */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="mr-3 relative w-[310px] rounded-2xl bg-[#0e0f14] border border-white/10 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col space-y-4 backdrop-blur-3xl"
          >
            {/* Triangular Tail Arrow pointing to the Right Rail */}
            <div
              className="absolute -right-2 top-10 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-[#0e0f14]"
              style={{
                top: activeModel === 'claude' ? '28px' : activeModel === 'openai' ? '88px' : '148px',
              }}
            />

            {/* Header: Model Title + Plan Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {activeModel === 'claude' && (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white text-white">
                    <path d="M12 2a1 1 0 0 1 1 1v6.586l4.657-4.657a1 1 0 1 1 1.414 1.414L14.414 11H21a1 1 0 1 1 0 2h-6.586l4.657 4.657a1 1 0 0 1-1.414 1.414L13 14.414V21a1 1 0 1 1-2 0v-6.586l-4.657 4.657a1 1 0 0 1-1.414-1.414L9.586 13H3a1 1 0 1 1 0-2h6.586L4.929 6.343a1 1 0 0 1 1.414-1.414L11 9.586V3a1 1 0 0 1 1-1z" />
                  </svg>
                )}
                {activeModel === 'openai' && (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white text-white">
                    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073z" />
                  </svg>
                )}
                {activeModel === 'antigravity' && (
                  <span className="font-bold font-sans text-sm tracking-tighter text-white">
                    K<span className="text-[10px] align-super">˙</span>
                  </span>
                )}
                <h3 className="text-base font-bold text-white tracking-tight">
                  {activeModel === 'claude' ? 'Claude Usage' : activeModel === 'openai' ? 'OpenAI Usage' : 'Kiro / Gemini Usage'}
                </h3>
              </div>

              <span className="text-xs font-mono text-neutral-400">
                {activeModel === 'claude' ? claudeData.maxBadge : activeModel === 'openai' ? openAIData.maxBadge : antigravityData.plan}
              </span>
            </div>

            {/* Capacity Breakdown Rows (Exact CodeBurn layout) */}
            <div className="space-y-3.5">
              {/* Row 1: 5-hour */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-200">5-hour</span>
                  <span className="font-mono font-bold text-white">
                    {activeModel === 'claude' ? `${claudeData.fiveHourPercent}%` : activeModel === 'openai' ? `${openAIData.fiveHourPercent}%` : `${antigravityData.geminiFiveHour}%`}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#30d158] transition-all duration-500"
                    style={{
                      width: activeModel === 'claude' ? `${claudeData.fiveHourPercent}%` : activeModel === 'openai' ? `${openAIData.fiveHourPercent}%` : `${antigravityData.geminiFiveHour}%`,
                      backgroundColor: activeModel === 'antigravity' ? '#ff453a' : '#30d158',
                    }}
                  />
                </div>
                <div className="text-[10px] font-mono text-neutral-500 text-right">
                  {activeModel === 'claude' ? claudeData.fiveHourResetText : activeModel === 'openai' ? openAIData.fiveHourResetText : antigravityData.geminiFiveHourText}
                </div>
              </div>

              {/* Row 2: Weekly */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-200">Weekly</span>
                  <span className="font-mono font-bold text-white">
                    {activeModel === 'claude' ? `${claudeData.weeklyPercent}%` : activeModel === 'openai' ? `${openAIData.weeklyPercent}%` : `${antigravityData.geminiWeekly}%`}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#30d158] transition-all duration-500"
                    style={{
                      width: activeModel === 'claude' ? `${claudeData.weeklyPercent}%` : activeModel === 'openai' ? `${openAIData.weeklyPercent}%` : `${antigravityData.geminiWeekly}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] font-mono text-neutral-500 text-right">
                  {activeModel === 'claude' ? claudeData.weeklyResetText : activeModel === 'openai' ? openAIData.weeklyResetText : antigravityData.geminiWeeklyText}
                </div>
              </div>

              {/* Row 3: Weekly · Fable or Credits */}
              {activeModel === 'claude' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-200">Weekly · Fable</span>
                    <span className="font-mono font-bold text-white">{claudeData.weeklyFablePercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#30d158] transition-all duration-500"
                      style={{ width: `${claudeData.weeklyFablePercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 text-right">
                    {claudeData.weeklyFableResetText}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Prompt & Dashboard Launch Button */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <form onSubmit={handleQuickExecute} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={quickPrompt}
                  onChange={e => setQuickPrompt(e.target.value)}
                  placeholder={`Preguntar a ${activeModel}...`}
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3]"
                />
                <button
                  type="submit"
                  disabled={isProcessing || !quickPrompt.trim()}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer disabled:opacity-40 transition-colors"
                >
                  {isProcessing ? '...' : '↵'}
                </button>
              </form>

              {quickResponse && (
                <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] font-mono text-neutral-300 max-h-20 overflow-y-auto leading-relaxed">
                  {quickResponse}
                </div>
              )}

              <button
                onClick={handleOpenDashboard}
                className="w-full py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Abrir Dashboard Completo</span>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        2. THE SOLID RIGHT RAIL (CapacityDock Rail with Concave Fillets)
      */}
      <div className="relative w-[68px] py-4 rounded-l-[26px] bg-[#090a0f] border-l border-t border-b border-white/[0.12] shadow-2xl flex flex-col items-center justify-center">
        {/* Concave Fillets curving into screen border */}
        <NotchFillets />

        {/* 3 Model Squircles + Bottom Dashboard Button */}
        <NotchBubbles
          models={bubbleModels}
          activeModel={activeModel}
          onSelectModel={setActiveModel}
          onOpenDashboard={handleOpenDashboard}
        />
      </div>
    </div>
  );
};
