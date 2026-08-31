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
  return (
    <div className="h-full flex rounded-2xl bg-[#17171c]/90 border border-white/[0.08] overflow-hidden shadow-xl backdrop-blur-md">
      {/* Left File Tree */}
      <div className="w-64 border-r border-white/10 bg-black/30 p-3 overflow-y-auto space-y-1">
        <div className="text-xs font-bold text-neutral-400 uppercase px-2 py-1 tracking-wider">Archivos del Proyecto</div>
        {workspaceContext?.filesList?.map((f, fIdx) => (
          <button
            key={fIdx}
            onClick={() => onOpenFileInViewer(f.path)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
              selectedFileForViewer === f.path ? 'bg-[#0071e3] text-white' : 'text-neutral-300 hover:bg-white/5'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current shrink-0" strokeWidth="2">
              {f.isDirectory ? (
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              ) : (
                <>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </>
              )}
            </svg>
            <span className="truncate">{f.name}</span>
          </button>
        ))}
      </div>

      {/* Right Code Content Preview */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black/50">
        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="text-xs font-mono text-neutral-300 truncate">
            {selectedFileForViewer || 'Selecciona un archivo para inspeccionar'}
          </div>
          {selectedFileForViewer && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(fileContent);
                  setCopySuccess(true);
                  sounds.playIslandExpand();
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono text-neutral-200 transition-colors cursor-pointer"
              >
                {copySuccess ? '✓ Copiado' : 'Copiar'}
              </button>
              <button
                onClick={() => onSendPrompt(undefined, `Refactoriza y analiza el archivo ${selectedFileForViewer.split('/').pop()}:\n\n${fileContent.slice(0, 800)}`)}
                className="px-3 py-1 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white text-[11px] font-bold transition-all cursor-pointer active:scale-95"
              >
                Analizar con Agente
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-neutral-200 whitespace-pre leading-relaxed">
          {isLoadingFile ? (
            <div className="flex items-center gap-2 text-neutral-400">
              <div className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              <span>Cargando archivo...</span>
            </div>
          ) : (
            fileContent || '// Selecciona cualquier archivo en la columna izquierda para leer su contenido.'
          )}
        </div>
      </div>
    </div>
  );
};
