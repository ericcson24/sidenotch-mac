import React from 'react';

interface ScratchpadTabProps {
  scratchpadText: string;
  isSavingScratchpad: boolean;
  onSaveScratchpad: (text: string) => void;
  onSendPrompt: (e?: React.FormEvent, overrideText?: string) => void;
}

export const ScratchpadTab: React.FC<ScratchpadTabProps> = ({
  scratchpadText,
  isSavingScratchpad,
  onSaveScratchpad,
  onSendPrompt,
}) => {
  return (
    <div className="h-full flex flex-col space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Bloc de Notas Inteligente (Scratchpad)</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Apunta ideas, arquitecturas o esquemas con autoguardado automático en disco y ejecución directa con IA.
          </p>
        </div>

        {isSavingScratchpad ? (
          <span className="text-xs text-sky-400 font-mono flex items-center gap-1.5 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Guardando...
          </span>
        ) : (
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Guardado en disco
          </span>
        )}
      </div>

      <div className="flex-1 rounded-2xl bg-[#13141c] border border-white/[0.08] p-4 flex flex-col space-y-3 shadow-xl">
        <textarea
          value={scratchpadText}
          onChange={e => onSaveScratchpad(e.target.value)}
          placeholder="Escribe tus notas, esquemas de diseño, endpoints o tareas pendientes aquí..."
          className="flex-1 w-full bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] resize-none leading-relaxed"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={() => onSendPrompt(undefined, `Toma estas notas de arquitectura y propón la implementación completa paso a paso:\n${scratchpadText}`)}
            disabled={!scratchpadText.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
          >
            Implementar Notas con la IA
          </button>
        </div>
      </div>
    </div>
  );
};
