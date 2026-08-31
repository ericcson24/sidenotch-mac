import React from 'react';
import type { SavedConfig, RealQuotasState } from '../../../types/dashboard';
import { MetricRing } from '../ui/MetricRing';

interface SettingsTabProps {
  config: SavedConfig;
  isSaved: boolean;
  onUpdateConfig: (newConfig: SavedConfig) => void;
  realQuotas?: RealQuotasState;
  onRefreshQuotas?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  config,
  isSaved,
  onUpdateConfig,
  realQuotas,
  onRefreshQuotas,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Ajustes & Cuotas</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Control de cuotas de IA y preferencias del Notch de macOS.</p>
        </div>
        {isSaved && (
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Guardado
          </span>
        )}
      </div>

      {/* 1. Live AI Quotas Overview */}
      {realQuotas && (
        <div className="p-5 rounded-2xl bg-[#12131a] border border-white/[0.06] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-white uppercase tracking-wider">Estado de Cuotas de IA</div>
            {onRefreshQuotas && (
              <button
                onClick={onRefreshQuotas}
                className="text-xs text-sky-400 hover:underline cursor-pointer"
              >
                Actualizar
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Gemini */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Gemini 3.7</div>
                <div className="text-[10px] text-neutral-400">Google AI Pro</div>
              </div>
              <MetricRing percent={realQuotas.geminiFiveHour} color="#30d158" size={32} />
            </div>

            {/* Claude */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Claude 3.7</div>
                <div className="text-[10px] text-neutral-400">Anthropic</div>
              </div>
              <MetricRing percent={realQuotas.claudeFiveHour} color="#FF6B4A" size={32} />
            </div>

            {/* GPT */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">GPT-4o</div>
                <div className="text-[10px] text-neutral-400">OpenAI</div>
              </div>
              <MetricRing percent={realQuotas.gptFiveHour} color="#10A37F" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* 2. Notch Preferences */}
      <div className="p-5 rounded-2xl bg-[#12131a] border border-white/[0.06] space-y-4 shadow-xl">
        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Comportamiento del Notch</div>

        {/* Launch at Login */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-xs font-semibold text-white">Iniciar al encender el Mac</div>
            <div className="text-[11px] text-neutral-400">Abre SideNotch automáticamente cada vez que inicies sesión.</div>
          </div>
          <button
            onClick={() => onUpdateConfig({ ...config, launchAtLogin: !config.launchAtLogin })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              config.launchAtLogin ? 'bg-[#0071e3]' : 'bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.launchAtLogin ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="h-[1px] bg-white/[0.06]" />

        {/* Notch Position */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-xs font-semibold text-white">Posición en Pantalla</div>
            <div className="text-[11px] text-neutral-400">Ubicación del Notch en el lateral derecho de tu monitor.</div>
          </div>
          <div className="flex rounded-xl bg-black/40 p-1 border border-white/10 text-xs">
            <button
              onClick={() => onUpdateConfig({ ...config, notchPosition: 'top-right' })}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                config.notchPosition === 'top-right' ? 'bg-[#0071e3] text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Superior derecho
            </button>
            <button
              onClick={() => onUpdateConfig({ ...config, notchPosition: 'center-right' })}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                config.notchPosition === 'center-right' ? 'bg-[#0071e3] text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Centro derecho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
