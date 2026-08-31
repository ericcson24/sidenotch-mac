import React, { useState } from 'react';
import type { GitFileInfo, GitCommitNode, GitBranchItem } from '../../../types/dashboard';
import { sounds } from '../../../utils/soundEffects';

interface GitManagerTabProps {
  currentWorkspace: string;
  gitStatus: { isGit: boolean; branch: string; files: GitFileInfo[] };
  gitCommits: GitCommitNode[];
  gitBranches: GitBranchItem[];
  selectedCommit: GitCommitNode | null;
  setSelectedCommit: (commit: GitCommitNode | null) => void;
  commitMessage: string;
  setCommitMessage: (msg: string) => void;
  isGeneratingCommit: boolean;
  onRefreshGitStatus: () => void;
  onCheckoutBranch: (branch: string) => void;
  onStartFeature: (e: React.FormEvent, featureName: string) => void;
  onCreateRelease: (e: React.FormEvent, releaseTag: string) => void;
  onGenerateAICommitMessage: () => void;
  onRunCommand: (cmd: string) => void;
  onSendPrompt: (e?: React.FormEvent, overrideText?: string) => void;
}

const LANE_COLORS = ['#30d158', '#bf5af2', '#ff9f0a', '#ff453a', '#00d2ff', '#ffd60a'];

export const GitManagerTab: React.FC<GitManagerTabProps> = ({
  currentWorkspace: _currentWorkspace,
  gitStatus,
  gitCommits,
  gitBranches,
  selectedCommit,
  setSelectedCommit,
  commitMessage,
  setCommitMessage,
  isGeneratingCommit,
  onRefreshGitStatus,
  onCheckoutBranch,
  onStartFeature,
  onGenerateAICommitMessage,
  onRunCommand,
  onSendPrompt,
}) => {
  const [newFeatureName, setNewFeatureName] = useState<string>('');
  const [isStartingFeature, setIsStartingFeature] = useState<boolean>(false);

  const handleFeatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;
    onStartFeature(e, newFeatureName.trim());
    setIsStartingFeature(false);
    setNewFeatureName('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Proyecto & Control de Cambios</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Visualiza qué archivos han cambiado en tu código y guarda tus avances fácilmente.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setIsStartingFeature(true); sounds.playHoverTick(); }}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>+ Nueva Rama</span>
          </button>

          <button
            onClick={onRefreshGitStatus}
            title="Recargar estado"
            className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Start Feature Modal */}
      {isStartingFeature && (
        <form onSubmit={handleFeatureSubmit} className="p-4 rounded-2xl bg-[#161822] border border-[#0071e3] space-y-3 shadow-2xl animate-in fade-in">
          <div className="text-xs font-bold text-white">Crear Nueva Rama de Trabajo (Feature)</div>
          <input
            type="text"
            value={newFeatureName}
            onChange={e => setNewFeatureName(e.target.value)}
            placeholder="nueva-funcionalidad (ej: sistema-login)"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsStartingFeature(false)}
              className="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-neutral-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#0071e3] text-xs font-bold text-white cursor-pointer"
            >
              Crear Rama
            </button>
          </div>
        </form>
      )}

      {/* Branches Ribbon */}
      {gitBranches.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-neutral-400 shrink-0">Rama activa:</span>
          {gitBranches.map((b, idx) => (
            <button
              key={idx}
              onClick={() => onCheckoutBranch(b.name)}
              className={`px-3 py-1 rounded-xl text-xs font-mono shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                b.isCurrent
                  ? 'bg-[#0071e3] text-white font-bold shadow-md shadow-blue-500/20'
                  : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] border border-white/10'
              }`}
            >
              {b.isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* 1. Staging & Commit Section */}
      <div className="p-5 rounded-2xl bg-[#13141c] border border-white/[0.08] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Archivos Modificados ({gitStatus.files.length})
            </span>
            {gitStatus.files.length === 0 && (
              <span className="text-xs text-emerald-400 font-medium">✓ Todo al día</span>
            )}
          </div>
          {gitStatus.files.length > 0 && (
            <button
              onClick={onGenerateAICommitMessage}
              disabled={isGeneratingCommit}
              className="px-3 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isGeneratingCommit ? 'Generando...' : '✨ Sugerir mensaje con IA'}
            </button>
          )}
        </div>

        {gitStatus.files.length > 0 && (
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5 max-h-36 overflow-y-auto font-mono text-xs text-neutral-300">
            {gitStatus.files.map((f, i) => (
              <div key={i} className="flex items-center justify-between py-0.5">
                <span className="truncate">{f.file}</span>
                <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.2 rounded bg-amber-400/10">Modificado</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <input
            type="text"
            value={commitMessage}
            onChange={e => setCommitMessage(e.target.value)}
            placeholder="Escribe qué cambios hiciste (ej: mejorar diseño y colores)..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onRunCommand('git stash')}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 text-xs font-medium border border-white/10 transition-all cursor-pointer"
            >
              Guardar temporalmente (Stash)
            </button>
            <button
              onClick={() => onRunCommand(`git add . && git commit -m "${commitMessage || 'update'}"`)}
              disabled={!commitMessage.trim() || gitStatus.files.length === 0}
              className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
            >
              Guardar Cambios (Commit)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Commit History */}
      <div className="rounded-2xl bg-[#13141c] border border-white/[0.08] overflow-hidden shadow-xl flex flex-col">
        <div className="p-4 border-b border-white/[0.08] bg-black/20 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Historial de Cambios ({gitCommits.length})</span>
          <span className="text-xs text-neutral-400 font-mono">Rama: <span className="text-sky-400 font-bold">{gitStatus.branch}</span></span>
        </div>

        <div className="p-4 overflow-y-auto max-h-[300px] space-y-2.5 font-mono text-xs">
          {gitCommits.length > 0 ? (
            gitCommits.map((commit, cIdx) => {
              const laneColor = LANE_COLORS[commit.lane % LANE_COLORS.length];
              return (
                <div
                  key={commit.id || cIdx}
                  onClick={() => { setSelectedCommit(commit); sounds.playHoverTick(); }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedCommit?.id === commit.id
                      ? 'bg-[#0071e3]/15 border-[#0071e3]'
                      : 'bg-black/30 border-white/[0.06] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: laneColor }} />
                      <span className="text-[11px] font-bold text-neutral-400">{commit.id.slice(0, 7)}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs text-white truncate font-sans">{commit.message}</div>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                        <span className="text-neutral-300">{commit.author}</span>
                        <span>·</span>
                        <span>{commit.timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onSendPrompt(undefined, `Explica los cambios del commit ${commit.id.slice(0, 7)} (${commit.message}) y evalúa su impacto.`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-neutral-300 shrink-0 transition-colors cursor-pointer"
                  >
                    Explicar con IA
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-neutral-400">
              No se han encontrado commits aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
