import React, { useState } from 'react';
import type {
  Agent,
  WorkspaceContextData,
  ArenaResult,
  ErrorDiagnosis,
} from '../../../types/dashboard';
import { sounds } from '../../../utils/soundEffects';

// Subtools
import { ArenaTab } from './ArenaTab';
import { DebuggerTab } from './DebuggerTab';
import { SwarmTab } from './SwarmTab';
import { CodeViewerTab } from './CodeViewerTab';
import { ScratchpadTab } from './ScratchpadTab';
import { AgentsContextTab } from './AgentsContextTab';

interface ToolsHubTabProps {
  currentWorkspace: string;
  workspaceContext: WorkspaceContextData | null;
  agents: Agent[];
  // Arena
  arenaPrompt: string;
  setArenaPrompt: (p: string) => void;
  isExecutingArena: boolean;
  arenaResults: ArenaResult[];
  arenaExecutionTime: number;
  onRunArena: (e?: React.FormEvent) => void;
  // Debugger
  errorInput: string;
  setErrorInput: (err: string) => void;
  errorDiagnosis: ErrorDiagnosis | null;
  onDiagnoseError: (e?: React.FormEvent) => void;
  // Code Viewer
  selectedFileForViewer: string | null;
  fileContent: string;
  isLoadingFile: boolean;
  copySuccess: boolean;
  setCopySuccess: (val: boolean) => void;
  onOpenFileInViewer: (path: string) => void;
  // Scratchpad
  scratchpadText: string;
  isSavingScratchpad: boolean;
  onSaveScratchpad: (t: string) => void;
  // Swarm
  selectedSwarmAgentIds: string[];
  setSelectedSwarmAgentIds: React.Dispatch<React.SetStateAction<string[]>>;
  swarmPrompt: string;
  setSwarmPrompt: (p: string) => void;
  isExecutingSwarm: boolean;
  swarmProgressLogs: string[];
  onRunSwarmPipeline: (e?: React.FormEvent) => void;
  // Agents context
  onCreateRule: (e: React.FormEvent, name: string, content: string) => void;
  onSendPrompt: (e?: React.FormEvent, overrideText?: string) => void;
  onOpenMobileSimulator?: () => void;
}

export const ToolsHubTab: React.FC<ToolsHubTabProps> = ({
  currentWorkspace,
  workspaceContext,
  agents,
  arenaPrompt,
  setArenaPrompt,
  isExecutingArena,
  arenaResults,
  arenaExecutionTime,
  onRunArena,
  errorInput,
  setErrorInput,
  errorDiagnosis,
  onDiagnoseError,
  selectedFileForViewer,
  fileContent,
  isLoadingFile,
  copySuccess,
  setCopySuccess,
  onOpenFileInViewer,
  scratchpadText,
  isSavingScratchpad,
  onSaveScratchpad,
  selectedSwarmAgentIds,
  setSelectedSwarmAgentIds,
  swarmPrompt,
  setSwarmPrompt,
  isExecutingSwarm,
  swarmProgressLogs,
  onRunSwarmPipeline,
  onCreateRule,
  onSendPrompt,
  onOpenMobileSimulator,
}) => {
  const [activeSubTool, setActiveSubTool] = useState<'hub' | 'arena' | 'debugger' | 'swarm' | 'code-viewer' | 'scratchpad' | 'agents-context'>('hub');

  const tools = [
    {
      id: 'debugger' as const,
      title: 'Depurador de Errores',
      description: 'Pega cualquier error de compilación o terminal y la IA te dirá exactamente qué archivo y línea arreglar.',
      tag: 'Diagnóstico',
      color: 'border-rose-500/30 hover:border-rose-500/60',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current text-rose-400" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      id: 'arena' as const,
      title: 'Arena de Modelos (4x)',
      description: 'Haz que Gemini, Claude, GPT-4o y DeepSeek compitan en directo para ver cuál da la mejor respuesta.',
      tag: 'Comparador',
      color: 'border-purple-500/30 hover:border-purple-500/60',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current text-purple-400" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      id: 'swarm' as const,
      title: 'Equipo Multi-Agente (Swarm)',
      description: 'Pon a trabajar a varios agentes a la vez: uno diseña la arquitectura, otro programa y otro hace pruebas.',
      tag: 'Pipeline',
      color: 'border-sky-500/30 hover:border-sky-500/60',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current text-sky-400" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
    },
    {
      id: 'mobile' as const,
      title: 'Simulador Móvil iPhone',
      description: 'Previsualiza tu web o app en un iPhone virtual y audita áreas táctiles, textos y zonas seguras de iOS.',
      tag: 'Diseño',
      color: 'border-blue-500/30 hover:border-blue-500/60',
      action: onOpenMobileSimulator,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current text-blue-400" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
    },
    {
      id: 'code-viewer' as const,
      title: 'Visor de Archivos',
      description: 'Explora y revisa los archivos de tu proyecto y pide a la IA que los refactorice en un clic.',
      tag: 'Explorador',
      color: 'border-emerald-500/30 hover:border-emerald-500/60',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current text-emerald-400" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      id: 'scratchpad' as const,
      title: 'Bloc de Notas Inteligente',
      description: 'Apunta ideas, tareas y esquemas técnicos con autoguardado automático en disco.',
      tag: 'Notas',
      color: 'border-amber-500/30 hover:border-amber-500/60',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current text-amber-400" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      id: 'agents-context' as const,
      title: 'Reglas del Proyecto (.agents)',
      description: 'Configura directivas y normas de estilo para que todos los agentes sigan tus pautas.',
      tag: 'Reglas',
      color: 'border-pink-500/30 hover:border-pink-500/60',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current text-pink-400" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Sub-tool Header & Back button */}
      {activeSubTool !== 'hub' && (
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <button
            onClick={() => { setActiveSubTool('hub'); sounds.playHoverTick(); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-neutral-200 transition-all cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Volver a Herramientas Pro</span>
          </button>

          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-medium">
            {tools.filter(t => t.id !== 'mobile').map(t => (
              <button
                key={t.id}
                onClick={() => { setActiveSubTool(t.id as typeof activeSubTool); sounds.playHoverTick(); }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSubTool === t.id
                    ? 'bg-[#0071e3] text-white font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t.tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Tools Bento Grid */}
      {activeSubTool === 'hub' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Herramientas Pro de Desarrollo</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Utilidades directas para diagnosticar fallos, simular en móviles, comparar modelos y organizar agentes.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {tools.map(t => (
              <div
                key={t.id}
                onClick={() => {
                  if (t.action) {
                    t.action();
                  } else {
                    setActiveSubTool(t.id as typeof activeSubTool);
                  }
                  sounds.playHoverTick();
                }}
                className={`p-5 rounded-2xl bg-[#13141c] border ${t.color} transition-all cursor-pointer space-y-3 group shadow-xl active:scale-[0.99] flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 group-hover:scale-105 transition-transform">
                      {t.icon}
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10.5px] font-mono text-neutral-300 font-semibold">
                      {t.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                      {t.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
                  <span>Abrir</span>
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Sub-Tool Rendering */}
      {activeSubTool === 'arena' && (
        <ArenaTab
          arenaPrompt={arenaPrompt}
          setArenaPrompt={setArenaPrompt}
          isExecutingArena={isExecutingArena}
          arenaResults={arenaResults}
          arenaExecutionTime={arenaExecutionTime}
          onRunArena={onRunArena}
        />
      )}

      {activeSubTool === 'debugger' && (
        <DebuggerTab
          currentWorkspace={currentWorkspace}
          errorInput={errorInput}
          setErrorInput={setErrorInput}
          errorDiagnosis={errorDiagnosis}
          onDiagnoseError={onDiagnoseError}
          onOpenFileInViewer={onOpenFileInViewer}
          onSendPrompt={onSendPrompt}
        />
      )}

      {activeSubTool === 'swarm' && (
        <SwarmTab
          agents={agents}
          selectedSwarmAgentIds={selectedSwarmAgentIds}
          setSelectedSwarmAgentIds={setSelectedSwarmAgentIds}
          swarmPrompt={swarmPrompt}
          setSwarmPrompt={setSwarmPrompt}
          isExecutingSwarm={isExecutingSwarm}
          swarmProgressLogs={swarmProgressLogs}
          workspaceContext={workspaceContext}
          onRunSwarmPipeline={onRunSwarmPipeline}
        />
      )}

      {activeSubTool === 'code-viewer' && (
        <CodeViewerTab
          workspaceContext={workspaceContext}
          selectedFileForViewer={selectedFileForViewer}
          fileContent={fileContent}
          isLoadingFile={isLoadingFile}
          copySuccess={copySuccess}
          setCopySuccess={setCopySuccess}
          onOpenFileInViewer={onOpenFileInViewer}
          onSendPrompt={onSendPrompt}
        />
      )}

      {activeSubTool === 'scratchpad' && (
        <ScratchpadTab
          scratchpadText={scratchpadText}
          isSavingScratchpad={isSavingScratchpad}
          onSaveScratchpad={onSaveScratchpad}
          onSendPrompt={onSendPrompt}
        />
      )}

      {activeSubTool === 'agents-context' && (
        <AgentsContextTab
          workspaceContext={workspaceContext}
          onCreateRule={onCreateRule}
        />
      )}
    </div>
  );
};
