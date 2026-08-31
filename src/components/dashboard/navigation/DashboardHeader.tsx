import React from 'react';
import type { WorkspaceContextData } from '../../../types/dashboard';
import { sounds } from '../../../utils/soundEffects';

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

  const handleOpenInFinder = async () => {
    sounds.playHoverTick();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, p: string) => Promise<unknown> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          await electron.ipcRenderer.invoke('open-in-finder', currentWorkspace);
        }
      } catch {
        // fallback
      }
    }
  };

  const handleOpenInEditor = async () => {
    sounds.playHoverTick();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, p: string) => Promise<unknown> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          await electron.ipcRenderer.invoke('open-in-editor', currentWorkspace);
        }
      } catch {
        // fallback
      }
    }
  };

  return (
    <header className="h-14 w-full flex items-center justify-between px-6 border-b border-white/[0.08] bg-[#111218] shrink-0 [-webkit-app-region:drag]">
      {/* 1. Left: Workspace Selector & Native Integrations */}
      <div className="flex items-center gap-2.5 [-webkit-app-region:no-drag]">
        {/* Project Selector Badge */}
        <button
          onClick={onSelectWorkspace}
          title="Haz clic para cambiar la carpeta de trabajo"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-neutral-200 transition-all cursor-pointer shadow-sm active:scale-95 group"
        >
          <div className="w-5 h-5 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="font-semibold text-white max-w-[180px] truncate">{folderName}</span>
          <span className="text-[11px] text-sky-400 font-medium group-hover:underline">Cambiar</span>
        </button>

        {/* Open in Finder Action */}
        <button
          onClick={handleOpenInFinder}
          title="Abrir esta carpeta en Finder de macOS"
          className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[11.5px] font-medium text-neutral-300 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current text-sky-400" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span>Finder</span>
        </button>

        {/* Open in VSCode/Editor Action */}
        <button
          onClick={handleOpenInEditor}
          title="Abrir proyecto en VS Code o Cursor"
          className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[11.5px] font-medium text-neutral-300 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current text-blue-400" strokeWidth="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Editor</span>
        </button>
      </div>

      {/* 2. Right: Action Buttons */}
      <div className="flex items-center gap-2.5 [-webkit-app-region:no-drag]">
        {/* Mobile View Button */}
        <button
          onClick={onToggleMobileSimulator}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
            showMobileSimulator
              ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/25'
              : 'bg-white/[0.05] hover:bg-white/[0.1] text-neutral-200 border border-white/10'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <span>Vista Móvil</span>
          {isMetroRunning && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
        </button>

        {/* Command Search */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-neutral-300 transition-colors cursor-pointer active:scale-95"
        >
          <span>Buscar</span>
          <kbd className="px-1.5 py-0.5 rounded-md bg-black/40 text-[10px] font-mono text-neutral-400 border border-white/10">⌘K</kbd>
        </button>

        {/* Credits Pill */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400 shadow-sm font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{credits.toLocaleString()} créditos</span>
        </div>
      </div>
    </header>
  );
};
