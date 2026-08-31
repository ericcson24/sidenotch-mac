import React from 'react';
import { useApp } from '../../context/AppContext';
import { Cpu, Scissors } from 'lucide-react';

interface NotchPillProps {
  onHoverStart: () => void;
  onClick: () => void;
}

export const NotchPill: React.FC<NotchPillProps> = ({ onHoverStart, onClick }) => {
  const { quotas, startSnipMode } = useApp();
  const antigravityQuota = quotas.find(q => q.id === 'antigravity') || quotas[0];
  const remainingPercent = 100 - antigravityQuota.usedPercentage;

  return (
    <div
      onMouseEnter={onHoverStart}
      onClick={onClick}
      className="group relative flex items-center justify-between cursor-pointer"
    >
      {/* Liquid Glow Underlay */}
      <div className="absolute -inset-1 bg-gradient-to-l from-sky-500/30 via-purple-500/20 to-transparent blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300 rounded-l-full" />

      {/* Main Glass Pill Body */}
      <div
        className="
          relative h-28 w-9 rounded-l-2xl
          bg-slate-950/80 backdrop-blur-2xl
          border-y border-l border-white/20
          shadow-[-8px_0_24px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)]
          flex flex-col items-center justify-between py-2.5 px-1
          group-hover:w-11 group-hover:bg-slate-900/90
          transition-all duration-300 ease-out
        "
      >
        {/* Top Status Pulse (Health indicator) */}
        <div className="relative flex items-center justify-center">
          <div
            className="w-2.5 h-2.5 rounded-full animate-island-pulse"
            style={{
              backgroundColor: antigravityQuota.accentColor,
              boxShadow: `0 0 10px ${antigravityQuota.accentColor}`,
            }}
          />
        </div>

        {/* Center Icon */}
        <div className="flex flex-col items-center gap-1.5 my-auto text-slate-300 group-hover:text-white transition-colors">
          <Cpu className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-bold font-mono text-sky-300">
            {remainingPercent.toFixed(0)}%
          </span>
        </div>

        {/* Bottom Quick Snip Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            startSnipMode();
          }}
          title="Captura Snipaste (⌥S)"
          className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all spring-interactive"
        >
          <Scissors className="w-3 h-3 text-purple-400" />
        </button>

        {/* Specular Inner Glare Line */}
        <div className="absolute top-1 left-1 bottom-1 w-[1px] bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none rounded-full" />
      </div>
    </div>
  );
};
