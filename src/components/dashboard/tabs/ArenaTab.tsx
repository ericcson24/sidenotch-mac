import React from 'react';
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
  const displayResults = arenaResults.length > 0 ? arenaResults : [
    { modelId: 'gemini-3.7', modelName: 'Gemini 3.7 Pro', provider: 'Antigravity Local Engine', color: '#D4FF00', isRealAPI: true, latencyMs: 0, text: 'Enfoque arquitectónico y comprensión holística del repositorio.', tokenEstimate: 0 },
    { modelId: 'claude-3.7', modelName: 'Claude 3.7 Sonnet', provider: 'Anthropic', color: '#FF6B4A', isRealAPI: false, latencyMs: 0, text: 'Generación limpia de TypeScript, hooks React y componentes modulares.', tokenEstimate: 0 },
    { modelId: 'gpt-4o', modelName: 'OpenAI GPT-4o', provider: 'OpenAI', color: '#10A37F', isRealAPI: false, latencyMs: 0, text: 'QA, análisis de límites, aserciones y tests de integración.', tokenEstimate: 0 },
    { modelId: 'deepseek-v3', modelName: 'DeepSeek V3 Reasoner', provider: 'DeepSeek', color: '#4D6BFE', isRealAPI: false, latencyMs: 0, text: 'Razonamiento profundo, auditoría de seguridad y optimización de memoria.', tokenEstimate: 0 },
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Arena de Modelos de IA en Paralelo</h2>
          <p className="text-xs text-neutral-400">Compara las respuestas, velocidad (ms) y calidad de código entre Gemini, Claude, GPT y DeepSeek simultáneamente.</p>
        </div>
        {arenaExecutionTime > 0 && (
          <span className="text-xs font-mono text-emerald-400">
            Tiempo total: {arenaExecutionTime}ms
          </span>
        )}
      </div>

      {/* Arena Prompt Bar */}
      <form onSubmit={onRunArena} className="p-3 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] flex items-center gap-2 shadow-lg backdrop-blur-md">
        <input
          type="text"
          value={arenaPrompt}
          onChange={e => setArenaPrompt(e.target.value)}
          placeholder="Escribe la tarea o problema para que los 4 modelos compitan en directo..."
          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3]"
        />
        <button
          type="submit"
          disabled={isExecutingArena || !arenaPrompt.trim()}
          className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold active:scale-95 cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          {isExecutingArena ? 'Ejecutando Arena...' : 'Lanzar Batalla'}
        </button>
      </form>

      {/* Split Cards Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto">
        {displayResults.map((res, i) => (
          <div key={i} className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] flex flex-col justify-between space-y-3 shadow-xl backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: res.color }} />
                  <span className="text-xs font-bold text-white">{res.modelName}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                  {res.latencyMs > 0 && <span className="text-emerald-400">{res.latencyMs}ms</span>}
                  <span>{res.provider}</span>
                </div>
              </div>
              <div className="mt-3 font-mono text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto">
                {res.text}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-500">~{res.tokenEstimate} tokens</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(res.text);
                  sounds.playIslandExpand();
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-neutral-300 transition-colors cursor-pointer"
              >
                Copiar Solucion
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
