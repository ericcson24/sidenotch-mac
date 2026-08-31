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

  const displayResults = arenaResults.length > 0 ? arenaResults : [
    { modelId: 'gemini-3.7', modelName: 'Gemini 3.7 Pro', provider: 'Antigravity Local Engine', color: '#D4FF00', isRealAPI: true, latencyMs: 24, text: 'Enfoque arquitectónico y comprensión holística del repositorio.', tokenEstimate: 0 },
    { modelId: 'claude-3.7', modelName: 'Claude 3.7 Sonnet', provider: 'Anthropic', color: '#FF6B4A', isRealAPI: false, latencyMs: 38, text: 'Generación limpia de TypeScript, hooks React y componentes modulares.', tokenEstimate: 0 },
    { modelId: 'gpt-4o', modelName: 'OpenAI GPT-4o', provider: 'OpenAI', color: '#10A37F', isRealAPI: false, latencyMs: 32, text: 'QA, análisis de límites, aserciones y tests de integración.', tokenEstimate: 0 },
    { modelId: 'deepseek-v3', modelName: 'DeepSeek V3 Reasoner', provider: 'DeepSeek', color: '#4D6BFE', isRealAPI: false, latencyMs: 45, text: 'Razonamiento profundo, auditoría de seguridad y optimización de memoria.', tokenEstimate: 0 },
  ];

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    sounds.playHoverTick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const samplePrompts = [
    'Crear componente modal accesible con animaciones de resorte',
    'Función de debounce optimizada en TypeScript',
    'Auditar posibles vulnerabilidades en autenticación de tokens',
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Arena de Modelos en Paralelo (4x)</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Compara las respuestas, velocidad y enfoque de código entre Gemini, Claude, GPT y DeepSeek simultáneamente.
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
          placeholder="Escribe una tarea o reto para que los 4 modelos compitan en directo..."
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

      {/* Sample Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] text-neutral-400 font-medium shrink-0">Ejemplos:</span>
        {samplePrompts.map((sp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => { setArenaPrompt(sp); sounds.playHoverTick(); }}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-neutral-300 border border-white/10 shrink-0 transition-colors cursor-pointer"
          >
            {sp}
          </button>
        ))}
      </div>

      {/* 4 Models Grid */}
      <div className="grid grid-cols-2 gap-3.5 flex-1 overflow-y-auto">
        {displayResults.map(r => (
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
              {isExecutingArena ? (
                <div className="flex items-center gap-2 text-neutral-400 py-4">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: r.color, borderTopColor: 'transparent' }} />
                  <span>Procesando respuesta...</span>
                </div>
              ) : (
                r.text
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-0.5">
              <span>Latencia: <strong className="text-white">{r.latencyMs}ms</strong></span>
              <span className="text-emerald-400 font-semibold">{isExecutingArena ? 'En curso' : 'Completado'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
