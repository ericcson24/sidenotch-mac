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
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Models & Usage</h1>
            <button
              onClick={() => { onRefreshQuotas(); sounds.playHoverTick(); }}
              title="Refrescar datos de cuota"
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">Manage your model quota and credits.</p>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sincronizacion en Vivo</span>
        </div>
      </div>

      {/* 1. Plan Card */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Plan</div>
        <div className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] flex items-center justify-between shadow-lg backdrop-blur-md">
          <div>
            <div className="text-sm font-semibold text-white">Your Plan: {realQuotas.plan}</div>
            <div className="text-xs text-neutral-400 mt-0.5">You can upgrade to a Google AI Ultra plan to receive higher rate limits.</div>
          </div>
          <button className="px-4 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer transition-all">
            Upgrade
          </button>
        </div>
      </div>

      {/* 2. Model Credits Card */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Model Credits</div>
        <div className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Enable AI Credit Overages</div>
              <div className="text-xs text-neutral-400 mt-0.5 max-w-md">
                When toggled on, Antigravity IDE will use your AI credits to fulfill model requests once you're out of model quota.
              </div>
            </div>
            <div className="w-11 h-6 rounded-full bg-[#0071e3] p-0.5 flex items-center justify-end cursor-pointer shadow-inner">
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <div className="text-sm font-semibold text-white">
              Available AI Credits: <span className="font-mono text-emerald-400">{realQuotas.credits}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 text-xs font-medium border border-white/10 transition-colors cursor-pointer">
                See Activity
              </button>
              <button className="px-3.5 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer transition-all">
                Get More AI Credits
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Gemini Models Card */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>Gemini Models</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <div className="text-sm font-semibold text-white">Weekly Limit Remaining</div>
              <div className="text-xs text-neutral-400 mt-0.5">{realQuotas.geminiWeeklyText}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-amber-400 font-mono">{realQuotas.geminiWeekly}%</span>
              <MetricRing percent={realQuotas.geminiWeekly} color="#ff9f0a" size={34} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Five Hour Limit Remaining</div>
              <div className="text-xs text-neutral-400 mt-0.5">{realQuotas.geminiFiveHourText}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#30d158] font-mono">{realQuotas.geminiFiveHour}%</span>
              <MetricRing percent={realQuotas.geminiFiveHour} color="#30d158" size={34} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Claude and GPT models Card */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>Claude and GPT models</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <div className="text-sm font-semibold text-white">Weekly Limit Remaining</div>
              <div className="text-xs text-neutral-400 mt-0.5">Modelos externos compartidos con cuota Antigravity.</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#30d158] font-mono">{realQuotas.claudeWeekly}%</span>
              <MetricRing percent={realQuotas.claudeWeekly} color="#30d158" size={34} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Five Hour Limit Remaining</div>
              <div className="text-xs text-neutral-400 mt-0.5">Recarga de sesión fluida de 5 horas.</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#30d158] font-mono">{realQuotas.claudeFiveHour}%</span>
              <MetricRing percent={realQuotas.claudeFiveHour} color="#30d158" size={34} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
