import React, { useRef, useEffect } from 'react';
import type { Agent, WorkspaceContextData, ChatMessage } from '../../../types/dashboard';
import { sounds } from '../../../utils/soundEffects';

interface ConsoleTabProps {
  agents: Agent[];
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;
  activeAgent: Agent;
  agentDispatchMode: 'auto' | 'single' | 'swarm';
  setAgentDispatchMode: (mode: 'auto' | 'single' | 'swarm') => void;
  workspaceContext: WorkspaceContextData | null;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isSendingPrompt: boolean;
  promptInput: string;
  setPromptInput: (val: string) => void;
  isComplexityDetected: boolean;
  onSendPrompt: (e?: React.FormEvent, overrideText?: string) => void;
  onRunCommand: (cmd: string) => void;
  onExportSession: () => void;
  onOptimizePrompt: () => void;
  onOpenMobileSimulator: () => void;
}

export const ConsoleTab: React.FC<ConsoleTabProps> = ({
  agents,
  selectedAgentId,
  setSelectedAgentId,
  activeAgent,
  agentDispatchMode,
  setAgentDispatchMode,
  workspaceContext,
  chatMessages,
  setChatMessages,
  isSendingPrompt,
  promptInput,
  setPromptInput,
  isComplexityDetected,
  onSendPrompt,
  onRunCommand,
  onExportSession,
  onOptimizePrompt,
  onOpenMobileSimulator,
}) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div className="h-full flex flex-col rounded-2xl bg-[#17171c]/90 border border-white/[0.08] overflow-hidden shadow-xl backdrop-blur-md">
      {/* Agent Selector & Dev Action Header */}
      <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <select
            value={selectedAgentId}
            onChange={e => { setSelectedAgentId(e.target.value); sounds.playHoverTick(); }}
            className="bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#0071e3] cursor-pointer"
          >
            {agents.map(a => (
              <option key={a.id} value={a.id} className="bg-[#1c1c22] text-white">
                {a.name} ({a.model}) - {a.role}
              </option>
            ))}
          </select>

          {/* 3-Mode Dispatch Selector (Auto-Swarm | Único | Swarm) */}
          <div className="flex bg-black/40 p-0.5 rounded-xl border border-white/10 text-[11px] font-semibold">
            <button
              onClick={() => { setAgentDispatchMode('auto'); sounds.playHoverTick(); }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                agentDispatchMode === 'auto' ? 'bg-[#0071e3] text-white font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Auto-Multiagente
            </button>
            <button
              onClick={() => { setAgentDispatchMode('single'); sounds.playHoverTick(); }}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                agentDispatchMode === 'single' ? 'bg-white/20 text-white font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Único
            </button>
            <button
              onClick={() => { setAgentDispatchMode('swarm'); sounds.playHoverTick(); }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                agentDispatchMode === 'swarm' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Swarm
            </button>
          </div>
        </div>

        {/* Developer Quick Action Chips */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { onOpenMobileSimulator(); sounds.playHoverTick(); }}
            title="Abrir Simulador Móvil para auditar UI"
            className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-[11px] font-medium text-purple-300 border border-purple-500/30 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span>Auditar Móvil</span>
          </button>

          <button
            onClick={() => onSendPrompt(undefined, 'analizar estructura del workspace, dependencias y reglas de .agents')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-neutral-300 border border-white/10 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Analizar</span>
          </button>

          <button
            onClick={() => onRunCommand('npx tsc --noEmit || npm test')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-neutral-300 border border-white/10 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Typecheck</span>
          </button>

          <button
            onClick={() => onRunCommand('npm run build || ls -la')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-neutral-300 border border-white/10 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>Build</span>
          </button>

          <button
            onClick={onExportSession}
            title="Exportar sesion a archivo Markdown"
            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-neutral-300 border border-white/10 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Exportar</span>
          </button>

          <button
            onClick={() => { setChatMessages([]); sounds.playHoverTick(); }}
            title="Limpiar pantalla de chat"
            className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dynamic Package.json Scripts Bar */}
      {workspaceContext?.packageJson?.scripts && Object.keys(workspaceContext.packageJson.scripts).length > 0 && (
        <div className="px-4 py-1.5 bg-black/40 border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
          <span className="text-neutral-500 font-bold shrink-0">Scripts:</span>
          {Object.keys(workspaceContext.packageJson.scripts).map((scriptName, sIdx) => (
            <button
              key={sIdx}
              onClick={() => onRunCommand(`npm run ${scriptName}`)}
              className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.1] text-sky-300 border border-white/10 shrink-0 transition-colors cursor-pointer"
            >
              npm run {scriptName}
            </button>
          ))}
        </div>
      )}

      {/* Chat Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-black/30">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-400">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current" strokeWidth="1.5">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-white">Consola de Desarrollo SideNotch Lista</div>
            <div className="text-xs text-neutral-400 max-w-sm">
              Escribe cualquier instrucción técnica. Si la tarea requiere arquitectura, implementación y tests, el modo <span className="text-sky-400 font-bold">Auto-Multiagente</span> orquestará automáticamente a varios agentes especializados en cadena.
            </div>
          </div>
        ) : (
          chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.isAgent ? 'items-start' : 'items-end'}`}>
              <div className="text-[10px] text-neutral-400 mb-1 px-1">{msg.sender} · {msg.time}</div>
              <div
                className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  msg.isSwarmBadge
                    ? 'bg-purple-500/15 border border-purple-500/30 text-purple-200 font-mono shadow-md whitespace-pre-wrap'
                    : (msg.isAgent ? 'bg-white/[0.08] border border-white/10 text-neutral-100 shadow-sm whitespace-pre-wrap' : 'bg-[#0071e3] text-white shadow-md')
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isSendingPrompt && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 italic px-2">
            <div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            <span>{agentDispatchMode === 'auto' ? 'Analizando complejidad y orquestando agentes...' : `${activeAgent.name} esta procesando...`}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Prompt Quick Templates Bar & Optimizer */}
      <div className="px-3 py-1.5 bg-black/50 border-t border-white/[0.06] flex items-center justify-between gap-1.5 overflow-x-auto text-[10.5px]">
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-500 font-bold shrink-0">Plantillas:</span>
          <button
            onClick={() => onSendPrompt(undefined, 'Diseñar arquitectura de modulo, implementar componentes TypeScript y generar suite de tests unitarios')}
            className="px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold border border-purple-500/30 shrink-0 transition-colors cursor-pointer"
          >
            Flujo Fullstack Multi-Agente
          </button>
          <button
            onClick={() => onSendPrompt(undefined, 'Generar suite de tests unitarios exhaustivos para los modulos principales del workspace')}
            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 shrink-0 transition-colors cursor-pointer"
          >
            Tests Unitarios
          </button>
          <button
            onClick={() => onSendPrompt(undefined, 'Auditar posibles cuellos de botella de rendimiento y optimizar renderizados')}
            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 shrink-0 transition-colors cursor-pointer"
          >
            Optimizar Rendimiento
          </button>
        </div>

        <button
          onClick={onOptimizePrompt}
          title="Enriquecer prompt con estandares y tipos"
          className="px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold border border-purple-500/30 shrink-0 transition-colors cursor-pointer flex items-center gap-1"
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-current" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>Optimizar Prompt</span>
        </button>
      </div>

      {/* Real-time Multi-Agent Suggestion Banner */}
      {isComplexityDetected && agentDispatchMode === 'auto' && (
        <div className="px-4 py-1.5 bg-purple-500/15 border-t border-purple-500/20 flex items-center justify-between text-[11px] font-mono text-purple-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Tarea compleja: Se orquestara automaticamente entre Gemini (Arquitectura), Claude (Dev) y OpenAI (QA).</span>
          </div>
          <span className="text-[10px] bg-purple-500/30 px-1.5 py-0.5 rounded font-bold">Auto-Swarm Activo</span>
        </div>
      )}

      {/* Prompt Input Form */}
      <form onSubmit={onSendPrompt} className="p-3 border-t border-white/[0.08] bg-black/40 flex items-center gap-2">
        <input
          type="text"
          value={promptInput}
          onChange={e => setPromptInput(e.target.value)}
          placeholder={`Instruccion para ${agentDispatchMode === 'auto' ? 'desarrollo (Auto-Swarm)' : activeAgent.name} en ${workspaceContext?.folderName || 'workspace'}...`}
          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
        />
        <button
          type="submit"
          disabled={!promptInput.trim() || isSendingPrompt}
          className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold active:scale-95 cursor-pointer transition-all disabled:opacity-40"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};
