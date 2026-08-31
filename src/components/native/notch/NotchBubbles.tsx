import React from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../../../utils/soundEffects';

interface BubbleModelData {
  id: 'antigravity' | 'claude' | 'openai';
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
  activeModel: 'antigravity' | 'claude' | 'openai';
  onSelectModel: (id: 'antigravity' | 'claude' | 'openai') => void;
  onExpandNotch: () => void;
}

const bubbleSpring = {
  type: 'spring' as const,
  stiffness: 440,
  damping: 22,
  mass: 0.5,
};

export const NotchBubbles: React.FC<NotchBubblesProps> = ({
  models,
  activeModel,
  onSelectModel,
  onExpandNotch,
}) => {
  return (
    <div className="flex flex-col items-center gap-2.5 py-1 select-none pointer-events-auto">
      {models.map((model, idx) => {
        const isActive = activeModel === model.id;
        const radius = 18;
        const circumference = 2 * Math.PI * radius;
        const safePercent = Math.min(100, Math.max(0, model.percent));
        const strokeDashoffset = circumference - (circumference * safePercent) / 100;

        return (
          <motion.div
            key={model.id}
            initial={{ scale: 0.8, opacity: 0, x: 20 }}
            animate={{
              scale: isActive ? 1.08 : 1,
              opacity: 1,
              x: 0,
              y: [0, idx % 2 === 0 ? -2 : 2, 0],
            }}
            transition={{
              scale: bubbleSpring,
              y: {
                repeat: Infinity,
                duration: 3 + idx * 0.8,
                ease: 'easeInOut',
              },
            }}
            whileHover={{ scale: 1.16, x: -4 }}
            whileTap={{ scale: 0.94 }}
            onMouseEnter={() => sounds.playHoverTick()}
            onClick={e => {
              e.stopPropagation();
              onSelectModel(model.id);
              onExpandNotch();
            }}
            className="group relative cursor-pointer flex items-center justify-center"
          >
            {/* Outer Glow Halo */}
            <div
              className="absolute -inset-1 rounded-full blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none"
              style={{ backgroundColor: model.glowColor }}
            />

            {/* Glass Bubble Spherical Body */}
            <div
              className="
                relative w-11 h-11 rounded-full
                bg-black/80 backdrop-blur-2xl
                border border-white/20
                shadow-[0_8px_20px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.35),inset_0_-2px_4px_rgba(0,0,0,0.6)]
                flex flex-col items-center justify-center
                overflow-hidden transition-all duration-300
              "
              style={{
                borderColor: isActive ? model.color : 'rgba(255, 255, 255, 0.18)',
              }}
            >
              {/* Radial Circular Progress Ring */}
              <svg className="absolute inset-0 -rotate-90" width="44" height="44">
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  fill="none"
                  stroke={model.color}
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Internal Specular Bubble Reflection */}
              <div className="absolute top-1 left-2 w-3 h-1.5 rounded-full bg-white/40 blur-[0.5px] pointer-events-none" />

              {/* Center Content: Short model label + percentage */}
              <div className="relative z-10 flex flex-col items-center justify-center leading-none">
                <span className="text-[8.5px] font-bold font-mono text-white/90 group-hover:scale-105 transition-transform">
                  {model.shortName}
                </span>
                <span
                  className="text-[9.5px] font-extrabold font-mono mt-0.5"
                  style={{ color: model.color }}
                >
                  {model.percent}%
                </span>
              </div>
            </div>

            {/* Tooltip on Hover to the Left */}
            <div className="absolute right-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-50">
              <div className="px-2.5 py-1 rounded-xl bg-black/90 border border-white/15 backdrop-blur-xl shadow-xl flex items-center gap-2 whitespace-nowrap text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: model.color }} />
                <span className="font-bold text-white text-[11px]">{model.name}</span>
                <span className="font-mono text-emerald-400 text-[10px]">{model.badgeText}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
