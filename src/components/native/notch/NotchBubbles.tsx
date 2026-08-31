import React from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../../../utils/soundEffects';

interface BubbleModelData {
  id: 'claude' | 'openai' | 'antigravity';
  name: string;
  shortName: string;
  percent: number;
  color: string;
  glowColor: string;
  isLinked: boolean;
  badgeText: string;
}

interface NotchBubblesProps {
  models: BubbleModelData[];
  activeModel: 'claude' | 'openai' | 'antigravity';
  onSelectModel: (id: 'claude' | 'openai' | 'antigravity') => void;
  onExpandNotch: () => void;
  onOpenSettings?: () => void;
}

export const NotchBubbles: React.FC<NotchBubblesProps> = ({
  models,
  activeModel,
  onSelectModel,
  onExpandNotch,
  onOpenSettings,
}) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;

  // Render provider SVG icons
  const renderModelIcon = (id: 'claude' | 'openai' | 'antigravity') => {
    if (id === 'claude') {
      // Claude Anthropic Asterisk / Spark
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white text-white">
          <path d="M12 2a1 1 0 0 1 1 1v6.586l4.657-4.657a1 1 0 1 1 1.414 1.414L14.414 11H21a1 1 0 1 1 0 2h-6.586l4.657 4.657a1 1 0 0 1-1.414 1.414L13 14.414V21a1 1 0 1 1-2 0v-6.586l-4.657 4.657a1 1 0 0 1-1.414-1.414L9.586 13H3a1 1 0 1 1 0-2h6.586L4.929 6.343a1 1 0 0 1 1.414-1.414L11 9.586V3a1 1 0 0 1 1-1z" />
        </svg>
      );
    }
    if (id === 'openai') {
      // OpenAI ChatGPT Swirl
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white text-white">
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zm-1.22-9.1a4.484 4.484 0 0 1 2.342-1.977l-.001.164v5.518a.786.786 0 0 0 .392.68l5.844 3.37-2.02 1.168a.08.08 0 0 1-.07.006l-4.839-2.793a4.504 4.504 0 0 1-1.648-6.136zm16.489 3.069L13.025 8.9l2.02-1.166a.08.08 0 0 1 .07-.006l4.839 2.793a4.505 4.505 0 0 1-.684 8.12v-5.682a.79.79 0 0 0-.398-.687zm2.015-3.036l-.141-.085-4.783-2.759a.771.771 0 0 0-.78 0L9.336 9.762V7.43a.08.08 0 0 1 .033-.062l4.84-2.794a4.5 4.5 0 0 1 6.676 4.658zM8.307 14.28L6.286 13.11a.076.076 0 0 1-.038-.052V7.475a4.505 4.505 0 0 1 7.37-3.454l-.14.08-4.78 2.76a.793.793 0 0 0-.391.681v6.738zm1.042-2.72l2.651-1.53 2.65 1.53v3.061l-2.65 1.53-2.651-1.53v-3.06z" />
        </svg>
      );
    }
    // Gemini Antigravity Sparkle
    return (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white text-white">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center gap-3.5 py-1 select-none pointer-events-auto">
      {/* 3 AI Capacity Gauges (Claude, OpenAI, Gemini) */}
      {models.map((model) => {
        const isActive = activeModel === model.id;
        const safePercent = Math.min(100, Math.max(0, model.percent));
        const strokeDashoffset = circumference - (circumference * safePercent) / 100;

        return (
          <div
            key={model.id}
            onClick={e => {
              e.stopPropagation();
              onSelectModel(model.id);
              onExpandNotch();
            }}
            onMouseEnter={() => sounds.playHoverTick()}
            className="group relative cursor-pointer flex flex-col items-center justify-center transition-transform duration-200 active:scale-95"
          >
            {/* Outer Circular Capacity Gauge with Progress Arc */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="absolute inset-0 -rotate-90 w-10 h-10" viewBox="0 0 40 40">
                {/* Physical channel track */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  stroke="rgba(0, 0, 0, 0.7)"
                  strokeWidth="3.2"
                />
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="3.2"
                />
                {/* Colored Progress Arc */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  stroke={model.color}
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Inner Dark Pill Body with Icon */}
              <div
                className={`w-7 h-7 rounded-full bg-[#0a0a0f] border border-white/10 flex items-center justify-center shadow-md transition-all ${
                  isActive ? 'scale-105 border-white/30 shadow-lg' : 'group-hover:border-white/20'
                }`}
              >
                {renderModelIcon(model.id)}
              </div>
            </div>

            {/* Warm Off-White Percentage Text Directly Below */}
            <span className="text-[11px] font-mono font-medium text-[#FAF5E6] mt-1 tracking-tight">
              {model.percent}%
            </span>

            {/* Hover Tooltip to the Left */}
            <div className="absolute right-13 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 translate-x-1 group-hover:translate-x-0 z-50">
              <div className="px-3 py-1.5 rounded-xl bg-[#08080C]/95 border border-white/15 backdrop-blur-xl shadow-2xl flex items-center gap-2 whitespace-nowrap text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: model.color }} />
                <span className="font-semibold text-white text-[11px]">{model.name}</span>
                <span className="font-mono text-emerald-400 text-[10px]">{model.badgeText}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* 4. Bottom Protruding Settings Gear Button */}
      <motion.button
        whileHover={{ scale: 1.12, rotate: 30 }}
        whileTap={{ scale: 0.92 }}
        onClick={e => {
          e.stopPropagation();
          sounds.playHoverTick();
          if (onOpenSettings) onOpenSettings();
        }}
        title="Abrir Dashboard de Control & Ajustes"
        className="w-8 h-8 rounded-full bg-[#0a0a0f] border border-white/15 hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center shadow-lg transition-all cursor-pointer mt-0.5 active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </motion.button>
    </div>
  );
};
