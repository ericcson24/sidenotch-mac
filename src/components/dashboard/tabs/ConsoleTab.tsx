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
  isComplexityDetected?: boolean;
  onSendPrompt: (e?: React.FormEvent, overrideText?: string) => void;
  onRunCommand?: (cmd: string) => void;
  onExportSession: () => void;
  onOptimizePrompt?: () => void;
  onOpenMobileSimulator?: () => void;
  promptQueueCount?: number;
}

export const ConsoleTab: React.FC<ConsoleTabProps> = ({
  agentDispatchMode,
  setAgentDispatchMode,
  workspaceContext,
  chatMessages,
  setChatMessages,
  isSendingPrompt,
  promptInput,
  setPromptInput,
  onSendPrompt,
  onExportSession,
  promptQueueCount = 0,
}) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const quickPrompts = [
    {
      title: 'Crear o mejorar código',
      desc: 'Añadir componentes, lógica o páginas',
      icon: '✨',
      prompt: 'Analiza el proyecto y ayúdame a crear o mejorar la siguiente funcionalidad clave.',
    },
    {
      title: 'Explicar este proyecto',
      desc: 'Estructura y funcionamiento en lenguaje claro',
      icon: '📖',
      prompt: 'Explícame en un lenguaje claro y sencillo qué hace este proyecto, qué archivos principales tiene y cómo funciona.',
    },
    {
      title: 'Buscar y arreglar errores',
      desc: 'Auditoría profunda de bugs y rendimiento',
      icon: '🛡️',
      prompt: 'Revisa el código en busca de posibles errores, bugs o problemas de rendimiento y proponme los arreglos.',
    },
  ];

  return (
    <div className="h-full flex flex-col rounded-2xl bg-[#12131a] border border-white/[0.06] overflow-hidden shadow-2xl">
      {/* Top Model Mode Bar */}
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
          {/* Simple Mode Toggle */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => {
                setAgentDispatchMode('swarm');
                sounds.playHoverTick();
              }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                agentDispatchMode === 'swarm' || agentDispatchMode === 'auto'
                  ? 'bg-purple-600 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>👥 Equipo Cooperativo</span>
            </button>

            <button
              onClick={() => {
                setAgentDispatchMode('single');
                sounds.playHoverTick();
              }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                agentDispatchMode === 'single'
                  ? 'bg-white/20 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>⚡ Modo Rápido</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {promptQueueCount > 0 && (
            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {promptQueueCount} en espera
            </span>
          )}

          {chatMessages.length > 0 && (
            <>
              <button
                onClick={onExportSession}
                title="Exportar conversación a Markdown"
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer px-2 py-1 flex items-center gap-1"
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
                className="text-xs text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer px-2 py-1"
              >
                Limpiar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages / Welcome Canvas */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-black/20">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-6 max-w-lg mx-auto">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight">
                ¿Qué deseas hacer en <span className="text-sky-400">{workspaceContext?.folderName || 'tu proyecto'}</span>?
              </h3>
              <p className="text-xs text-neutral-400">
                Escribe lo que necesitas o selecciona una opción rápida:
              </p>
            </div>

            {/* 3 Simple Action Chips */}
            <div className="flex flex-col gap-2.5 w-full">
              {quickPrompts.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSendPrompt(undefined, item.prompt)}
                  className="p-3.5 rounded-xl bg-[#171822] hover:bg-[#1e202e] border border-white/[0.06] hover:border-sky-500/30 transition-all cursor-pointer flex items-center justify-between text-left group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-neutral-400">{item.desc}</div>
                    </div>
                  </div>
                  <span className="text-neutral-500 text-xs group-hover:translate-x-1 transition-transform">→</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.isAgent ? 'items-start' : 'items-end'}`}>
              <div className="text-[10px] text-neutral-400 mb-1 px-1">{msg.sender} · {msg.time}</div>
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  msg.isSwarmBadge
                    ? 'bg-purple-500/15 border border-purple-500/30 text-purple-200 font-mono shadow-md whitespace-pre-wrap'
                    : msg.isAgent
                    ? 'bg-[#171822] border border-white/10 text-neutral-100 shadow-sm whitespace-pre-wrap'
                    : 'bg-[#0071e3] text-white shadow-md font-medium'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}

        {isSendingPrompt && (
          <div className="flex items-center gap-2 text-xs text-purple-300 italic px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 w-fit">
            <div className="w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
            <span>Procesando instrucción con el equipo cooperativo...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Simplified Prompt Input */}
      <form onSubmit={onSendPrompt} className="p-3 border-t border-white/[0.06] bg-black/40 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={promptInput}
          onChange={e => setPromptInput(e.target.value)}
          placeholder="Escribe tu instrucción o tarea aquí..."
          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3]"
        />
        <button
          type="submit"
          disabled={!promptInput.trim()}
          className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold active:scale-95 cursor-pointer transition-all disabled:opacity-40"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};
