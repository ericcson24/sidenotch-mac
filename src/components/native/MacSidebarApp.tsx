import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { QuotaRadar } from '../panels/QuotaRadar';
import { PromptHub } from '../panels/PromptHub';
import { MobileSync } from '../panels/MobileSync';
import { SettingsPanel } from '../panels/SettingsPanel';
import { 
  Activity, MessageSquare, Scissors, Smartphone, 
  Settings, FolderGit2, ChevronRight, ChevronLeft,
  Sparkles, Clock, Maximize2, Minimize2, Pin, PinOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../utils/soundEffects';
import type { SidecarTab } from '../../types';

export const MacSidebarApp: React.FC = () => {
  const {
    isExpanded,
    openSidecar,
    closeSidecar,
    activeTab,
    setActiveTab,
    startSnipMode,
    activeWorkspace,
    workspaces,
    setActiveWorkspaceId,
  } = useApp();

  const [sidebarWidth, setSidebarWidth] = useState<number>(440);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);

  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTabChange = (tab: SidecarTab) => {
    setActiveTab(tab);
    sounds.playHoverTick();
  };

  // Hover Proximity Handlers
  const handleMouseEnterSidebar = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (!isExpanded) {
      openSidecar();
    }
  };

  const handleMouseLeaveSidebar = () => {
    if (isPinned) return; // If pinned open, do not auto-close
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = setTimeout(() => {
      closeSidecar();
    }, 450);
  };

  // Drag resizer on left border of sidebar
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = window.innerWidth - moveEvent.clientX;
      if (newWidth >= 340 && newWidth <= 720) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      {/* 1. COLLAPSED DOCKED HOVER STRIP & PILL ON RIGHT EDGE */}
      <AnimatePresence>
        {!isExpanded && (
          <>
            {/* Invisible Proximity Trigger Strip on right screen edge */}
            <div
              onMouseEnter={handleMouseEnterSidebar}
              className="fixed top-0 right-0 bottom-0 w-8 z-40 cursor-pointer pointer-events-auto"
              title="Acerca el ratón para abrir el Sidebar lateral"
            />

            {/* Visual Docked Pill on the right edge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onMouseEnter={handleMouseEnterSidebar}
              onClick={() => openSidecar()}
              className="fixed right-0 top-1/2 -translate-y-1/2 z-40 cursor-pointer group pointer-events-auto"
            >
              <div className="
                relative h-36 w-8 rounded-l-2xl
                bg-[#0c0c0e]/95 backdrop-blur-2xl
                border-y border-l border-white/20
                shadow-[-8px_0_28px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.3)]
                flex flex-col items-center justify-between py-3 px-1
                group-hover:w-11 group-hover:bg-[#18181b]
                transition-all duration-300 ease-out
              ">
                {/* Dynamic Indicator */}
                <div
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: '#ef4444',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.7)',
                  }}
                />

                <div className="flex flex-col items-center gap-1 my-auto text-slate-300">
                  <ChevronLeft className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-mono font-bold text-sky-300 rotate-90 my-2">
                    SIDE
                  </span>
                </div>

                {/* Quick Snip Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startSnipMode();
                  }}
                  title="Captura Snipaste (⌥S)"
                  className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
                >
                  <Scissors className="w-3 h-3 text-purple-400" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. FULL-HEIGHT NATIVE macOS LATERAL SIDEBAR APPLICATION */}
      <AnimatePresence>
        {isExpanded && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            onMouseEnter={handleMouseEnterSidebar}
            onMouseLeave={handleMouseLeaveSidebar}
            style={{
              width: isMaximized ? '620px' : `${sidebarWidth}px`,
            }}
            className={`
              fixed top-0 right-0 bottom-0 z-50
              h-screen flex flex-col
              bg-[#0a0a0c]/90 backdrop-blur-3xl
              border-l border-white/15
              shadow-[-24px_0_70px_rgba(0,0,0,0.92),inset_0_1px_1px_rgba(255,255,255,0.25)]
              select-none overflow-hidden pointer-events-auto
              ${isResizing ? 'cursor-col-resize select-none' : ''}
            `}
          >
            {/* Left Edge Resizer Handle */}
            <div
              onMouseDown={handleMouseDownResize}
              title="Arrastra para redimensionar el ancho del sidebar"
              className="absolute left-0 top-0 bottom-0 w-1.5 hover:w-2 hover:bg-sky-400/50 cursor-col-resize transition-all z-50 group"
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-white/30 group-hover:bg-sky-400" />
            </div>

            {/* macOS Native Window Header */}
            <div className="h-12 border-b border-white/10 px-4 flex items-center justify-between bg-white/[0.02] shrink-0">
              {/* Traffic Light Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={closeSidecar}
                  title="Cerrar / Ocultar Sidebar"
                  className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 border border-[#e0443e] flex items-center justify-center text-black/60 group shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold">×</span>
                </button>
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  title="Minimizar / Alternar Ancho"
                  className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 border border-[#dea123] flex items-center justify-center text-black/60 group shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold">−</span>
                </button>
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  title="Expandir Ancho Máximo"
                  className="w-3 h-3 rounded-full bg-[#27c93f] hover:brightness-110 border border-[#1aab29] flex items-center justify-center text-black/60 group shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <span className="opacity-0 group-hover:opacity-100 text-[7px] font-bold">+</span>
                </button>
              </div>

              {/* Title & Status */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Sparkles className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                  SideNotch Sidebar
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </span>
              </div>

              {/* Header Actions: Pin, Maximize, Close */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  title={isPinned ? 'Sidebar fijado (clic para auto-ocultar)' : 'Fijar sidebar abierto'}
                  className={`p-1.5 rounded-md transition-colors ${
                    isPinned ? 'bg-sky-500/30 text-sky-300 border border-sky-400/40' : 'bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white'
                  }`}
                >
                  {isPinned ? <Pin className="w-3 h-3 text-sky-300" /> : <PinOff className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  title={isMaximized ? 'Restaurar ancho' : 'Expandir ancho'}
                  className="p-1.5 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                >
                  {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </button>

                <button
                  onClick={closeSidecar}
                  title="Ocultar (⌥ + Espacio)"
                  className="p-1.5 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Live Antigravity / Gemini Status Card */}
            <div className="p-3 bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-transparent border-b border-white/10 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
                  <span className="font-bold text-slate-200">Antigravity IDE · Google AI Pro</span>
                </div>
                <span className="font-mono text-xs font-extrabold text-[#ef4444]">
                  8% restante (5h)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ef4444] via-orange-400 to-[#30d158] transition-all duration-500"
                  style={{ width: '8%' }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Reset en 22 min (2,016 créditos IA)
                </span>

                <button
                  onClick={startSnipMode}
                  className="px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Scissors className="w-2.5 h-2.5" />
                  <span>Snipaste (⌥S)</span>
                </button>
              </div>
            </div>

            {/* Native macOS Sidebar Navigation Tabs */}
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-1 overflow-x-auto bg-black/20 shrink-0">
              <button
                onClick={() => handleTabChange('quotas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'prompts'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat & Prompts</span>
              </button>

              <button
                onClick={() => handleTabChange('mobilesync')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'mobilesync'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Companion</span>
              </button>

              <button
                onClick={() => handleTabChange('settings')}
                className={`p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'settings' ? 'bg-white/10 text-white' : ''
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === 'quotas' && <QuotaRadar />}
              {activeTab === 'prompts' && <PromptHub />}
              {activeTab === 'mobilesync' && <MobileSync />}
              {activeTab === 'settings' && <SettingsPanel />}
            </div>

            {/* Bottom macOS Sidebar Footer */}
            <div className="p-3 bg-[#0a0a0c] border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
              <div className="flex items-center gap-1.5 text-slate-300">
                <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
                <select
                  value={activeWorkspace?.id}
                  onChange={(e) => setActiveWorkspaceId(e.target.value)}
                  className="bg-transparent text-[11px] text-slate-200 focus:outline-none cursor-pointer"
                >
                  {workspaces.map(ws => (
                    <option key={ws.id} value={ws.id} className="bg-slate-900 text-white">
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">⌥ + Espacio</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
