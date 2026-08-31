import React from 'react';
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
  onOpenDashboard?: () => void;
}

export const NotchBubbles: React.FC<NotchBubblesProps> = ({
  models,
  activeModel,
  onSelectModel,
}) => {
  // Render provider SVG icons (exact CodeBurn style)
  const renderModelIcon = (id: 'claude' | 'openai' | 'antigravity') => {
    if (id === 'claude') {
      // Claude Anthropic Asterisk / Spark
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white text-white">
          <path d="M12 2a1 1 0 0 1 1 1v6.586l4.657-4.657a1 1 0 1 1 1.414 1.414L14.414 11H21a1 1 0 1 1 0 2h-6.586l4.657 4.657a1 1 0 0 1-1.414 1.414L13 14.414V21a1 1 0 1 1-2 0v-6.586l-4.657 4.657a1 1 0 0 1-1.414-1.414L9.586 13H3a1 1 0 1 1 0-2h6.586L4.929 6.343a1 1 0 0 1 1.414-1.414L11 9.586V3a1 1 0 0 1 1-1z" />
        </svg>
      );
    }
    if (id === 'openai') {
      // OpenAI ChatGPT Swirl
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white text-white">
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zm-1.22-9.1a4.484 4.484 0 0 1 2.342-1.977l-.001.164v5.518a.786.786 0 0 0 .392.68l5.844 3.37-2.02 1.168a.08.08 0 0 1-.07.006l-4.839-2.793a4.504 4.504 0 0 1-1.648-6.136zm16.489 3.069L13.025 8.9l2.02-1.166a.08.08 0 0 1 .07-.006l4.839 2.793a4.505 4.505 0 0 1-.684 8.12v-5.682a.79.79 0 0 0-.398-.687zm2.015-3.036l-.141-.085-4.783-2.759a.771.771 0 0 0-.78 0L9.336 9.762V7.43a.08.08 0 0 1 .033-.062l4.84-2.794a4.5 4.5 0 0 1 6.676 4.658zM8.307 14.28L6.286 13.11a.076.076 0 0 1-.038-.052V7.475a4.505 4.505 0 0 1 7.37-3.454l-.14.08-4.78 2.76a.793.793 0 0 0-.391.681v6.738zm1.042-2.72l2.651-1.53 2.65 1.53v3.061l-2.65 1.53-2.651-1.53v-3.06z" />
        </svg>
      );
    }
    // Kiro / Gemini / Antigravity
    return (
      <span className="font-bold font-sans text-sm tracking-tighter text-white">
        K<span className="text-[10px] align-super">˙</span>
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center gap-3 py-1 select-none pointer-events-auto">
      {models.map((model) => {
        const isActive = activeModel === model.id;
        const isRedAccent = model.id === 'antigravity' || model.percent >= 90;

        return (
          <div
            key={model.id}
            onClick={e => {
              e.stopPropagation();
              onSelectModel(model.id);
            }}
            onMouseEnter={() => {
              onSelectModel(model.id);
              sounds.playHoverTick();
            }}
            className="group relative cursor-pointer flex flex-col items-center justify-center transition-transform duration-150 active:scale-95"
          >
            {/* Squircle Button (CodeBurn Style) */}
            <div
              className={`relative w-11 h-11 rounded-[14px] flex items-center justify-center shadow-lg transition-all ${
                isRedAccent
                  ? 'bg-[#12131a] border-2 border-red-500/80 shadow-red-500/20'
                  : isActive
                    ? 'bg-[#181a24] border border-white/30 ring-1 ring-white/20'
                    : 'bg-[#12131a] border border-white/10 hover:border-white/20'
              }`}
            >
              {/* Top Right Green Progress Arc for Top Item */}
              {model.id === 'claude' && (
                <svg className="absolute -top-1 -right-1 w-6 h-6 -rotate-90 pointer-events-none" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="#30d158"
                    strokeWidth="2.5"
                    strokeDasharray="56.5"
                    strokeDashoffset="42"
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* Provider Icon */}
              <div className="flex items-center justify-center">
                {renderModelIcon(model.id)}
              </div>
            </div>

            {/* Percentage Text Below */}
            <span
              className={`text-[11px] font-mono font-medium mt-1 tracking-tight ${
                isRedAccent ? 'text-red-400 font-bold' : 'text-[#FAF5E6]'
              }`}
            >
              {model.percent}%
            </span>
          </div>
        );
      })}
    </div>
  );
};
