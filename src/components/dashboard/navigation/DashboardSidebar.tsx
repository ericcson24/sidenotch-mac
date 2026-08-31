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
      description: 'Archivos y cambios',
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
      badge: '5',
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
      description: 'Notch y cuentas',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  // Map sub-tabs into tools if active
  const isToolsActive = ['arena', 'swarm', 'debugger', 'code-viewer', 'scratchpad', 'agents-context'].includes(activeTab) || activeTab === 'tools';

  return (
    <nav className="w-60 bg-[#0f0f13]/95 border-r border-white/[0.08] flex flex-col justify-between shrink-0 p-3 select-none backdrop-blur-2xl">
      <div className="space-y-4">
        {/* macOS Traffic Lights + App Title */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-white/[0.06] [-webkit-app-region:drag]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-sm" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase font-mono">SideNotch</span>
        </div>

        {/* Primary Clean Navigation List */}
        <div className="space-y-1">
          {navItems.map(item => {
            const isSelected = item.id === 'tools' ? isToolsActive : activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#0071e3] text-white font-semibold shadow-lg shadow-blue-500/25'
                    : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-lg ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[13px] leading-tight">{item.label}</div>
                    <div className={`text-[10px] leading-tight mt-0.5 ${isSelected ? 'text-blue-100' : 'text-neutral-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-white/[0.06] text-neutral-400'
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
      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium">Google AI Pro</span>
          <span className="text-emerald-400 font-bold font-mono">{geminiFiveHour}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-500"
            style={{ width: `${geminiFiveHour}%` }}
          />
        </div>
        <div className="text-[10.5px] text-neutral-500 flex items-center justify-between font-mono pt-0.5">
          <span>{credits} créditos</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Listo
          </span>
        </div>
      </div>
    </nav>
  );
};
