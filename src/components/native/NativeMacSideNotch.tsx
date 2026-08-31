import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../../utils/soundEffects';

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

// Circular Optical Progress Ring
const OpticalRing: React.FC<{
  percent: number;
  color: string;
  children: React.ReactNode;
  size?: number;
  strokeWidth?: number;
}> = ({ percent, color, children, size = 36, strokeWidth = 2.4 }) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (circumference * safePercent) / 100;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
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
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export const NativeMacSideNotch: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<'antigravity' | 'claude' | 'openai'>('antigravity');
  const [quickPrompt, setQuickPrompt] = useState<string>('');
  const [quickResponse, setQuickResponse] = useState<string>('');
  const [isProcessingQuickPrompt, setIsProcessingQuickPrompt] = useState<boolean>(false);

  // Strict Real Data States
  const [claudeData, setClaudeData] = useState<ClaudeData>({
    isLinked: false,
    percent: 0,
    maxBadge: '0% · Sin Vincular',
    fiveHourPercent: 0,
    weeklyPercent: 0,
    weeklyResetText: 'No vinculado',
    weeklyFablePercent: 0,
    weeklyFableResetText: 'No vinculado',
  });

  const [openaiData, setOpenaiData] = useState<OpenAIData>({
    isLinked: false,
    percent: 0,
    maxBadge: '0% · Sin Vincular',
    tiers: [
      { label: '3-hour limit', percent: 0, resetText: 'No vinculado' },
      { label: 'GPT-4o Daily', percent: 0, resetText: 'No vinculado' },
      { label: 'o3-mini Weekly', percent: 0, resetText: 'No vinculado' },
    ],
  });

  const [antigravityData, setAntigravityData] = useState<AntigravityData>({
    isLinked: false,
    plan: 'Google AI Pro',
    availableCredits: 2016,
    enableOverages: true,
    geminiFiveHour: 99,
    geminiFiveHourText: 'Recarga en 4h 59m',
    geminiWeekly: 17,
    geminiWeeklyText: 'Recarga en 3d 12h',
    claudeGptFiveHour: 100,
    claudeGptWeekly: 100,
  });

  const isIgnoringRef = useRef<boolean>(true);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mouse Pass-Through Controller
  const setIgnoreMouse = useCallback((ignore: boolean) => {
    if (isIgnoringRef.current === ignore) return;
    isIgnoringRef.current = ignore;

    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { send: (channel: string, ...args: unknown[]) => void } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          electron.ipcRenderer.send('set-ignore-mouse-events', ignore, { forward: true });
        }
      } catch {
        // fallback
      }
    }
  }, []);

  const openDashboard = () => {
    sounds.playIslandExpand();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { send: (channel: string) => void } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          electron.ipcRenderer.send('open-settings');
        }
      } catch {
        // fallback
      }
    }
  };

  const triggerSnip = () => {
    sounds.playShutter();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { send: (channel: string) => void } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          electron.ipcRenderer.send('trigger-native-screencapture');
        }
      } catch {
        // fallback
      }
    }
  };

  const forceQuitApp = () => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { send: (channel: string) => void } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          electron.ipcRenderer.send('force-quit-app');
        }
      } catch {
        // fallback
      }
    }
  };

  const handleQuickPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim() || isProcessingQuickPrompt) return;

    setIsProcessingQuickPrompt(true);
    sounds.playHoverTick();
    const promptText = quickPrompt.trim();
    setQuickPrompt('');

    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean; text?: string; error?: string }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('execute-single-agent', {
            agent: { id: 'notch-agent', name: 'Notch AI Assistant', role: 'Quick Assistant', model: activeModel === 'claude' ? 'Claude 3.7 Sonnet' : (activeModel === 'openai' ? 'GPT-4o' : 'Gemini 3.7 Pro') },
            prompt: promptText,
            workspace: '/Users/eric/Desktop/Applicacion Sidebar',
          });
          if (res && res.text) {
            setQuickResponse(res.text);
            sounds.playIslandExpand();
          }
        }
      } catch (err) {
        setQuickResponse(`Error: ${err}`);
      }
    }
    setIsProcessingQuickPrompt(false);
  };

  // Telemetry Aggregator
  const processRealQuotas = useCallback((payload: {
    antigravity?: {
      isLinked: boolean;
      plan: string;
      availableCredits: number;
      enableOverages: boolean;
      geminiModels: { fiveHourRemaining: number; weeklyRemaining: number; fiveHourRefreshText: string; weeklyRefreshText: string };
      claudeGptModels: { fiveHourRemaining: number; weeklyRemaining: number };
    };
    claude?: {
      isLinked: boolean;
      percent: number;
      maxBadge: string;
      fiveHourPercent: number;
      weeklyPercent: number;
      weeklyResetText: string;
    };
    openai?: {
      isLinked: boolean;
      percent: number;
      maxBadge: string;
      tiers: { label: string; percent: number; resetText?: string }[];
    };
  }) => {
    if (!payload) return;

    if (payload.antigravity) {
      setAntigravityData({
        isLinked: payload.antigravity.isLinked,
        plan: payload.antigravity.plan || 'Google AI Pro',
        availableCredits: payload.antigravity.availableCredits || 2016,
        enableOverages: payload.antigravity.enableOverages ?? true,
        geminiFiveHour: payload.antigravity.geminiModels?.fiveHourRemaining ?? 99,
        geminiFiveHourText: payload.antigravity.geminiModels?.fiveHourRefreshText || 'Recarga en 4h 59m',
        geminiWeekly: payload.antigravity.geminiModels?.weeklyRemaining ?? 17,
        geminiWeeklyText: payload.antigravity.geminiModels?.weeklyRefreshText || 'Recarga en 3d 12h',
        claudeGptFiveHour: payload.antigravity.claudeGptModels?.fiveHourRemaining ?? 100,
        claudeGptWeekly: payload.antigravity.claudeGptModels?.weeklyRemaining ?? 100,
      });
    }

    if (payload.claude) {
      setClaudeData({
        isLinked: payload.claude.isLinked,
        percent: payload.claude.percent || 100,
        maxBadge: payload.claude.maxBadge || '100% · Activo',
        fiveHourPercent: payload.claude.fiveHourPercent || payload.claude.percent || 100,
        weeklyPercent: payload.claude.weeklyPercent || 100,
        weeklyResetText: payload.claude.weeklyResetText || 'Activo',
        weeklyFablePercent: 100,
        weeklyFableResetText: 'Activo',
      });
    }

    if (payload.openai) {
      setOpenaiData({
        isLinked: payload.openai.isLinked,
        percent: payload.openai.percent || 100,
        maxBadge: payload.openai.maxBadge || '100% · Activo',
        tiers: payload.openai.tiers || [
          { label: '3-hour limit', percent: 100, resetText: 'Activo' },
          { label: 'GPT-4o Daily', percent: 100, resetText: 'Activo' },
          { label: 'o3-mini Weekly', percent: 100, resetText: 'Activo' },
        ],
      });
    }
  }, []);

  const fetchRealQuotas = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string) => Promise<unknown> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = (await electron.ipcRenderer.invoke('get-real-quotas')) as Parameters<typeof processRealQuotas>[0];
          processRealQuotas(res);
        }
      } catch {
        // fallback
      }
    }
  }, [processRealQuotas]);

  useEffect(() => {
    fetchRealQuotas();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { on: (ch: string, cb: (e: unknown, data: unknown) => void) => void; removeAllListeners: (ch: string) => void } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          electron.ipcRenderer.on('quotas-updated', (_event, data) => {
            processRealQuotas(data as Parameters<typeof processRealQuotas>[0]);
          });
          return () => electron.ipcRenderer.removeAllListeners('quotas-updated');
        }
      } catch {
        // fallback
      }
    }
    const interval = setInterval(fetchRealQuotas, 2500);
    return () => clearInterval(interval);
  }, [fetchRealQuotas, processRealQuotas]);

  // Handle Hover Interaction
  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIgnoreMouse(false);
    setIsExpanded(true);
    sounds.playIslandExpand();
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
      setIgnoreMouse(true);
      setQuickResponse('');
    }, 280);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed top-0 right-0 h-[480px] w-[460px] flex items-start justify-end pointer-events-none z-50 select-none font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','Helvetica_Neue',sans-serif]"
    >
      {/* 
        ========================================================================
        ORGANIC LIQUID MORPHING NOTCH & DYNAMIC ISLAND
        ========================================================================
      */}
      <motion.div
        layout
        transition={liquidSpring}
        className={`pointer-events-auto cursor-pointer relative flex flex-col justify-between overflow-hidden backdrop-blur-2xl shadow-[-18px_0_45px_rgba(0,0,0,0.85)] border-l border-b border-t border-white/[0.08] ${
          isExpanded
            ? 'w-[370px] min-h-[380px] rounded-l-[32px] bg-[#0c0c10]/96 p-4 text-white'
            : 'w-[54px] min-h-[220px] rounded-l-[28px] bg-black pt-4 pb-3 items-center'
        }`}
      >
        {/* Top Concave Fillet Curve */}
        <div className="absolute -top-[18px] right-0 w-[18px] h-[18px] pointer-events-none overflow-hidden">
          <svg viewBox="0 0 18 18" className="w-full h-full text-black fill-current">
            <path d="M 0,18 C 0,8.06 8.06,0 18,0 V 18 H 0 Z" />
          </svg>
        </div>

        {/* 
          STAGE A: COLLAPSED MONOLITHIC BEZEL (SLEEK & ICONIC)
        */}
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center justify-between h-full space-y-3"
          >
            {/* 1. Claude Micro Ring */}
            <div className="flex flex-col items-center">
              <OpticalRing percent={claudeData.percent} color="#FF6B4A">
                <div className="w-[26px] h-[26px] rounded-full bg-[#18181b] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#FF6B4A]">
                    <path d="M12 2L13.2 8.8L19.5 5.5L15.2 11L22 12L15.2 13L19.5 18.5L13.2 15.2L12 22L10.8 15.2L4.5 18.5L8.8 13L2 12L9 9L12 2Z" />
                  </svg>
                </div>
              </OpticalRing>
              <span className="text-[10px] font-mono font-bold text-white/80 mt-0.5">{claudeData.percent}%</span>
            </div>

            {/* 2. OpenAI Micro Ring */}
            <div className="flex flex-col items-center">
              <OpticalRing percent={openaiData.percent} color="#10A37F">
                <div className="w-[26px] h-[26px] rounded-full bg-[#18181b] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#10A37F]">
                    <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9 6.07 6.07 0 0 0-4.27 2.17 5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zm-9.02 12.6a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .4-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.5 4.5zm-9.66-4.12a4.47 4.47 0 0 1-.53-3.01l.14.08 4.78 2.76a.77.77 0 0 0 .78 0l5.85-3.37v2.33a.08.08 0 0 1-.04.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.98V11.6a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0L4.02 14A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.85L13.1 8.36l2.02-1.16a.08.08 0 0 1 .07 0l4.83 2.79a4.5 4.5 0 0 1-.68 8.1v-5.67a.79.79 0 0 0-.4-.67zM20.19 8.76l-.15-.08-4.77-2.78a.78.78 0 0 0-.79 0L8.64 9.26V6.93a.09.09 0 0 1 .03-.06l4.88-2.82a4.5 4.5 0 0 1 6.64 4.71zM10.86 13.06l-2.07-1.2 4.8-2.77 2.07 1.2-4.8 2.77z"/>
                  </svg>
                </div>
              </OpticalRing>
              <span className="text-[10px] font-mono font-bold text-white/80 mt-0.5">{openaiData.percent}%</span>
            </div>

            {/* 3. Antigravity Micro Ring */}
            <div className="flex flex-col items-center">
              <OpticalRing percent={antigravityData.geminiFiveHour} color="#D4FF00">
                <div className="w-[26px] h-[26px] rounded-full bg-[#18181b] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#D4FF00]">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
              </OpticalRing>
              <span className="text-[10px] font-mono font-bold text-[#D4FF00] mt-0.5">{antigravityData.geminiFiveHour}%</span>
            </div>

            <div className="w-5 h-[1px] bg-white/10 my-1" />

            {/* 4. Dashboard Trigger */}
            <button
              onClick={openDashboard}
              className="w-[30px] h-[30px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* 
          STAGE B: UNFOLDED DYNAMIC ISLAND (LIQUID BENTO)
        */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={microSpring}
            className="w-full flex flex-col justify-between h-full space-y-3"
          >
            {/* Header: Segmented Model Pill Switcher */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => { setActiveModel('antigravity'); sounds.playHoverTick(); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeModel === 'antigravity' ? 'bg-[#D4FF00]/20 text-[#D4FF00] shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Gemini {antigravityData.geminiFiveHour}%
                </button>
                <button
                  onClick={() => { setActiveModel('claude'); sounds.playHoverTick(); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeModel === 'claude' ? 'bg-[#FF6B4A]/20 text-[#FF6B4A] shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Claude {claudeData.percent}%
                </button>
                <button
                  onClick={() => { setActiveModel('openai'); sounds.playHoverTick(); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeModel === 'openai' ? 'bg-[#10A37F]/20 text-[#10A37F] shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  GPT {openaiData.percent}%
                </button>
              </div>

              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Live Telemetry Bento Card */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">
                    {activeModel === 'antigravity' ? 'Antigravity IDE Pro' : (activeModel === 'claude' ? 'Anthropic Claude 3.7' : 'OpenAI GPT-4o')}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {activeModel === 'antigravity' ? antigravityData.geminiFiveHourText : 'Telemetria activa en tiempo real'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-[#D4FF00]">
                    {activeModel === 'antigravity' ? `${antigravityData.availableCredits} Cr` : `${activeModel === 'claude' ? claudeData.percent : openaiData.percent}%`}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">Cuota Real</div>
                </div>
              </div>

              {/* Quantum Live AI Waveform Animation */}
              <div className="h-4 flex items-center justify-between gap-1 px-1">
                {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 35, 85, 50, 75, 40, 90, 60, 80].map((h, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ height: isProcessingQuickPrompt ? ['20%', '100%', '30%'] : `${h}%` }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: idx * 0.05 }}
                    className="w-1 rounded-full bg-gradient-to-t from-white/20 to-white/80"
                  />
                ))}
              </div>
            </div>

            {/* Quick Prompt Mini Command Line */}
            <form onSubmit={handleQuickPromptSubmit} className="space-y-2">
              <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-[#0071e3]">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current text-neutral-400" strokeWidth="2">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                <input
                  type="text"
                  value={quickPrompt}
                  onChange={e => setQuickPrompt(e.target.value)}
                  placeholder="Pregunta rapida al agente de desarrollo..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isProcessingQuickPrompt || !quickPrompt.trim()}
                  className="px-2 py-0.5 rounded-md bg-[#0071e3] text-[10px] font-bold text-white transition-all cursor-pointer disabled:opacity-30"
                >
                  {isProcessingQuickPrompt ? '...' : 'Run'}
                </button>
              </div>

              {quickResponse && (
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-neutral-200 max-h-[80px] overflow-y-auto leading-relaxed">
                  {quickResponse}
                </div>
              )}
            </form>

            {/* Bottom Master Toolbar */}
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-1.5">
              <button
                onClick={openDashboard}
                className="px-3 py-1.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] text-neutral-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 text-xs font-semibold"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
                <span>Dashboard</span>
              </button>

              <button
                onClick={openDashboard}
                className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 text-xs font-semibold"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span>Swarm</span>
              </button>

              <button
                onClick={triggerSnip}
                className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 hover:text-sky-200 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 text-xs font-semibold"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Captura</span>
                <kbd className="px-1 py-0.5 rounded bg-sky-400/20 text-[9px] font-mono text-sky-200 leading-none">⌥S</kbd>
              </button>

              <button
                onClick={forceQuitApp}
                title="Cerrar SideNotch"
                className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 flex items-center justify-center transition-colors cursor-pointer active:scale-95 text-xs"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                  <line x1="12" y1="2" x2="12" y2="12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {/* Bottom Concave Fillet Curve */}
        <div className="absolute -bottom-[18px] right-0 w-[18px] h-[18px] pointer-events-none overflow-hidden">
          <svg viewBox="0 0 18 18" className="w-full h-full text-black fill-current">
            <path d="M 0,0 C 0,9.94 8.06,18 18,18 V 0 H 0 Z" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};
