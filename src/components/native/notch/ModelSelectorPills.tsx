import React from 'react';
import { sounds } from '../../../utils/soundEffects';

interface ModelSelectorPillsProps {
  activeModel: 'antigravity' | 'claude' | 'openai';
  setActiveModel: (model: 'antigravity' | 'claude' | 'openai') => void;
  claudeLinked: boolean;
  openaiLinked: boolean;
}

export const ModelSelectorPills: React.FC<ModelSelectorPillsProps> = ({
  activeModel,
  setActiveModel,
  claudeLinked,
  openaiLinked,
}) => {
  const handleSelect = (model: 'antigravity' | 'claude' | 'openai') => {
    setActiveModel(model);
    sounds.playHoverTick();
  };

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
      <button
        onClick={() => handleSelect('antigravity')}
        className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
          activeModel === 'antigravity'
            ? 'bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30 shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]" />
        <span>Gemini 3.7</span>
      </button>

      <button
        onClick={() => handleSelect('claude')}
        className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
          activeModel === 'claude'
            ? 'bg-[#FF6B4A]/15 text-[#FF6B4A] border border-[#FF6B4A]/30 shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${claudeLinked ? 'bg-[#FF6B4A]' : 'bg-neutral-500'}`} />
        <span>Claude 3.7</span>
      </button>

      <button
        onClick={() => handleSelect('openai')}
        className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
          activeModel === 'openai'
            ? 'bg-[#10A37F]/15 text-[#10A37F] border border-[#10A37F]/30 shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${openaiLinked ? 'bg-[#10A37F]' : 'bg-neutral-500'}`} />
        <span>GPT-4o</span>
      </button>
    </div>
  );
};
