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
  onRunCommand?: (cmd: string) => void;
  onExportSession: () => void;
  onOptimizePrompt: () => void;
  onOpenMobileSimulator: () => void;
  promptQueueCount?: number;
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
  onSendPrompt,
  onExportSession,
  onOpenMobileSimulator,
  promptQueueCount = 0,
}) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const quickStarters = [
    {
      title: 'Crear nueva funcionalidad con el equipo',
      desc: 'Gemini diseña la arquitectura, Claude programa y GPT prueba.',
      icon: '👥',
      badge: 'Multi-Agente',
      prompt: 'Desarrollar una nueva funcionalidad completa en el proyecto con el equipo cooperativo: planificar, implementar y validar.',
    },
    {
      title: 'Auditar y explicar el proyecto',
      desc: 'Entiende la estructura y dependencias en lenguaje claro.',
      icon: '📖',
      badge: 'Arquitectura',
      prompt: 'Explícame en un lenguaje claro y sencillo qué hace este proyecto, qué archivos principales tiene y cómo funciona.',
    },
    {
      title: 'Buscar y arreglar errores en equipo',
      desc: 'Diagnóstico profundo y solución recomendada por varios agentes.',
      icon: '🛡️',
      badge: 'Diagnóstico',
      prompt: 'Revisa el código en busca de posibles errores, bugs o problemas de rendimiento y proponme los arreglos.',
    },
    {
      title: 'Auditar diseño en iPhone / Móvil',
      desc: 'Comprueba el diseño en pantalla pequeña y áreas seguras.',
      icon: '📱',
      badge: 'Diseño',
      action: onOpenMobileSimulator,
    },
  ];

  return (
    <div className="h-full flex flex-col rounded-2xl bg-[#13141c] border border-white/[0.08] overflow-hidden shadow-2xl">
      {/* 1. Cooperative Squad Header Selector Bar */}
      <div className="p-3 border-b border-white/[0.08] flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2.5">
          {/* Mode Selector */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            {/* Cooperative Swarm Button */}
            <button
              onClick={() => {
                setAgentDispatchMode('swarm');
                sounds.playHoverTick();
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 font-semibold ${
                agentDispatchMode === 'swarm' || agentDispatchMode === 'auto'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <div className="flex items-center -space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4FF00] border border-black shadow-sm" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A] border border-black shadow-sm" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10A37F] border border-black shadow-sm" />
              </div>
              <span>Equipo Cooperativo (3 Agentes)</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-bold">Activo</span>
            </button>

            {/* Single Agent Option */}
            <button
              onClick={() => {
                setAgentDispatchMode('single');
                sounds.playHoverTick();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                agentDispatchMode === 'single'
                  ? 'bg-white/15 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Agente Único
            </button>
          </div>

          {/* If single agent mode, show model chooser */}
          {agentDispatchMode === 'single' && (
            <select
              value={selectedAgentId}
              onChange={e => {
                setSelectedAgentId(e.target.value);
                sounds.playHoverTick();
              }}
              className="bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-[#0071e3] cursor-pointer"
            >
              {agents.map(a => (
                <option key={a.id} value={a.id} className="bg-[#1c1c22] text-white">
                  {a.name} ({a.model})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {promptQueueCount > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{promptQueueCount} en cola</span>
            </div>
          )}

          {chatMessages.length > 0 && (
            <>
              <button
                onClick={onExportSession}
                title="Guardar sesión"
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-neutral-300 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
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
                title="Limpiar chat"
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 hover:text-rose-300 text-neutral-400 border border-white/10 transition-colors cursor-pointer"
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

      {/* 2. Messages Stream / Welcome Starter Screen */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-black/20">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-6 max-w-xl mx-auto">
            {/* Friendly Greeting with Cooperative Squad Banner */}
            <div className="space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500/20 via-blue-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-2xl mx-auto shadow-xl">
                👥
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Equipo Cooperativo de Agentes Antigravity
              </h3>
              <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
                Pega cualquier prompt o tarea. Tus agentes colaborarán en cadena para analizar, programar y verificar en <span className="text-sky-400 font-semibold">{workspaceContext?.folderName || 'este workspace'}</span>.
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
                  className="p-4 rounded-xl bg-[#171924] hover:bg-[#1d202e] border border-white/[0.08] hover:border-purple-500/40 transition-all cursor-pointer space-y-2 group active:scale-[0.98] shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{starter.icon}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-neutral-400 font-semibold">
                      {starter.badge}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      {starter.title}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-normal mt-0.5">
                      {starter.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg, idx) => {
            const isGemini = msg.sender.toLowerCase().includes('gemini') || msg.sender.toLowerCase().includes('architect');
            const isClaude = msg.sender.toLowerCase().includes('claude') || msg.sender.toLowerCase().includes('developer');
            const isOpenAI = msg.sender.toLowerCase().includes('openai') || msg.sender.toLowerCase().includes('gpt') || msg.sender.toLowerCase().includes('qa');
            const isSwarmHeader = msg.isSwarmBadge;

            const badgeColor = isGemini ? '#D4FF00' : isClaude ? '#FF6B4A' : isOpenAI ? '#10A37F' : '#38bdf8';

            return (
              <div key={idx} className={`flex flex-col ${msg.isAgent ? 'items-start' : 'items-end'}`}>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1 px-1 font-mono">
                  {msg.isAgent && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: badgeColor }} />}
                  <span className="font-semibold text-neutral-300">{msg.sender}</span>
                  <span>·</span>
                  <span>{msg.time}</span>
                </div>
                <div
                  className={`max-w-[88%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                    isSwarmHeader
                      ? 'bg-purple-500/15 border border-purple-500/30 text-purple-200 font-mono shadow-md whitespace-pre-wrap'
                      : msg.isAgent
                      ? 'bg-[#181a24] border border-white/10 text-neutral-100 shadow-sm whitespace-pre-wrap'
                      : 'bg-[#0071e3] text-white shadow-md font-medium'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}

        {isSendingPrompt && (
          <div className="flex items-center gap-2.5 text-xs text-purple-300 italic px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 w-fit">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
            <span>
              {agentDispatchMode === 'swarm' || agentDispatchMode === 'auto'
                ? 'El equipo cooperativo está procesando en cadena (Gemini -> Claude -> GPT)...'
                : `${activeAgent.name} está pensando...`}
            </span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 3. Bottom Prompt Input Form */}
      <form onSubmit={onSendPrompt} className="p-3.5 border-t border-white/[0.08] bg-black/40 flex items-center gap-2.5">
        <input
          type="text"
          value={promptInput}
          onChange={e => setPromptInput(e.target.value)}
          placeholder="Escribe una tarea para el equipo cooperativo (puedes enviar varias seguidas)..."
          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={!promptInput.trim()}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold active:scale-95 cursor-pointer transition-all disabled:opacity-40 shadow-lg shadow-purple-500/25 flex items-center gap-1.5"
        >
          <span>Asignar Tarea</span>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
};
