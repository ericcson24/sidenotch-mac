import React from 'react';
import type { DashboardTab } from '../../../types/dashboard';
import { sounds } from '../../../utils/soundEffects';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  agentsCount: number;
  gitModifiedCount: number;
  rulesCount: number;
  geminiFiveHour: number;
  credits: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  agentsCount,
  gitModifiedCount,
  rulesCount,
  geminiFiveHour,
  credits,
}) => {
  const handleTabClick = (tab: DashboardTab) => {
    setActiveTab(tab);
    sounds.playHoverTick();
  };

  return (
    <div className="w-[215px] bg-[#121216]/90 border-r border-white/[0.08] flex flex-col justify-between shrink-0 p-3 select-none text-[13px] backdrop-blur-xl">
      <div className="space-y-4">
        {/* Traffic Lights Area */}
        <div className="flex items-center gap-2 px-1 pt-1 pb-2 [-webkit-app-region:drag]">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:brightness-90 cursor-pointer shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:brightness-90 cursor-pointer shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:brightness-90 cursor-pointer shadow-sm" />
        </div>

        {/* Section: Agentes Dev */}
        <div className="space-y-1">
          <div className="px-2.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Agentes Dev</div>

          {/* 1. Consola & Dev */}
          <button
            onClick={() => handleTabClick('console')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
              activeTab === 'console'
                ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-[#d1d1d6] hover:bg-white/[0.06]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span>Consola & Dev</span>
          </button>

          {/* 2. Arena Multi-Modelos */}
          <button
            onClick={() => handleTabClick('arena')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
              activeTab === 'arena'
                ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-[#d1d1d6] hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>Arena de Modelos</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono">4x</span>
          </button>

          {/* 3. Depurador IA */}
          <button
            onClick={() => handleTabClick('debugger')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
              activeTab === 'debugger'
                ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-[#d1d1d6] hover:bg-white/[0.06]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Depurador IA</span>
          </button>

          {/* 4. Swarm Multi-Agente */}
          <button
            onClick={() => handleTabClick('swarm')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
              activeTab === 'swarm'
                ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-[#d1d1d6] hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>Swarm Multi-Agente</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">{agentsCount}</span>
          </button>

          {/* 5. Visor de Código */}
          <button
            onClick={() => handleTabClick('code-viewer')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
              activeTab === 'code-viewer'
                ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-[#d1d1d6] hover:bg-white/[0.06]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>Visor de Codigo</span>
          </button>

          {/* 6. GitFlow & Graph Visual */}
          <button
            onClick={() => handleTabClick('git-manager')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
              activeTab === 'git-manager'
                ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-[#d1d1d6] hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                <circle cx="18" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                <line x1="6" y1="9" x2="6" y2="21" />
              </svg>
              <span>GitFlow & Graph</span>
            </div>
            {gitModifiedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                {gitModifiedCount}
              </span>
            )}
          </button>

          {/* 7. Scratchpad */}
          <button
            onClick={() => handleTabClick('scratchpad')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
              activeTab === 'scratchpad'
                ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-[#d1d1d6] hover:bg-white/[0.06]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Scratchpad & Notas</span>
          </button>

          {/* 8. Contexto & .agents */}
          <button
            onClick={() => handleTabClick('agents-context')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
              activeTab === 'agents-context'
                ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-[#d1d1d6] hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Contexto & .agents</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              {rulesCount} Reglas
            </span>
          </button>

          {/* 9. Modelos & Cuotas */}
          <button
            onClick={() => handleTabClick('models')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
              activeTab === 'models'
                ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-[#d1d1d6] hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>Modelos & Cuotas</span>
            </div>
            <span className="font-mono text-[10px] font-bold text-lime-400">{geminiFiveHour}%</span>
          </button>

          {/* 10. Vinculación de APIs */}
          <button
            onClick={() => handleTabClick('linking')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
              activeTab === 'linking'
                ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-[#d1d1d6] hover:bg-white/[0.06]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Vinculacion de APIs</span>
          </button>
        </div>

        {/* Section: Sistema */}
        <div className="space-y-1">
          <div className="px-2.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Sistema</div>

          <button
            onClick={() => handleTabClick('settings')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-all text-left cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-[#d1d1d6] hover:bg-white/[0.06]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current opacity-90" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Ajustes del Notch</span>
          </button>
        </div>
      </div>

      {/* Bottom Sidebar Status */}
      <div className="pt-3 border-t border-white/[0.08] text-[11px] text-neutral-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
          <span className="font-semibold text-neutral-300">Antigravity</span>
        </div>
        <span className="font-mono text-[10px] text-emerald-400">{credits} Cr</span>
      </div>
    </div>
  );
};
