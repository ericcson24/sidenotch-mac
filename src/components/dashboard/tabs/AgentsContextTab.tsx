import React, { useState } from 'react';
import type { WorkspaceContextData } from '../../../types/dashboard';
import { sounds } from '../../../utils/soundEffects';

interface AgentsContextTabProps {
  workspaceContext: WorkspaceContextData | null;
  onCreateRule: (e: React.FormEvent, name: string, content: string) => void;
}

export const AgentsContextTab: React.FC<AgentsContextTabProps> = ({
  workspaceContext,
  onCreateRule,
}) => {
  const [isCreatingRule, setIsCreatingRule] = useState<boolean>(false);
  const [newRuleName, setNewRuleName] = useState<string>('');
  const [newRuleContent, setNewRuleContent] = useState<string>('');

  const handleRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;
    onCreateRule(e, newRuleName.trim(), newRuleContent.trim());
    setIsCreatingRule(false);
    setNewRuleName('');
    setNewRuleContent('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Gestion de Contexto & Customizaciones (.agents)</h2>
          <p className="text-xs text-neutral-400">Reglas, habilidades y conocimientos precargados en tu proyecto para los agentes.</p>
        </div>
        <button
          onClick={() => { setIsCreatingRule(true); sounds.playHoverTick(); }}
          className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer transition-all"
        >
          + Nueva Regla .agents
        </button>
      </div>

      {/* Modal Crear Regla */}
      {isCreatingRule && (
        <form onSubmit={handleRuleSubmit} className="p-4 rounded-2xl bg-[#1c1c24] border border-[#0071e3] space-y-3 shadow-2xl animate-in fade-in">
          <div className="text-xs font-bold text-white">Crear Nueva Regla en .agents/rules/</div>
          <input
            type="text"
            value={newRuleName}
            onChange={e => setNewRuleName(e.target.value)}
            placeholder="nombre-regla.md (ej: clean-code.md)"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
          />
          <textarea
            rows={3}
            value={newRuleContent}
            onChange={e => setNewRuleContent(e.target.value)}
            placeholder="Directivas para los agentes (ej: Usar siempre TypeScript estricto sin tipo any)..."
            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingRule(false)}
              className="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-neutral-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#0071e3] text-xs font-bold text-white cursor-pointer"
            >
              Guardar Regla
            </button>
          </div>
        </form>
      )}

      {/* Rules List */}
      <div className="p-5 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-3 backdrop-blur-md shadow-xl">
        <div className="text-xs font-bold text-white uppercase tracking-wider">Reglas Activas en este Workspace</div>
        {workspaceContext?.agentsCustomizations?.rules && workspaceContext.agentsCustomizations.rules.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {workspaceContext.agentsCustomizations.rules.map((rule, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-black/30 border border-white/[0.06] space-y-1">
                <div className="text-xs font-bold text-sky-400 font-mono flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>{rule.name}</span>
                </div>
                <div className="text-[11px] text-neutral-400 line-clamp-2">{rule.preview}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-xs text-neutral-400">
            No se han encontrado archivos en `.agents/rules/`. Pulsa "+ Nueva Regla" para añadir directivas de desarrollo a tus agentes.
          </div>
        )}
      </div>

      {/* Skills List */}
      <div className="p-5 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-3 backdrop-blur-md shadow-xl">
        <div className="text-xs font-bold text-white uppercase tracking-wider">Habilidades Especializadas (Skills)</div>
        {workspaceContext?.agentsCustomizations?.skills && workspaceContext.agentsCustomizations.skills.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {workspaceContext.agentsCustomizations.skills.map((skill, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-black/30 border border-white/[0.06] space-y-1">
                <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>{skill.name}</span>
                </div>
                <div className="text-[11px] text-neutral-400">{skill.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-xs text-neutral-400">
            Directorio `.agents/skills/` listo para cargar flujos de trabajo personalizados.
          </div>
        )}
      </div>
    </div>
  );
};
