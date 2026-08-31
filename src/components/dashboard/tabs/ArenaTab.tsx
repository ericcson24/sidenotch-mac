import React, { useState } from 'react';
import type { ArenaResult } from '../../../types/dashboard';
import { sounds } from '../../../utils/soundEffects';

interface ArenaTabProps {
  arenaPrompt: string;
  setArenaPrompt: (prompt: string) => void;
  isExecutingArena: boolean;
  arenaResults: ArenaResult[];
  arenaExecutionTime: number;
  onRunArena: (e?: React.FormEvent) => void;
}

export const ArenaTab: React.FC<ArenaTabProps> = ({
  arenaPrompt,
  setArenaPrompt,
  isExecutingArena,
  arenaResults,
  arenaExecutionTime,
  onRunArena,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    sounds.playHoverTick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Arena de Modelos en Paralelo (4x)</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Compara las respuestas reales, latencia y enfoque de código entre Gemini, Claude, GPT y DeepSeek simultáneamente.
          </p>
        </div>
        {arenaExecutionTime > 0 && (
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Tiempo total: {arenaExecutionTime}ms
          </span>
        )}
      </div>

      {/* Arena Prompt Bar */}
      <form onSubmit={onRunArena} className="p-3 rounded-2xl bg-[#13141c] border border-white/[0.08] flex items-center gap-2 shadow-xl">
        <input
          type="text"
          value={arenaPrompt}
          onChange={e => setArenaPrompt(e.target.value)}
          placeholder="Escribe una tarea para que los 4 modelos compitan en directo..."
          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3]"
        />
        <button
          type="submit"
          disabled={isExecutingArena || !arenaPrompt.trim()}
          className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold active:scale-95 cursor-pointer transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-md shadow-blue-500/20"
        >
          {isExecutingArena ? 'Ejecutando...' : 'Lanzar Batalla 4x'}
        </button>
      </form>

      {/* Results View / Empty State */}
      {isExecutingArena ? (
        <div className="grid grid-cols-2 gap-3.5 flex-1 overflow-y-auto">
          {['Gemini 3.7 Pro', 'Claude 3.7 Sonnet', 'OpenAI GPT-4o', 'DeepSeek V3'].map((name, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#13141c] border border-white/[0.08] flex flex-col justify-center items-center space-y-3 shadow-xl">
              <div className="w-5 h-5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
              <div className="text-xs font-bold text-white">{name}</div>
              <div className="text-[11px] text-neutral-400">Procesando respuesta en vivo...</div>
            </div>
          ))}
        </div>
      ) : arenaResults.length > 0 ? (
        <div className="grid grid-cols-2 gap-3.5 flex-1 overflow-y-auto">
          {arenaResults.map(r => (
            <div
              key={r.modelId}
              className="p-4 rounded-2xl bg-[#13141c] border border-white/[0.08] flex flex-col justify-between space-y-2.5 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-xs font-bold text-white">{r.modelName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyText(r.modelId, r.text)}
                    className="text-[11px] text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    {copiedId === r.modelId ? '✓ Copiado' : 'Copiar'}
                  </button>
                  <span className="text-[10px] font-mono text-neutral-400">{r.provider}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono text-neutral-200 flex-1 overflow-y-auto max-h-44 leading-relaxed whitespace-pre-wrap">
                {r.text}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-0.5">
                <span>Latencia: <strong className="text-white">{r.latencyMs}ms</strong></span>
                <span className="text-emerald-400 font-semibold">Completado</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-[#13141c] border border-white/[0.06] space-y-2 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 mb-1">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
              <path d="M13 19l6-6" />
              <path d="M16 16l4 4" />
              <path d="M19 21l2-2" />
            </svg>
          </div>
          <div className="text-xs font-bold text-white">Sin resultados de batalla</div>
          <div className="text-xs text-neutral-400 max-w-sm">
            Escribe una instrucción arriba y pulsa "Lanzar Batalla 4x" para obtener respuestas reales de cada modelo.
          </div>
        </div>
      )}
    </div>
  );
};
