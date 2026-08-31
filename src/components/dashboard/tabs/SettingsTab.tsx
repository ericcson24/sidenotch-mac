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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Preferencias & Ajustes</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Configura el comportamiento del Notch lateral y el inicio automático.</p>
        </div>
        {isSaved && (
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Guardado automático
          </span>
        )}
      </div>

      {/* Group 1: General Options */}
      <div className="p-5 rounded-2xl bg-[#13141c] border border-white/[0.08] space-y-4 shadow-xl">
        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Comportamiento General</div>

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

        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-xs font-semibold text-white">Sonidos Hápticos de Cristal</div>
            <div className="text-[11px] text-neutral-400">Reproduce sutiles efectos de audio al interactuar con el Notch.</div>
          </div>
          <button
            onClick={() => onUpdateConfig({ ...config, shutterSound: !config.shutterSound })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              config.shutterSound ? 'bg-[#0071e3]' : 'bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.shutterSound ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Group 2: Notch Position */}
      <div className="p-5 rounded-2xl bg-[#13141c] border border-white/[0.08] space-y-4 shadow-xl">
        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Ubicación del Notch en Pantalla</div>

        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-xs font-semibold text-white">Posición lateral</div>
            <div className="text-[11px] text-neutral-400">Borde derecho de tu pantalla donde anclar el Notch.</div>
          </div>
          <div className="flex rounded-xl bg-black/40 p-1 border border-white/10 text-xs">
            <button
              onClick={() => onUpdateConfig({ ...config, notchPosition: 'top-right' })}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                config.notchPosition === 'top-right' ? 'bg-[#0071e3] text-white font-bold shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Superior derecho
            </button>
            <button
              onClick={() => onUpdateConfig({ ...config, notchPosition: 'center-right' })}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                config.notchPosition === 'center-right' ? 'bg-[#0071e3] text-white font-bold shadow' : 'text-neutral-400 hover:text-white'
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
