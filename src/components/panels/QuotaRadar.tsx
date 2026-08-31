import React from 'react';
import { useApp } from '../../context/AppContext';
import { GaugeRing } from '../ui/GaugeRing';
import { TokenTimer } from '../ui/TokenTimer';
import { LiquidCard } from '../ui/LiquidCard';
import { 
  Zap, ShieldAlert, Sparkles, TrendingUp,
  Cpu, Layers
} from 'lucide-react';
import type { LLMQuota } from '../../types';

export const QuotaRadar: React.FC = () => {
  const { quotas, selectedQuotaId, setSelectedQuotaId, refillQuota, consumeTokens } = useApp();
  const currentQuota = quotas.find(q => q.id === selectedQuotaId) || quotas[0];

  const remainingTokens = currentQuota.totalTokens - currentQuota.usedTokens;
  const remainingPercent = 100 - currentQuota.usedPercentage;

  return (
    <div className="space-y-4">
      {/* Top Model Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {quotas.map((q: LLMQuota) => {
          const isSelected = q.id === selectedQuotaId;
          const isWarning = q.status === 'warning' || q.status === 'critical';

          return (
            <button
              key={q.id}
              onClick={() => setSelectedQuotaId(q.id)}
              className={`
                p-2.5 rounded-xl text-left border transition-all spring-interactive relative overflow-hidden
                ${isSelected
                  ? 'bg-white/10 border-white/30 shadow-lg'
                  : 'bg-black/30 border-white/5 hover:bg-white/5 hover:border-white/15'}
              `}
            >
              {isSelected && (
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: q.accentColor }}
                />
              )}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-white truncate">{q.name}</span>
                {isWarning && <ShieldAlert className="w-3 h-3 text-amber-400" />}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-mono">{(100 - q.usedPercentage).toFixed(0)}% disp.</span>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: q.accentColor }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Quota Hero Card */}
      <LiquidCard glowColor={currentQuota.glowColor} className="p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Circular Activity Gauge */}
          <div className="flex items-center gap-5">
            <GaugeRing
              percentage={remainingPercent}
              color={currentQuota.accentColor}
              glowColor={currentQuota.glowColor}
              size={120}
              strokeWidth={10}
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
                  {remainingPercent.toFixed(0)}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                  DISPONIBLE
                </span>
              </div>
            </GaugeRing>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{currentQuota.name}</h3>
                {currentQuota.isActiveInIDE && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium">
                    IDE Vinculado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentQuota.model}</p>

              <div className="flex items-center gap-4 mt-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Restante</span>
                  <span className="font-mono font-bold text-white">
                    {remainingTokens.toLocaleString()} <span className="text-[10px] text-slate-400">/ {currentQuota.totalTokens.toLocaleString()}</span>
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-white/10" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Quema / hora</span>
                  <span className="font-mono font-bold text-amber-300">
                    ~{currentQuota.burnRatePerHour.toLocaleString()} t/h
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Simulation Actions */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button
              onClick={() => consumeTokens(currentQuota.id, 5000)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all spring-interactive"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simular Prompt (-5k tokens)</span>
            </button>
            <button
              onClick={() => refillQuota(currentQuota.id)}
              className="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-semibold text-sky-300 flex items-center justify-center gap-2 transition-all spring-interactive"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Forzar Recarga Completa</span>
            </button>
          </div>
        </div>
      </LiquidCard>

      {/* Countdown Timer Component */}
      <TokenTimer
        resetInMinutes={currentQuota.resetInMinutes}
        refillTime={currentQuota.nextRefillTime}
        refillAmount={currentQuota.refillAmount}
        onManualRefill={() => refillQuota(currentQuota.id)}
        accentColor={currentQuota.accentColor}
      />

      {/* Consumption Timeline / Burn Analytics */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>Ritmo de Consumo Hoy</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {currentQuota.requestsToday} peticiones registradas
          </span>
        </div>

        {/* Dynamic Bar Chart */}
        <div className="flex items-end justify-between gap-3 h-24 pt-4 px-2 border-b border-white/5">
          {currentQuota.history.map((point: { time: string; tokens: number }, idx: number) => {
            const max = Math.max(...currentQuota.history.map((p: { tokens: number }) => p.tokens));
            const heightPercent = max > 0 ? (point.tokens / max) * 100 : 20;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(point.tokens / 1000).toFixed(0)}k
                </div>
                <div
                  className="w-full rounded-t-lg transition-all duration-500 relative overflow-hidden group-hover:brightness-125"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: currentQuota.accentColor,
                    opacity: 0.75 + idx * 0.08,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{point.time}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-500" />
            Plan: {currentQuota.tier}
          </span>
          <span className="text-emerald-400 font-medium">✓ Sincronizado con IDE</span>
        </div>
      </div>

      {/* Smart Model Advisor Alert */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-transparent border border-sky-500/20 flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 mt-0.5">
          <Cpu className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <span className="font-bold text-white block">Recomendación de Antigravity AI:</span>
          <p className="text-slate-300 mt-0.5 leading-relaxed">
            Tu cuota de <strong>Gemini 3.7 Flash</strong> te permite ~1,200 consultas ligeras adicionales. Para tareas de razonamiento profundo o refactorización masiva, alterna a <strong>Claude 3.7 Sonnet</strong> cuando se active la recarga de las {currentQuota.nextRefillTime}.
          </p>
        </div>
      </div>
    </div>
  );
};
