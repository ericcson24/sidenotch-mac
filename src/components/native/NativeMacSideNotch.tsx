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
  const [activeModel, setActiveModel] = useState<'claude' | 'openai' | 'antigravity'>('antigravity');
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
    plan: 'Google AI Pro',
    availableCredits: 1896,
    enableOverages: true,
    geminiFiveHour: 100,
    geminiFiveHourText: 'it will fully refresh in 2 hours, 59 minutes.',
    geminiWeekly: 1,
    geminiWeeklyText: 'You have used some of your weekly limit, it will fully refresh in 2 days, 20 hours.',
  });

  const updateTelemetry = useCallback((data: any) => {
    if (!data) return;

    // Handle Antigravity / Gemini live telemetry
    const ag = data.antigravity || data;
    const gemini5h = ag.geminiFiveHour ?? ag.geminiModels?.fiveHourRemaining;
    const gemini5hText = ag.geminiFiveHourText || ag.geminiModels?.fiveHourRefreshText;
    const geminiWeekly = ag.geminiWeekly ?? ag.geminiModels?.weeklyRemaining;
    const geminiWeeklyText = ag.geminiWeeklyText || ag.geminiModels?.weeklyRefreshText;
    const credits = ag.credits ?? ag.availableCredits;
    const plan = ag.plan;
    const enableOverages = ag.enableOverages;

    if (gemini5h !== undefined || geminiWeekly !== undefined || credits !== undefined || plan !== undefined) {
      setAntigravityData(prev => ({
        ...prev,
        geminiFiveHour: gemini5h !== undefined ? gemini5h : prev.geminiFiveHour,
        geminiFiveHourText: gemini5hText || prev.geminiFiveHourText,
        geminiWeekly: geminiWeekly !== undefined ? geminiWeekly : prev.geminiWeekly,
        geminiWeeklyText: geminiWeeklyText || prev.geminiWeeklyText,
        availableCredits: credits !== undefined ? credits : prev.availableCredits,
        plan: plan || prev.plan,
        enableOverages: enableOverages !== undefined ? enableOverages : prev.enableOverages,
      }));
    }

    // Handle Claude
    const cld = data.claude || data;
    const cld5h = cld.claudeFiveHour ?? cld.fiveHourPercent ?? cld.percent;
    const cldWeekly = cld.claudeWeekly ?? cld.weeklyPercent;
    const cldLinked = cld.claudeLinked ?? cld.isLinked;

    if (cld5h !== undefined || cldLinked !== undefined) {
      setClaudeData(prev => ({
        ...prev,
        percent: cld5h ?? prev.percent,
        fiveHourPercent: cld5h ?? prev.fiveHourPercent,
        weeklyPercent: cldWeekly ?? prev.weeklyPercent,
        isLinked: cldLinked ?? prev.isLinked,
      }));
    }

    // Handle OpenAI
    const gpt = data.openai || data;
    const gpt5h = gpt.gptFiveHour ?? gpt.fiveHourPercent ?? gpt.percent;
    const gptLinked = gpt.openaiLinked ?? gpt.isLinked;

    if (gpt5h !== undefined || gptLinked !== undefined) {
      setOpenAIData(prev => ({
        ...prev,
        percent: gpt5h ?? prev.percent,
        fiveHourPercent: gpt5h ?? prev.fiveHourPercent,
        isLinked: gptLinked ?? prev.isLinked,
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
    }, 10000);

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
      name: 'Gemini (Antigravity)',
      shortName: 'GEM',
      percent: antigravityData.geminiWeekly,
      color: antigravityData.geminiWeekly <= 15 ? '#ff453a' : '#30d158',
      glowColor: 'rgba(255, 69, 58, 0.4)',
      isLinked: true,
      badgeText: `${antigravityData.availableCredits} cr · ${antigravityData.geminiWeekly}%`,
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
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white text-white">
                    <path d="M12 1L14.7 9.3L23 12L14.7 14.7L12 23L9.3 14.7L1 12L9.3 9.3L12 1Z" />
                  </svg>
                )}
                <h3 className="text-base font-bold text-white tracking-tight">
                  {activeModel === 'claude' ? 'Claude Usage' : activeModel === 'openai' ? 'OpenAI Usage' : 'Gemini Usage'}
                </h3>
              </div>

              <span className="text-xs font-mono text-neutral-400">
                {activeModel === 'claude' ? claudeData.maxBadge : activeModel === 'openai' ? openAIData.maxBadge : antigravityData.plan}
              </span>
            </div>

            {/* Capacity Breakdown Rows (Exact CodeBurn layout with Live LanguageServer Quotas) */}
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
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: activeModel === 'claude' ? `${claudeData.fiveHourPercent}%` : activeModel === 'openai' ? `${openAIData.fiveHourPercent}%` : `${antigravityData.geminiFiveHour}%`,
                      backgroundColor: '#30d158',
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
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: activeModel === 'claude' ? `${claudeData.weeklyPercent}%` : activeModel === 'openai' ? `${openAIData.weeklyPercent}%` : `${antigravityData.geminiWeekly}%`,
                      backgroundColor: activeModel === 'antigravity' && antigravityData.geminiWeekly <= 15 ? '#ff453a' : '#30d158',
                    }}
                  />
                </div>
                <div className="text-[10px] font-mono text-neutral-500 text-right leading-tight">
                  {activeModel === 'claude' ? claudeData.weeklyResetText : activeModel === 'openai' ? openAIData.weeklyResetText : antigravityData.geminiWeeklyText}
                </div>
              </div>

              {/* Row 3: Available AI Credits for Antigravity or Weekly Fable */}
              {activeModel === 'antigravity' && (
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-amber-400 fill-none stroke-current" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span className="font-medium text-neutral-300">Available AI Credits:</span>
                  </div>
                  <span className="font-mono font-bold text-amber-300">{antigravityData.availableCredits.toLocaleString()} cr</span>
                </div>
              )}

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

            {/* Direct Prompt Input (Minimal) */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <form onSubmit={handleQuickExecute} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={quickPrompt}
                  onChange={e => setQuickPrompt(e.target.value)}
                  placeholder={`Preguntar a ${activeModel === 'antigravity' ? 'Gemini' : activeModel}...`}
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
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
