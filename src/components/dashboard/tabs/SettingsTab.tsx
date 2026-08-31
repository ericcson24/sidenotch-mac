import React from 'react';
import type { SavedConfig } from '../../../types/dashboard';

interface SettingsTabProps {
  config: SavedConfig;
  isSaved: boolean;
  onUpdateConfig: (newConfig: SavedConfig) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  config,
  isSaved,
  onUpdateConfig,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Preferencias del Notch de macOS</h2>
          <p className="text-xs text-neutral-400">Comportamiento en pantalla y persistencia.</p>
        </div>
        {isSaved && (
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Guardado automatico en disco
          </span>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white">Iniciar al encender el Mac</div>
            <div className="text-[11px] text-neutral-400">Abre SideNotch automaticamente al iniciar sesion.</div>
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

        <div className="h-[1px] bg-white/10" />

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white">Posicion del Notch en Pantalla</div>
            <div className="text-[11px] text-neutral-400">Ubicacion a lo largo del borde derecho de tu monitor.</div>
          </div>
          <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
            <button
              onClick={() => onUpdateConfig({ ...config, notchPosition: 'top-right' })}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                config.notchPosition === 'top-right' ? 'bg-white/20 text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Arriba a la derecha
            </button>
            <button
              onClick={() => onUpdateConfig({ ...config, notchPosition: 'center-right' })}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                config.notchPosition === 'center-right' ? 'bg-white/20 text-white shadow' : 'text-neutral-400 hover:text-white'
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
