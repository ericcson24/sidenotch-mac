import React from 'react';
import type { WorkspaceContextData } from '../../../types/dashboard';

interface DashboardHeaderProps {
  currentWorkspace: string;
  workspaceContext: WorkspaceContextData | null;
  credits: number;
  showMobileSimulator: boolean;
  isMetroRunning: boolean;
  onSelectWorkspace: () => void;
  onToggleMobileSimulator: () => void;
  onOpenCommandPalette: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentWorkspace,
  workspaceContext,
  credits,
  showMobileSimulator,
  isMetroRunning,
  onSelectWorkspace,
  onToggleMobileSimulator,
  onOpenCommandPalette,
}) => {
  const folderName = workspaceContext?.folderName || currentWorkspace.split('/').filter(Boolean).pop() || 'Proyecto';

  return (
    <header className="h-13 w-full flex items-center justify-between px-5 border-b border-white/[0.06] bg-[#101116] shrink-0 [-webkit-app-region:drag]">
      {/* Project Selector Badge */}
      <div className="flex items-center gap-2 [-webkit-app-region:no-drag]">
        <button
          onClick={onSelectWorkspace}
          title="Cambiar carpeta de trabajo"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-neutral-200 transition-all cursor-pointer group"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-sky-400 fill-none stroke-current" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span className="font-semibold text-white max-w-[200px] truncate">{folderName}</span>
          <span className="text-[10px] text-sky-400 font-medium group-hover:underline">Cambiar</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 [-webkit-app-region:no-drag]">
        {/* Mobile View Button */}
        <button
          onClick={onToggleMobileSimulator}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer active:scale-95 ${
            showMobileSimulator
              ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/20'
              : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/10'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <span>Móvil</span>
          {isMetroRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        </button>

        {/* Command Search */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-neutral-300 transition-colors cursor-pointer"
        >
          <span>Buscar</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono text-neutral-400 border border-white/10">⌘K</kbd>
        </button>

        {/* Credits Pill */}
        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 font-mono">
          {credits.toLocaleString()} créditos
        </div>
      </div>
    </header>
  );
};
