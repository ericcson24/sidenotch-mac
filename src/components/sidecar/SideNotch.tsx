import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NotchPill } from './NotchPill';
import { NotchPeek } from './NotchPeek';
import { QuotaRadar } from '../panels/QuotaRadar';
import { PromptHub } from '../panels/PromptHub';
import { MobileSync } from '../panels/MobileSync';
import { SettingsPanel } from '../panels/SettingsPanel';
import { 
  Activity, MessageSquare, Scissors, Smartphone,
  Settings, X, Sparkles, FolderGit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../utils/soundEffects';
import type { SidecarTab } from '../../types';

export const SideNotch: React.FC = () => {
  const {
    isExpanded,
    isPeekOpen,
    activeTab,
    dockPosition,
    toggleExpand,
    closeSidecar,
    setIsPeekOpen,
    setActiveTab,
    startSnipMode,
    quotas,
    activeWorkspace,
  } = useApp();

  const [mouseNearEdge, setMouseNearEdge] = useState(false);
  const antigravityQuota = quotas.find(q => q.id === 'antigravity') || quotas[0];

  // Screen Edge Hover Proximity Detector
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = 32; // Pixels from screen edge
      const isNearRight = dockPosition === 'right' && e.clientX >= window.innerWidth - threshold;
      const isNearLeft = dockPosition === 'left' && e.clientX <= threshold;

      if (isNearRight || isNearLeft) {
        if (!mouseNearEdge && !isExpanded) {
          sounds.playHoverTick();
        }
        setMouseNearEdge(true);
        setIsPeekOpen(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [dockPosition, mouseNearEdge, isExpanded, setIsPeekOpen]);

  const handlePillHover = () => {
    sounds.playHoverTick();
    setIsPeekOpen(true);
  };

  const handleTabChange = (tab: SidecarTab) => {
    setActiveTab(tab);
    sounds.playHoverTick();
  };

  const isRight = dockPosition === 'right';

  return (
    <div
      className={`fixed top-0 bottom-0 z-50 pointer-events-none flex items-center ${
        isRight ? 'right-0 justify-end' : 'left-0 justify-start'
      }`}
    >
      {/* 1. DOCKED PILL (When not expanded and not peeking) */}
      {!isExpanded && !isPeekOpen && (
        <div className="pointer-events-auto my-auto transition-transform duration-300 ease-out">
          <NotchPill onHoverStart={handlePillHover} onClick={toggleExpand} />
        </div>
      )}

      {/* 2. HOVER PEEK ISLAND (When hovered near edge) */}
      <AnimatePresence>
        {!isExpanded && isPeekOpen && (
          <div
            onMouseLeave={() => setIsPeekOpen(false)}
            className="pointer-events-auto p-4 my-auto flex items-center"
          >
            <NotchPeek onExpand={toggleExpand} onSnip={startSnipMode} />
          </div>
        )}
      </AnimatePresence>

      {/* 3. FULL EXPANDED SIDECAR HUD (Apple Liquid Glass Window) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: isRight ? 120 : -120, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: isRight ? 120 : -120, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.9 }}
            className={`
              pointer-events-auto h-[94vh] max-h-[900px] w-[500px] max-w-[94vw] my-auto ${isRight ? 'mr-4' : 'ml-4'}
              rounded-[32px] liquid-glass
              border border-white/20
              shadow-[-24px_24px_70px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.4)]
              flex flex-col overflow-hidden
              sheen-effect
            `}
          >
            {/* Top Liquid Glass Header Bar */}
            <div className="p-4 pb-3 flex items-center justify-between border-b border-white/10 bg-white/[0.02]">
              {/* Dynamic Island Title Badge */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-[1px] shadow-lg">
                  <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center text-sky-300">
                    <Sparkles className="w-4 h-4 animate-island-pulse" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-white tracking-tight">
                      SideNotch <span className="text-sky-400 font-normal text-xs font-mono">v1.4</span>
                    </h2>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-dot" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <FolderGit2 className="w-3 h-3 text-slate-400" />
                    <span>{activeWorkspace?.name}</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 hidden sm:inline-block">
                  Esc
                </span>
                <button
                  onClick={closeSidecar}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors spring-interactive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20 gap-1 overflow-x-auto">
              <button
                onClick={() => handleTabChange('quotas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all spring-interactive shrink-0 ${
                  activeTab === 'quotas'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Cuotas LLM</span>
              </button>

              <button
                onClick={() => handleTabChange('prompts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all spring-interactive shrink-0 ${
                  activeTab === 'prompts'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat & Prompts</span>
              </button>

              <button
                onClick={() => {
                  startSnipMode();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all spring-interactive shrink-0"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Snipaste (⌥S)</span>
              </button>

              <button
                onClick={() => handleTabChange('mobilesync')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all spring-interactive shrink-0 ${
                  activeTab === 'mobilesync'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Móvil</span>
              </button>

              <button
                onClick={() => handleTabChange('settings')}
                className={`p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 ${
                  activeTab === 'settings' ? 'bg-white/10 text-white' : ''
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Main Panel Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === 'quotas' && <QuotaRadar />}
              {activeTab === 'prompts' && <PromptHub />}
              {activeTab === 'mobilesync' && <MobileSync />}
              {activeTab === 'settings' && <SettingsPanel />}
            </div>

            {/* Bottom Status Ticker Bar */}
            <div className="p-3 bg-black/40 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Antigravity: {(100 - antigravityQuota.usedPercentage).toFixed(0)}% restante</span>
              </div>
              <div>
                <span>Reset: {antigravityQuota.nextRefillTime}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
