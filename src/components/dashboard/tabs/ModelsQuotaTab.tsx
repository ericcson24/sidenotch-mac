import React from 'react';
import type { RealQuotasState } from '../../../types/dashboard';
import { MetricRing } from '../ui/MetricRing';
import { sounds } from '../../../utils/soundEffects';

interface ModelsQuotaTabProps {
  realQuotas: RealQuotasState;
  onRefreshQuotas: () => void;
}

export const ModelsQuotaTab: React.FC<ModelsQuotaTabProps> = ({
  realQuotas,
  onRefreshQuotas,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Cuotas & Modelos de IA</h1>
            <button
              onClick={() => { onRefreshQuotas(); sounds.playHoverTick(); }}
              title="Refrescar datos en vivo"
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">Controla tu consumo de créditos y límites semanales en tiempo real.</p>
        </div>

        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sincronización en vivo</span>
        </div>
      </div>

      {/* 1. Plan & Credits Overview Card */}
      <div className="p-5 rounded-2xl bg-[#13141c] border border-white/[0.08] flex items-center justify-between shadow-xl">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Tu Plan Activo</div>
          <div className="text-base font-bold text-white flex items-center gap-2">
            <span>{realQuotas.plan}</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[11px] font-mono">Pro</span>
          </div>
          <div className="text-xs text-neutral-400">
            Créditos disponibles: <span className="font-mono text-emerald-400 font-bold">{realQuotas.credits.toLocaleString()} créditos</span>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer transition-all">
          Añadir Créditos
        </button>
      </div>

      {/* 2. Gemini 3.7 Pro Card */}
      <div className="p-5 rounded-2xl bg-[#13141c] border border-white/[0.08] space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#D4FF00]" />
            <h3 className="text-sm font-bold text-white">Google Gemini 3.7 Pro</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">{realQuotas.geminiFiveHour}% disponible</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white">Límite de 5 Horas</div>
              <div className="text-[11px] text-neutral-400 font-mono">{realQuotas.geminiFiveHourText}</div>
            </div>
            <MetricRing percent={realQuotas.geminiFiveHour} color="#30d158" size={38} />
          </div>

          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white">Límite Semanal</div>
              <div className="text-[11px] text-neutral-400 font-mono">{realQuotas.geminiWeeklyText}</div>
            </div>
            <MetricRing percent={realQuotas.geminiWeekly} color="#ff9f0a" size={38} />
          </div>
        </div>
      </div>

      {/* 3. Anthropic Claude & OpenAI GPT Card */}
      <div className="p-5 rounded-2xl bg-[#13141c] border border-white/[0.08] space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#FF6B4A]" />
            <h3 className="text-sm font-bold text-white">Anthropic Claude & OpenAI GPT</h3>
          </div>
          <span className="text-xs font-mono text-sky-400 font-semibold">Integrados</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white">Claude 3.7 Sonnet</div>
              <div className="text-[11px] text-neutral-400">Cuota compartida con Google AI Pro</div>
            </div>
            <MetricRing percent={realQuotas.claudeFiveHour} color="#FF6B4A" size={38} />
          </div>

          <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white">OpenAI GPT-4o</div>
              <div className="text-[11px] text-neutral-400">Cuota compartida con Google AI Pro</div>
            </div>
            <MetricRing percent={realQuotas.gptFiveHour} color="#10A37F" size={38} />
          </div>
        </div>
      </div>
    </div>
  );
};
