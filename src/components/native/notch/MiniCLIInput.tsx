import React from 'react';

interface MiniCLIInputProps {
  activeModelName: string;
  quickPrompt: string;
  setQuickPrompt: (prompt: string) => void;
  quickResponse: string;
  isProcessing: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const MiniCLIInput: React.FC<MiniCLIInputProps> = ({
  activeModelName,
  quickPrompt,
  setQuickPrompt,
  quickResponse,
  isProcessing,
  onSubmit,
}) => {
  return (
    <div className="space-y-2 pt-1 border-t border-white/[0.06]">
      <form onSubmit={onSubmit} className="flex items-center gap-1.5 bg-black/60 rounded-xl p-1 border border-white/10">
        <span className="text-[10px] font-mono text-neutral-500 pl-2">›</span>
        <input
          type="text"
          value={quickPrompt}
          onChange={e => setQuickPrompt(e.target.value)}
          placeholder={`Instrucción rápida para ${activeModelName}...`}
          className="flex-1 bg-transparent px-1 py-1 text-[11px] text-white placeholder-neutral-500 focus:outline-none font-mono"
        />
        <button
          type="submit"
          disabled={isProcessing || !quickPrompt.trim()}
          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono font-bold transition-all disabled:opacity-30 cursor-pointer"
        >
          {isProcessing ? '...' : 'Ejecutar'}
        </button>
      </form>

      {quickResponse && (
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] font-mono text-neutral-200 leading-relaxed max-h-[90px] overflow-y-auto whitespace-pre-wrap">
          {quickResponse}
        </div>
      )}
    </div>
  );
};
