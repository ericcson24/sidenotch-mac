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
  onRunCommand: _onRunCommand,
  onExportSession,
  onOpenMobileSimulator,
}) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const quickStarters = [
    {
      title: 'Crear o mejorar código',
      desc: 'Pide que cree componentes, páginas o lógica para tu app.',
      icon: '✨',
      prompt: 'Ayúdame a mejorar este proyecto: analiza lo que tenemos y propón la siguiente funcionalidad recomendada.',
    },
    {
      title: 'Explicar este proyecto',
      desc: 'Entiende cómo funciona la estructura de archivos y componentes.',
      icon: '📖',
      prompt: 'Explícame en un lenguaje claro y sencillo qué hace este proyecto, qué archivos principales tiene y cómo funciona.',
    },
    {
      title: 'Auditar y corregir errores',
      desc: 'Revisa si hay fallos de código, bugs o posibles problemas.',
      icon: '🛡️',
      prompt: 'Revisa el código en busca de posibles errores, bugs o problemas de rendimiento y proponme los arreglos.',
    },
    {
      title: 'Auditar vista en iPhone / Móvil',
      desc: 'Comprueba el diseño en pantalla pequeña y áreas seguras.',
      icon: '📱',
      action: onOpenMobileSimulator,
    },
  ];

  return (
    <div className="h-full flex flex-col rounded-3xl bg-[#141419]/90 border border-white/[0.08] overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* 1. Model Selector Header Bar */}
      <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between bg-black/30">
        <div className="flex items-center gap-3">
          {/* Quick Model Selector Pills */}
          <div className="flex bg-black/50 p-1 rounded-2xl border border-white/10 text-xs font-medium">
            <button
              onClick={() => {
                setAgentDispatchMode('auto');
                sounds.playHoverTick();
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                agentDispatchMode === 'auto'
                  ? 'bg-[#0071e3] text-white font-bold shadow-md shadow-blue-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Modo Auto (Inteligente)</span>
            </button>

            {agents.slice(0, 3).map(a => (
              <button
                key={a.id}
                onClick={() => {
                  setAgentDispatchMode('single');
                  setSelectedAgentId(a.id);
                  sounds.playHoverTick();
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  agentDispatchMode === 'single' && selectedAgentId === a.id
                    ? 'bg-white/20 text-white font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {a.name.split(' ')[0]} ({a.model.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

        {/* Clear / Export Actions */}
        <div className="flex items-center gap-2">
          {chatMessages.length > 0 && (
            <>
              <button
                onClick={onExportSession}
                title="Guardar esta conversación en un archivo"
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-neutral-300 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Exportar</span>
              </button>

              <button
                onClick={() => {
                  setChatMessages([]);
                  sounds.playHoverTick();
                }}
                title="Limpiar pantalla"
                className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 hover:text-rose-300 text-neutral-400 border border-white/10 transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Messages Stream / Welcome Cards */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-black/25">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-xl mx-auto">
            {/* Friendly Greeting */}
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-2xl mx-auto shadow-lg">
                ✨
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">¿En qué puedo ayudarte hoy?</h3>
              <p className="text-xs text-neutral-400 max-w-md">
                Escribe en español lo que necesitas para tu proyecto en <span className="text-sky-400 font-semibold">{workspaceContext?.folderName || 'este workspace'}</span>.
              </p>
            </div>

            {/* 4 Friendly Action Starter Cards */}
            <div className="grid grid-cols-2 gap-3 w-full text-left">
              {quickStarters.map((starter, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (starter.action) {
                      starter.action();
                    } else if (starter.prompt) {
                      onSendPrompt(undefined, starter.prompt);
                    }
                  }}
                  className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-sky-500/40 transition-all cursor-pointer space-y-1.5 group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{starter.icon}</span>
                    <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                      {starter.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal">
                    {starter.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.isAgent ? 'items-start' : 'items-end'} animate-in fade-in`}>
              <div className="text-[10px] text-neutral-400 mb-1 px-1">{msg.sender} · {msg.time}</div>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                  msg.isSwarmBadge
                    ? 'bg-purple-500/15 border border-purple-500/30 text-purple-200 font-mono shadow-md whitespace-pre-wrap'
                    : msg.isAgent
                    ? 'bg-white/[0.07] border border-white/10 text-neutral-100 shadow-sm whitespace-pre-wrap'
                    : 'bg-[#0071e3] text-white shadow-md font-medium'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}

        {isSendingPrompt && (
          <div className="flex items-center gap-2.5 text-xs text-neutral-400 italic px-2 py-1">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
            <span>{agentDispatchMode === 'auto' ? 'Analizando y ejecutando con el mejor modelo...' : `${activeAgent.name} está pensando...`}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 3. Real-time Multi-Agent Suggestion Banner */}
      {isComplexityDetected && agentDispatchMode === 'auto' && (
        <div className="px-4 py-2 bg-purple-500/15 border-t border-purple-500/25 flex items-center justify-between text-xs text-purple-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Tarea compleja detectada: Varios agentes colaborarán automáticamente en cadena.</span>
          </div>
          <span className="text-[10px] bg-purple-500/30 px-2 py-0.5 rounded-full font-bold">Auto-Swarm</span>
        </div>
      )}

      {/* 4. Bottom Prompt Input Form */}
      <form onSubmit={onSendPrompt} className="p-3.5 border-t border-white/[0.08] bg-black/50 flex items-center gap-2">
        <input
          type="text"
          value={promptInput}
          onChange={e => setPromptInput(e.target.value)}
          placeholder={`Escribe lo que quieres que la IA haga en tu proyecto...`}
          className="flex-1 bg-black/60 border border-white/15 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
        />
        <button
          type="submit"
          disabled={!promptInput.trim() || isSendingPrompt}
          className="px-6 py-3 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold active:scale-95 cursor-pointer transition-all disabled:opacity-40 shadow-lg shadow-blue-500/25"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};
