import React from 'react';
import type { WorkspaceContextData } from '../../../types/dashboard';
import { sounds } from '../../../utils/soundEffects';

interface CodeViewerTabProps {
  workspaceContext: WorkspaceContextData | null;
  selectedFileForViewer: string | null;
  fileContent: string;
  isLoadingFile: boolean;
  copySuccess: boolean;
  setCopySuccess: (val: boolean) => void;
  onOpenFileInViewer: (path: string) => void;
  onSendPrompt: (e?: React.FormEvent, overrideText?: string) => void;
}

export const CodeViewerTab: React.FC<CodeViewerTabProps> = ({
  workspaceContext,
  selectedFileForViewer,
  fileContent,
  isLoadingFile,
  copySuccess,
  setCopySuccess,
  onOpenFileInViewer,
  onSendPrompt,
}) => {
  const handleCopy = () => {
    if (!fileContent) return;
    navigator.clipboard.writeText(fileContent);
    setCopySuccess(true);
    sounds.playHoverTick();
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Visor & Explorador de Archivos</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Explora cualquier archivo de tu proyecto y pide a la IA que lo refactorice o explique.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* File Tree List */}
        <div className="w-64 rounded-2xl bg-[#13141c] border border-white/[0.08] p-3 flex flex-col space-y-2 shadow-xl shrink-0">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
            Archivos ({workspaceContext?.filesList?.length || 0})
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
            {workspaceContext?.filesList?.map((file, idx) => (
              <button
                key={idx}
                onClick={() => onOpenFileInViewer(`${workspaceContext.path}/${file.name}`)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg truncate transition-all cursor-pointer flex items-center gap-2 ${
                  selectedFileForViewer?.endsWith(file.name)
                    ? 'bg-[#0071e3] text-white font-bold'
                    : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <span>{file.isDirectory ? '📁' : '📄'}</span>
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Content Canvas */}
        <div className="flex-1 rounded-2xl bg-[#13141c] border border-white/[0.08] flex flex-col overflow-hidden shadow-xl">
          <div className="p-3 border-b border-white/[0.08] bg-black/30 flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-200 truncate">
              {selectedFileForViewer || 'Selecciona un archivo del listado'}
            </span>

            {selectedFileForViewer && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-neutral-300 border border-white/10 transition-colors cursor-pointer"
                >
                  {copySuccess ? '✓ Copiado' : 'Copiar'}
                </button>
                <button
                  onClick={() => onSendPrompt(undefined, `Refactoriza y optimiza el siguiente código del archivo ${selectedFileForViewer}:\n\`\`\`\n${fileContent.slice(0, 3000)}\n\`\`\``)}
                  className="px-3 py-1 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-xs font-bold text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Refactorizar con IA
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs bg-black/40 text-neutral-200 leading-relaxed whitespace-pre-wrap">
            {isLoadingFile ? (
              <div className="flex items-center gap-2 text-neutral-400">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                <span>Cargando archivo...</span>
              </div>
            ) : fileContent ? (
              fileContent
            ) : (
              <span className="text-neutral-500">Haz clic en cualquier archivo para inspeccionarlo aquí.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
