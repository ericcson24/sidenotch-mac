import React from 'react';
import type { DashboardTab } from '../../../types/dashboard';
import { sounds } from '../../../utils/soundEffects';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  geminiFiveHour: number;
  credits: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  geminiFiveHour,
  credits,
}) => {
  const handleTabClick = (tab: DashboardTab) => {
    setActiveTab(tab);
    sounds.playHoverTick();
  };

  const navItems = [
    {
      id: 'console' as DashboardTab,
      label: 'Asistente IA',
      description: 'Chat y generación de código',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'models' as DashboardTab,
      label: 'Cuotas y Modelos',
      description: 'Gemini, Claude y GPT',
      badge: `${geminiFiveHour}%`,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: 'git-manager' as DashboardTab,
      label: 'Proyecto & Git',
      description: 'Archivos y control de cambios',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M13 6h3a2 2 0 0 1 2 2v7" />
          <line x1="6" y1="9" x2="6" y2="21" />
        </svg>
      ),
    },
    {
      id: 'tools' as DashboardTab,
      label: 'Herramientas Pro',
      description: 'Arena 4x, Swarm, Depurador',
      badge: '6',
      badgeColor: 'text-purple-300 bg-purple-500/15 border-purple-500/25',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
    },
    {
      id: 'settings' as DashboardTab,
      label: 'Ajustes',
      description: 'Preferencias y arranque',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const isToolsActive = ['arena', 'swarm', 'debugger', 'code-viewer', 'scratchpad', 'agents-context'].includes(activeTab) || activeTab === 'tools';

  return (
    <nav className="w-64 bg-[#111218] border-r border-white/[0.08] flex flex-col justify-between shrink-0 p-3 pt-12 select-none">
      <div className="space-y-4">
        {/* App Title Header */}
        <div className="px-3 pb-3 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/30">
              S
            </div>
            <span className="text-xs font-bold text-white tracking-wide">SideNotch AI</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">v1.0</span>
        </div>

        {/* Primary Clean Navigation List */}
        <div className="space-y-1.5">
          {navItems.map(item => {
            const isSelected = item.id === 'tools' ? isToolsActive : activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#0071e3] text-white font-semibold shadow-lg shadow-blue-500/25'
                    : 'text-neutral-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-lg ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[13px] leading-tight font-medium">{item.label}</div>
                    <div className={`text-[10.5px] leading-tight mt-0.5 ${isSelected ? 'text-blue-100/90' : 'text-neutral-400'}`}>
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold border ${
                      isSelected
                        ? 'bg-white/20 text-white border-transparent'
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Card */}
      <div className="p-3.5 rounded-2xl bg-[#161822] border border-white/[0.06] space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-200 font-semibold">Google AI Pro</span>
          </div>
          <span className="text-emerald-400 font-bold font-mono">{geminiFiveHour}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-500"
            style={{ width: `${geminiFiveHour}%` }}
          />
        </div>
        <div className="text-[11px] text-neutral-400 flex items-center justify-between font-mono pt-0.5">
          <span>{credits.toLocaleString()} créditos</span>
          <span className="text-neutral-300">5 horas</span>
        </div>
      </div>
    </nav>
  );
};
