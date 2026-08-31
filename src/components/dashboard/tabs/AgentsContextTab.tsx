import React, { useState } from 'react';
import type { WorkspaceContextData } from '../../../types/dashboard';
import { sounds } from '../../../utils/soundEffects';

interface AgentsContextTabProps {
  workspaceContext: WorkspaceContextData | null;
  onCreateRule: (e: React.FormEvent, ruleName: string, content: string) => void;
}

export const AgentsContextTab: React.FC<AgentsContextTabProps> = ({
  workspaceContext,
  onCreateRule,
}) => {
  const [newRuleName, setNewRuleName] = useState<string>('');
  const [newRuleContent, setNewRuleContent] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;
    onCreateRule(e, newRuleName.trim(), newRuleContent.trim());
    setIsCreating(false);
    setNewRuleName('');
    setNewRuleContent('');
  };

  const handleApplyTemplate = (name: string, content: string) => {
    setNewRuleName(name);
    setNewRuleContent(content);
    setIsCreating(true);
    sounds.playHoverTick();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Reglas del Proyecto (.agents)</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configura directivas de arquitectura y directrices para que todos los modelos respeten tus normas.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(prev => !prev);
            sounds.playHoverTick();
          }}
          className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          {isCreating ? 'Cancelar' : '+ Nueva Regla'}
        </button>
      </div>

      {/* Create Rule Form */}
      {isCreating && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#13141c] border border-[#0071e3] space-y-3 shadow-2xl animate-in fade-in">
          <div className="text-xs font-bold text-white uppercase tracking-wider">Crear Nueva Regla (.agents/rules/)</div>
          <input
            type="text"
            value={newRuleName}
            onChange={e => setNewRuleName(e.target.value)}
            placeholder="Nombre de la regla (ej: ESTILO_CODIGO.md)"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3]"
          />
          <textarea
            rows={5}
            value={newRuleContent}
            onChange={e => setNewRuleContent(e.target.value)}
            placeholder="Directivas y requisitos obligatorios para los agentes..."
            className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 font-mono text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0071e3] leading-relaxed"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-neutral-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newRuleName.trim()}
              className="px-5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-40"
            >
              Guardar Regla
            </button>
          </div>
        </form>
      )}

      {/* Quick Rule Starter Presets */}
      {!isCreating && (
        <div className="p-4 rounded-2xl bg-[#13141c] border border-white/[0.08] space-y-2.5 shadow-xl">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Plantillas Rápidas Recomendadas</div>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => handleApplyTemplate(
                'ESTILO_TYPESCRIPT.md',
                '# Convenciones de TypeScript & React\n\n1. Prohibido usar "any", tipar todas las props con interfaces.\n2. Componentes modulares y exportaciones nombradas.\n3. Hooks personalizados en src/hooks/.'
              )}
              className="p-3 rounded-xl bg-black/40 hover:bg-black/60 border border-white/[0.06] hover:border-sky-500/30 transition-all cursor-pointer space-y-1 group"
            >
              <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">✨ Estilo TypeScript & React</div>
              <div className="text-[11px] text-neutral-400 leading-snug">Tipado estricto, interfaces limpias y componentes funcionales.</div>
            </div>

            <div
              onClick={() => handleApplyTemplate(
                'SEGURIDAD_Y_PERFORMANCE.md',
                '# Seguridad & Rendimiento\n\n1. Validar todos los inputs de usuario.\n2. Sanitizar datos antes del renderizado.\n3. Memoizar cálculos pesados con useMemo y useCallback.'
              )}
              className="p-3 rounded-xl bg-black/40 hover:bg-black/60 border border-white/[0.06] hover:border-emerald-500/30 transition-all cursor-pointer space-y-1 group"
            >
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">🛡️ Seguridad & Rendimiento</div>
              <div className="text-[11px] text-neutral-400 leading-snug">Sanitización de entradas, control de excepciones y optimización de memoria.</div>
            </div>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          Reglas Activas ({workspaceContext?.agentsCustomizations?.rules?.length || 0})
        </div>

        {workspaceContext?.agentsCustomizations?.rules && workspaceContext.agentsCustomizations.rules.length > 0 ? (
          workspaceContext.agentsCustomizations.rules.map((rule, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#13141c] border border-white/[0.08] space-y-2 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">{rule.name}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Activa
                </span>
              </div>
              <div className="text-xs text-neutral-300 font-mono bg-black/40 p-3 rounded-xl border border-white/[0.06] whitespace-pre-wrap leading-relaxed">
                {rule.preview}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 rounded-2xl bg-[#13141c] border border-white/[0.08] text-center space-y-2 shadow-xl">
            <div className="text-2xl">📋</div>
            <div className="text-xs font-bold text-white">Sin reglas personalizadas</div>
            <div className="text-xs text-neutral-400 max-w-sm mx-auto">
              Crea tu primera regla o selecciona una plantilla para definir directivas que respetarán todos los modelos.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
