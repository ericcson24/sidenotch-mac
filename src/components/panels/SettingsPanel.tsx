import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Volume2, VolumeX, Keyboard,
  Monitor, Bell, Sparkles, Check
} from 'lucide-react';
import type { DockPosition } from '../../types';

export const SettingsPanel: React.FC = () => {
  const { 
    dockPosition, 
    setDockPosition, 
    soundEnabled, 
    toggleSound
  } = useApp();

  return (
    <div className="space-y-4">
      {/* Dock Position & Trigger Edge */}
      <div className="p-4 rounded-2xl liquid-glass border border-white/15 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Monitor className="w-4 h-4 text-sky-400" />
            <span>Posición del Notch en Pantalla</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Borde de Activación</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(['right', 'left'] as DockPosition[]).map((pos) => {
            const isSelected = dockPosition === pos;
            return (
              <button
                key={pos}
                onClick={() => setDockPosition(pos)}
                className={`
                  p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all spring-interactive
                  ${isSelected
                    ? 'bg-sky-500/20 border-sky-500/50 text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-4 rounded-sm border border-white/40 ${pos === 'right' ? 'ml-auto border-r-2 border-r-sky-400' : 'border-l-2 border-l-sky-400'}`} />
                  <span>Borde {pos === 'right' ? 'Derecho (Recomendado)' : 'Izquierdo'}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-sky-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Haptic Sounds & Alerts */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Bell className="w-4 h-4 text-purple-400" />
            <span>Sonido y Alertas Hápticas de macOS</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/5">
          <div className="text-xs">
            <span className="semibold text-white block">Micro-sonidos hápticos de Liquid Glass</span>
            <span className="text-[11px] text-slate-400">Reproduce sutiles tics y sonidos de obturador al interactuar.</span>
          </div>

          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-white/5 text-slate-500 border-white/10'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Global Hotkeys Guide */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Keyboard className="w-4 h-4 text-amber-400" />
          <span>Atajos de Teclado Globales (Mac & Windows)</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
            <span className="text-slate-300">Abrir / Alternar SideNotch</span>
            <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-sky-300 border border-white/10">
              ⌥ + Space (Alt + Space)
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
            <span className="text-slate-300">Captura Snipaste directa</span>
            <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-purple-300 border border-white/10">
              ⌥ + S (Alt + S)
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
            <span className="text-slate-300">Fijar recorte en pantalla</span>
            <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-emerald-300 border border-white/10">
              F3 / Pin Button
            </kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
            <span className="text-slate-300">Cerrar / Cancelar</span>
            <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-slate-300 border border-white/10">
              Escape
            </kbd>
          </div>
        </div>
      </div>

      {/* Architecture Info */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>SideNotch v1.4.0 • Apple Liquid Glass Engine</span>
        </span>
        <span className="text-emerald-400 font-mono">Build 2026.08</span>
      </div>
    </div>
  );
};
