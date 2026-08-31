import React from 'react';
import type { ErrorDiagnosis } from '../../../types/dashboard';

interface DebuggerTabProps {
  currentWorkspace: string;
  errorInput: string;
  setErrorInput: (err: string) => void;
  errorDiagnosis: ErrorDiagnosis | null;
  onDiagnoseError: (e?: React.FormEvent) => void;
  onOpenFileInViewer: (filePath: string) => void;
  onSendPrompt: (e?: React.FormEvent, overrideText?: string) => void;
}

export const DebuggerTab: React.FC<DebuggerTabProps> = ({
  currentWorkspace,
  errorInput,
  setErrorInput,
  errorDiagnosis,
  onDiagnoseError,
  onOpenFileInViewer,
  onSendPrompt,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Depurador IA de Errores & Stack Traces</h2>
        <p className="text-xs text-neutral-400">Pega cualquier error de compilación o ejecución para que el agente localice el archivo causante y sugiera el arreglo exacto.</p>
      </div>

      {/* Trace Input */}
      <form onSubmit={onDiagnoseError} className="p-5 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-3 backdrop-blur-md shadow-xl">
        <div className="text-xs font-bold text-white uppercase tracking-wider">Pega el Error o Stack Trace de la Terminal</div>
        <textarea
          rows={4}
          value={errorInput}
          onChange={e => setErrorInput(e.target.value)}
          placeholder="Ejemplo: TypeError: Cannot read properties of undefined (reading 'map') at src/components/Dashboard.tsx:42:15..."
          className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 font-mono text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3]"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!errorInput.trim()}
            className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            Diagnosticar Error
          </button>
        </div>
      </form>

      {/* Diagnosis Output Card */}
      {errorDiagnosis && (
        <div className="p-5 rounded-2xl bg-[#17171c]/90 border border-emerald-500/40 space-y-4 backdrop-blur-md shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Diagnóstico de Causa Raíz</div>
            <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono text-neutral-300">{errorDiagnosis.affectedFile}</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 font-mono text-xs text-neutral-200 space-y-1">
            <div className="font-bold text-white">{errorDiagnosis.summary}</div>
            <div className="text-neutral-400">{errorDiagnosis.explanation}</div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-bold text-neutral-300">Solución Recomendada:</div>
            <div className="p-3 rounded-xl bg-black/40 font-mono text-xs text-sky-300 whitespace-pre-wrap">
              {errorDiagnosis.recommendedFix}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => onOpenFileInViewer(`${currentWorkspace}/${errorDiagnosis.affectedFile}`)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Abrir Archivo en Visor
            </button>
            <button
              onClick={() => onSendPrompt(undefined, `Arregla este error en ${errorDiagnosis.affectedFile}:\n\n${errorInput}`)}
              className="px-4 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Aplicar Arreglo con Agente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
