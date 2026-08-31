import React from 'react';
import type { Agent, WorkspaceContextData } from '../../../types/dashboard';

interface SwarmTabProps {
  agents: Agent[];
  selectedSwarmAgentIds: string[];
  setSelectedSwarmAgentIds: React.Dispatch<React.SetStateAction<string[]>>;
  swarmPrompt: string;
  setSwarmPrompt: (prompt: string) => void;
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
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Equipo Multi-Agente (Swarm Pipeline)</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Coordina una cadena de agentes especializados para resolver tareas complejas paso a paso.
          </p>
        </div>

        <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
          {selectedSwarmAgentIds.length} agentes seleccionados
        </span>
      </div>

      {/* Agents Selection Grid */}
      <div className="grid grid-cols-3 gap-3">
        {agents.map(agent => {
          const isSelected = selectedSwarmAgentIds.includes(agent.id);
          return (
            <div
              key={agent.id}
              onClick={() => toggleAgent(agent.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                isSelected
                  ? 'bg-purple-600/15 border-purple-500/50 shadow-md'
                  : 'bg-[#13141c] border-white/[0.08] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-tr ${agent.avatarColor}`} />
                  <span className="text-xs font-bold text-white">{agent.name}</span>
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleAgent(agent.id)}
                  className="rounded text-purple-500 focus:ring-0 cursor-pointer"
                />
              </div>
              <div className="text-[11px] text-neutral-400 leading-tight">{agent.role}</div>
              <div className="text-[10px] font-mono text-neutral-500">{agent.model}</div>
            </div>
          );
        })}
      </div>

      {/* Swarm Prompt Input */}
      <form onSubmit={onRunSwarmPipeline} className="p-5 rounded-2xl bg-[#13141c] border border-white/[0.08] space-y-3 shadow-xl">
        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          Instrucción para el Pipeline en <span className="text-sky-400 font-semibold">{workspaceContext?.folderName || 'el proyecto'}</span>
        </div>
        <textarea
          rows={3}
          value={swarmPrompt}
          onChange={e => setSwarmPrompt(e.target.value)}
          placeholder="Ejemplo: Diseñar la arquitectura del sistema de pagos, implementar los componentes y verificar que no haya fallos..."
          className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 font-mono text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isExecutingSwarm || !swarmPrompt.trim() || selectedSwarmAgentIds.length === 0}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2"
          >
            {isExecutingSwarm ? 'Ejecutando Swarm...' : 'Desplegar Pipeline Multi-Agente'}
          </button>
        </div>
      </form>

      {/* Live Logs */}
      {swarmProgressLogs.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#13141c] border border-purple-500/25 space-y-2 shadow-xl">
          <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">Progreso en Vivo del Swarm</div>
          <div className="p-3 rounded-xl bg-black/40 font-mono text-xs text-neutral-300 space-y-1 max-h-48 overflow-y-auto border border-white/[0.06]">
            {swarmProgressLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
