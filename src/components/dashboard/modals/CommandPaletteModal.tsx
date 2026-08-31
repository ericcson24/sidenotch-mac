import React from 'react';
import type { DashboardTab } from '../../../types/dashboard';
import { sounds } from '../../../utils/soundEffects';

interface CommandPaletteModalProps {
  isOpen: boolean;
  query: string;
  setQuery: (q: string) => void;
  onClose: () => void;
  onNavigateTab: (tab: DashboardTab) => void;
  onOpenMobileSimulator: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  query,
  setQuery,
  onClose,
  onNavigateTab,
  onOpenMobileSimulator,
}) => {
  if (!isOpen) return null;

  const handleSelectTab = (tab: DashboardTab) => {
    onNavigateTab(tab);
    onClose();
    sounds.playHoverTick();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-[500px] bg-[#16161c] border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-3 py-2 bg-black/40 rounded-xl border border-white/10">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current text-neutral-400" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar comando, agente o navegacion..."
            className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-neutral-400 font-mono">ESC</kbd>
        </div>

        <div className="text-[10px] font-bold text-neutral-500 uppercase px-2 pt-1 tracking-wider">Acciones Rapidas</div>
        <div className="space-y-1">
          <button
            onClick={() => handleSelectTab('console')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer text-left"
          >
            <span>Ir a Consola & Dev</span>
            <span className="text-[10px] opacity-70 font-mono">Tab 1</span>
          </button>
          <button
            onClick={() => { onOpenMobileSimulator(); onClose(); sounds.playHoverTick(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer text-left"
          >
            <span>Abrir Simulador Móvil & Expo</span>
            <span className="text-[10px] opacity-70 font-mono">Móvil</span>
          </button>
          <button
            onClick={() => handleSelectTab('arena')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer text-left"
          >
            <span>Arena Multi-Modelos en Paralelo</span>
            <span className="text-[10px] opacity-70 font-mono">Tab 2</span>
          </button>
          <button
            onClick={() => handleSelectTab('git-manager')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer text-left"
          >
            <span>GitFlow & Graph Visual</span>
            <span className="text-[10px] opacity-70 font-mono">Tab 5</span>
          </button>
        </div>
      </div>
    </div>
  );
};
