import React from 'react';
import { sounds } from '../../../utils/soundEffects';

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
    <div className="max-w-3xl mx-auto h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Scratchpad de Desarrollo & Notas Persistentes</h2>
          <p className="text-xs text-neutral-400">Guarda esquemas, snippets y notas de arquitectura compartidas con los agentes.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400">
            {isSavingScratchpad ? 'Guardando...' : 'Autoguardado en disco'}
          </span>
          <button
            onClick={() => {
              onSendPrompt(undefined, `Revisa mis notas de arquitectura en el Scratchpad y propon sugerencias de implementacion:\n\n${scratchpadText}`);
              sounds.playHoverTick();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer transition-all"
          >
            Consultar con Agente
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] overflow-hidden shadow-xl backdrop-blur-md flex flex-col">
        <textarea
          value={scratchpadText}
          onChange={e => onSaveScratchpad(e.target.value)}
          placeholder="# Escribe aqui tus notas de diseno, snippets y tareas pendientes..."
          className="flex-1 bg-transparent p-5 font-mono text-xs text-white placeholder-neutral-500 focus:outline-none resize-none leading-relaxed"
        />
      </div>
    </div>
  );
};
