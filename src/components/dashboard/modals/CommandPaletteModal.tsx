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

  const handleOpenMobile = () => {
    onOpenMobileSimulator();
    onClose();
    sounds.playHoverTick();
  };

  const commands = [
    {
      label: 'Ir al Asistente IA',
      desc: 'Chat y generación de código',
      tab: 'console' as DashboardTab,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      label: 'Ver Cuotas & Modelos',
      desc: 'Límites de Gemini, Claude y GPT',
      tab: 'models' as DashboardTab,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      label: 'Proyecto & Control de Cambios',
      desc: 'Archivos y commits Git',
      tab: 'git-manager' as DashboardTab,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      label: 'Herramientas Pro (Arena, Swarm, Depurador)',
      desc: 'Utilidades avanzadas',
      tab: 'tools' as DashboardTab,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
    {
      label: 'Preferencias & Ajustes',
      desc: 'Configuración del Notch',
      tab: 'settings' as DashboardTab,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const filteredCommands = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-24 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-[520px] bg-[#13141c] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden p-3 space-y-3"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-black/50 rounded-xl border border-white/10">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current text-neutral-400" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar comando, sección o herramienta..."
            className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-neutral-400 font-mono">ESC</kbd>
        </div>

        {/* Command List */}
        <div className="space-y-1 max-h-72 overflow-y-auto">
          <button
            onClick={handleOpenMobile}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer text-left group"
          >
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <div>
                <div className="font-semibold">Abrir Vista Móvil (Simulador iPhone)</div>
                <div className="text-[10.5px] text-neutral-400 group-hover:text-blue-100">Probar diseño en pantalla pequeña</div>
              </div>
            </div>
            <span className="text-[10px] font-mono opacity-60">Acción</span>
          </button>

          {filteredCommands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectTab(cmd.tab)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-neutral-400 group-hover:text-white">{cmd.icon}</span>
                <div>
                  <div className="font-semibold">{cmd.label}</div>
                  <div className="text-[10.5px] text-neutral-400 group-hover:text-blue-100">{cmd.desc}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono opacity-60">Navegar</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
