import React from 'react';
import type { Agent, WorkspaceContextData } from '../../../types/dashboard';
import { sounds } from '../../../utils/soundEffects';

interface SwarmTabProps {
  agents: Agent[];
  selectedSwarmAgentIds: string[];
  setSelectedSwarmAgentIds: React.Dispatch<React.SetStateAction<string[]>>;
  swarmPrompt: string;
  setSwarmPrompt: (p: string) => void;
  isExecutingSwarm: boolean;
  swarmProgressLogs: string[];
  workspaceContext: WorkspaceContextData | null;
  onRunSwarmPipeline: (e?: React.FormEvent) => void;
}

export const SwarmTab: React.FC<SwarmTabProps> = ({
  agents,
  selectedSwarmAgentIds,
  setSelectedSwarmAgentIds,
  swarmPrompt,
  setSwarmPrompt,
  isExecutingSwarm,
  swarmProgressLogs,
  workspaceContext,
  onRunSwarmPipeline,
}) => {
  const toggleAgent = (id: string) => {
    setSelectedSwarmAgentIds(prev =>
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
    sounds.playHoverTick();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Swarm Multi-Agente en Pipeline</h2>
          <p className="text-xs text-neutral-400">Ejecuta tareas complejas con múltiples agentes especializados colaborando en cadena en tu workspace.</p>
        </div>
      </div>

      {/* Swarm Dispatcher Card */}
      <div className="p-5 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-4 backdrop-blur-md shadow-xl">
        <div className="text-xs font-semibold text-white">1. Selecciona los agentes participantes en el Swarm:</div>
        <div className="grid grid-cols-4 gap-3">
          {agents.map(agent => {
            const isSelected = selectedSwarmAgentIds.includes(agent.id);
            return (
              <div
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#0071e3]/20 border-[#0071e3] shadow-md shadow-blue-500/10'
                    : 'bg-black/30 border-white/[0.06] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-md border flex items-center justify-center ${isSelected ? 'bg-[#0071e3] border-[#0071e3]' : 'border-white/30'}`}>
                    {isSelected && <span className="text-[10px] text-white">✓</span>}
                  </div>
                  <span className="text-xs font-bold text-white truncate">{agent.name}</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1 truncate">{agent.role}</div>
                <div className="text-[10px] font-mono text-sky-400 mt-0.5">{agent.model}</div>
              </div>
            );
          })}
        </div>

        <div className="text-xs font-semibold text-white pt-2">
          2. Asigna la misión al Swarm en <span className="text-sky-400 font-mono">{workspaceContext?.folderName}</span>:
        </div>
        <form onSubmit={onRunSwarmPipeline} className="space-y-3">
          <textarea
            rows={3}
            value={swarmPrompt}
            onChange={e => setSwarmPrompt(e.target.value)}
            placeholder="Ejemplo: Diseñar la arquitectura del módulo, implementar las interfaces TypeScript y realizar auditoría de seguridad..."
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isExecutingSwarm || !swarmPrompt.trim() || selectedSwarmAgentIds.length === 0}
              className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isExecutingSwarm ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Ejecutando Swarm...</span>
                </>
              ) : (
                <span>Lanzar Mision Multi-Agente</span>
              )}
            </button>
          </div>
        </form>

        {/* Swarm Live Execution Logs */}
        {swarmProgressLogs.length > 0 && (
          <div className="mt-3 p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5 font-mono text-[11px]">
            <div className="text-xs font-bold text-neutral-300 pb-1 border-b border-white/10">Logs de Ejecucion en Tiempo Real:</div>
            {swarmProgressLogs.map((log, idx) => (
              <div key={idx} className="text-neutral-300 flex items-center gap-2">
                <span className="text-emerald-400">›</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
