import React from 'react';
import type { WorkspaceContextData, DashboardTab } from '../../../types/dashboard';
import { sounds } from '../../../utils/soundEffects';

interface DashboardHeaderProps {
  currentWorkspace: string;
  workspaceContext: WorkspaceContextData | null;
  gitBranch: string;
  gitModifiedCount: number;
  rulesCount: number;
  credits: number;
  showMobileSimulator: boolean;
  isMetroRunning: boolean;
  onSelectWorkspace: () => void;
  onNavigateTab: (tab: DashboardTab) => void;
  onToggleMobileSimulator: () => void;
  onOpenCommandPalette: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentWorkspace,
  workspaceContext,
  gitBranch,
  gitModifiedCount,
  rulesCount,
  credits,
  showMobileSimulator,
  isMetroRunning,
  onSelectWorkspace,
  onNavigateTab,
  onToggleMobileSimulator,
  onOpenCommandPalette,
}) => {
  return (
    <div className="h-[58px] w-full flex items-center justify-between px-6 border-b border-white/[0.08] bg-[#131317]/60 shrink-0 backdrop-blur-md [-webkit-app-region:drag]">
      {/* Workspace Path Picker & Tech Stack Badge */}
      <div className="flex items-center gap-2.5 [-webkit-app-region:no-drag]">
        <button
          onClick={onSelectWorkspace}
          title="Cambiar carpeta de proyecto activa"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-mono text-neutral-200 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-sky-400 text-sky-400">
            <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
          </svg>
          <span className="font-semibold text-white max-w-[180px] truncate">
            {workspaceContext?.folderName || currentWorkspace.split('/').pop()}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold">Cambiar</span>
        </button>

        {/* Tech Stack Badge */}
        <div className="px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-[11px] font-mono text-purple-300 flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span>{workspaceContext?.techStack || 'React + TypeScript'}</span>
        </div>

        {/* Git Branch Badge */}
        <button
          onClick={() => { onNavigateTab('git-manager'); sounds.playHoverTick(); }}
          className="px-2.5 py-1 rounded-xl bg-sky-500/15 border border-sky-500/30 text-[11px] font-mono text-sky-300 flex items-center gap-1.5 cursor-pointer hover:bg-sky-500/25 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
            <circle cx="18" cy="18" r="3" />
            <circle cx="6" cy="6" r="3" />
            <path d="M13 6h3a2 2 0 0 1 2 2v7" />
            <line x1="6" y1="9" x2="6" y2="21" />
          </svg>
          <span>{gitBranch || 'main'}</span>
          {gitModifiedCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </button>

        {/* .agents Status Pill */}
        <button
          onClick={() => { onNavigateTab('agents-context'); sounds.playHoverTick(); }}
          className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 cursor-pointer hover:bg-emerald-500/25 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{rulesCount} Reglas</span>
        </button>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2.5 [-webkit-app-region:no-drag]">
        {/* Mobile / Expo Inspector Trigger Button */}
        <button
          onClick={onToggleMobileSimulator}
          className={`px-3 py-1 rounded-xl border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
            showMobileSimulator
              ? 'bg-[#0071e3] border-[#0071e3] text-white font-bold shadow-md shadow-blue-500/20'
              : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-neutral-300'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <span>Simulador Móvil</span>
          {isMetroRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-mono text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Paleta</span>
          <kbd className="px-1 py-0.5 rounded bg-black/40 text-[9px] font-mono text-neutral-400">⌘K</kbd>
        </button>

        <div className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{credits.toLocaleString()} Creditos IA</span>
        </div>
      </div>
    </div>
  );
};
