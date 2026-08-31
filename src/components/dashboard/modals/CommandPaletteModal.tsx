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
    { label: 'Ir al Asistente IA', desc: 'Chat y generación de código', tab: 'console' as DashboardTab, icon: '💬' },
    { label: 'Ver Cuotas & Modelos', desc: 'Límites de Gemini, Claude y GPT', tab: 'models' as DashboardTab, icon: '📊' },
    { label: 'Proyecto & Control de Cambios', desc: 'Archivos y commits Git', tab: 'git-manager' as DashboardTab, icon: '📁' },
    { label: 'Herramientas Pro (Arena, Swarm, Depurador)', desc: 'Utilidades avanzadas', tab: 'tools' as DashboardTab, icon: '🧰' },
    { label: 'Preferencias & Ajustes', desc: 'Configuración del Notch', tab: 'settings' as DashboardTab, icon: '⚙️' },
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
              <span>📱</span>
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
                <span>{cmd.icon}</span>
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
