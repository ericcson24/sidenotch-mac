import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../../utils/soundEffects';

type SettingsTab = 'general' | 'models' | 'snipaste' | 'appearance' | 'about';

interface SavedConfig {
  launchAtLogin: boolean;
  showInDock: boolean;
  autoHide: boolean;
  notchPosition: 'top-right' | 'center-right';
  shutterSound: boolean;
  blurIntensity: number;
  autoRefillAlerts: boolean;
}

const DEFAULT_CONFIG: SavedConfig = {
  launchAtLogin: true,
  showInDock: true,
  autoHide: true,
  notchPosition: 'top-right',
  shutterSound: true,
  blurIntensity: 85,
  autoRefillAlerts: true,
};

export const NativeMacSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Settings State loaded from disk & fallback to localStorage
  const [config, setConfig] = useState<SavedConfig>(() => {
    try {
      const stored = localStorage.getItem('sidenotch-config');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
          const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string) => Promise<SavedConfig> } } }).require('electron');
          if (electron && electron.ipcRenderer) {
            const diskSettings = await electron.ipcRenderer.invoke('get-settings');
            if (diskSettings) {
              setConfig(diskSettings);
              localStorage.setItem('sidenotch-config', JSON.stringify(diskSettings));
              return;
            }
          }
        }
      } catch (err) {
        console.error('Error loading settings from disk:', err);
      }
      try {
        const stored = localStorage.getItem('sidenotch-config');
        if (stored) setConfig(JSON.parse(stored));
      } catch {
        // fallback
      }
    };
    loadSettings();
  }, []);

  const handleSave = () => {
    sounds.playIslandExpand();
    try {
      localStorage.setItem('sidenotch-config', JSON.stringify(config));
      if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { send: (channel: string, data: unknown) => void } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          electron.ipcRenderer.send('save-settings', config);
        }
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2400);
  };

  return (
    <div className="w-screen h-screen bg-[#10121a]/95 backdrop-blur-3xl text-slate-100 font-sans flex flex-col select-none overflow-hidden border border-white/10 shadow-2xl">
      {/* Top Title Bar with macOS HiddenInset Traffic Light Spacing */}
      <div className="h-12 w-full flex items-center justify-between px-4 border-b border-white/10 shrink-0 [-webkit-app-region:drag]">
        <div className="w-20 [-webkit-app-region:no-drag]" />

        <div className="text-[13px] font-semibold text-slate-300 tracking-tight flex items-center gap-1.5">
          <span className="text-white">SideNotch</span>
          <span className="text-slate-500 font-normal">/</span>
          <span className="text-slate-400 capitalize">{activeTab}</span>
        </div>

        <div className="w-28 flex justify-end items-center gap-2 [-webkit-app-region:no-drag]">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-400 border border-white/10">
            macOS
          </span>
        </div>
      </div>

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-52 border-r border-white/10 p-3 flex flex-col gap-1 shrink-0 bg-white/[0.02]">
          <button
            onClick={() => setActiveTab('general')}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer
              ${activeTab === 'general' ? 'bg-sky-500/20 text-sky-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-sky-400/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
            `}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>General</span>
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer
              ${activeTab === 'models' ? 'bg-sky-500/20 text-sky-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-sky-400/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
            `}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Modelos & Cuotas</span>
          </button>

          <button
            onClick={() => setActiveTab('snipaste')}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer
              ${activeTab === 'snipaste' ? 'bg-sky-500/20 text-sky-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-sky-400/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
            `}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>Snipaste (Captura)</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer
              ${activeTab === 'appearance' ? 'bg-sky-500/20 text-sky-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-sky-400/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
            `}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 0 0 20z" />
            </svg>
            <span>Aspecto</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer
              ${activeTab === 'about' ? 'bg-sky-500/20 text-sky-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-sky-400/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
            `}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Acerca de</span>
          </button>

          <div className="mt-auto pt-3 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={handleSave}
              className="w-full py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              {isSaved ? (
                <span className="flex items-center gap-1 text-white">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  ¡Ajustes Guardados!
                </span>
              ) : (
                <span>Guardar Ajustes</span>
              )}
            </button>
          </div>
        </div>

        {/* Right Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* A. GENERAL TAB */}
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Preferencias Generales</h2>
                <p className="text-xs text-slate-400">Configura el comportamiento del SideNotch en tu escritorio de macOS.</p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 space-y-4">
                {/* Toggle: Launch at Login */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Iniciar al encender el Mac</div>
                    <div className="text-[11px] text-slate-400">Abre SideNotch en segundo plano al iniciar sesión en macOS.</div>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, launchAtLogin: !prev.launchAtLogin }))}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${config.launchAtLogin ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${config.launchAtLogin ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="h-[1px] bg-white/10" />

                {/* Toggle: Show in Dock */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Mostrar icono en el Dock de macOS</div>
                    <div className="text-[11px] text-slate-400">Mantiene el icono de SideNotch visible en el Dock para acceso rápido.</div>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, showInDock: !prev.showInDock }))}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${config.showInDock ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${config.showInDock ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="h-[1px] bg-white/10" />

                {/* Toggle: Auto Hide */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Auto-ocultar al alejar el cursor</div>
                    <div className="text-[11px] text-slate-400">Cierra la tarjeta emergente automáticamente cuando sales del notch.</div>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, autoHide: !prev.autoHide }))}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${config.autoHide ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${config.autoHide ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="h-[1px] bg-white/10" />

                {/* Notch Position Radio */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Posición del Notch en Pantalla</div>
                    <div className="text-[11px] text-slate-400">Elige la ubicación en el borde derecho de tu monitor.</div>
                  </div>
                  <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, notchPosition: 'top-right' }))}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${config.notchPosition === 'top-right' ? 'bg-white/20 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      Arriba a la derecha
                    </button>
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, notchPosition: 'center-right' }))}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${config.notchPosition === 'center-right' ? 'bg-white/20 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      Centro derecho
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* B. MODELS & QUOTAS TAB */}
          {activeTab === 'models' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Modelos de IA & Cuotas</h2>
                <p className="text-xs text-slate-400">Sincronización en vivo con tus cuentas y entornos de desarrollo.</p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 space-y-4">
                {/* Antigravity IDE Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-900 border border-white/20 flex items-center justify-center text-white font-bold shadow-md">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3L3.5 19.5H7.8L12 11.2L16.2 19.5H20.5L12 3Z" fill="white" />
                        <circle cx="12" cy="15.8" r="1.8" fill="#30D158" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Antigravity IDE (Google AI Pro · Gemini 3.7)</div>
                      <div className="text-[11px] text-slate-400">Conexión local LanguageServer RPC activa</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    2,016 Créditos
                  </span>
                </div>

                <div className="h-[1px] bg-white/10" />

                {/* Claude Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#1c1c1e] border border-white/10 flex items-center justify-center text-white font-bold">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2.2] stroke-linecap-round">
                        <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
                        <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Claude Usage</div>
                      <div className="text-[11px] text-slate-400">Seguimiento de sesión móvil de 5 horas y cuota semanal.</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sincronizado
                  </span>
                </div>

                <div className="h-[1px] bg-white/10" />

                {/* Toggle: Notifications */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-xs font-semibold text-white">Notificar al alcanzar el 80% o 100% de cuota</div>
                    <div className="text-[11px] text-slate-400">Emite una notificación nativa de macOS cuando un modelo esté a punto de agotarse.</div>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, autoRefillAlerts: !prev.autoRefillAlerts }))}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${config.autoRefillAlerts ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${config.autoRefillAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* C. SNIPASTE TAB */}
          {activeTab === 'snipaste' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Captura de Pantalla (Snipaste)</h2>
                <p className="text-xs text-slate-400">Recorte de precisión con copia directa al portapapeles de macOS.</p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Atajo Global de Teclado</div>
                    <div className="text-[11px] text-slate-400">Pulsa la combinación de teclas para iniciar el recorte en cualquier app.</div>
                  </div>
                  <kbd className="px-3 py-1.5 rounded-xl bg-black/60 text-sky-300 font-mono text-xs border border-white/15 shadow">
                    Option + S
                  </kbd>
                </div>

                <div className="h-[1px] bg-white/10" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Sonido de obturador al capturar</div>
                    <div className="text-[11px] text-slate-400">Reproduce el sonido clásico de cámara de Apple al completar el recorte.</div>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, shutterSound: !prev.shutterSound }))}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${config.shutterSound ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${config.shutterSound ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* D. APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Aspecto & Liquid Glass</h2>
                <p className="text-xs text-slate-400">Personaliza la estética translúcida y las curvas del notch.</p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white">Intensidad del Desenfoque (Frosted Blur)</span>
                    <span className="text-xs font-mono text-slate-300">{config.blurIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={config.blurIntensity}
                    onChange={(e) => setConfig(t => ({ ...t, blurIntensity: Number(e.target.value) }))}
                    className="w-full accent-sky-400 h-1.5 rounded-full bg-slate-700 cursor-pointer"
                  />
                </div>

                <div className="h-[1px] bg-white/10" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Estilo del Notch</div>
                    <div className="text-[11px] text-slate-400">OLED Jet Black con bordes hiperdefinidos de Apple.</div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-black text-white text-xs font-medium border border-white/20">
                    OLED Pure Black
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* E. ABOUT TAB */}
          {activeTab === 'about' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 flex items-center justify-center text-2xl shadow-xl">
                  
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">SideNotch for Mac</h3>
                  <p className="text-xs text-slate-400">Versión 2.0.0 (Build 2026.08)</p>
                  <p className="text-[11px] text-emerald-400 font-mono mt-0.5">Optimizado para Apple Silicon</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
