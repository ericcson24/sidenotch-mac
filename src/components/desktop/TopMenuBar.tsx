import React, { useState, useEffect } from 'react';
import { useApp, WALLPAPERS } from '../../context/AppContext';
import { 
  Apple, Wifi, BatteryCharging, Sparkles, 
  Image, Scissors
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const TopMenuBar: React.FC = () => {
  const { 
    openSidecar, 
    startSnipMode, 
    wallpaper, 
    setWallpaper, 
    quotas, 
    activeWorkspace 
  } = useApp();

  const [timeStr, setTimeStr] = useState('');
  const [showWpMenu, setShowWpMenu] = useState(false);

  const antigravityQuota = quotas.find(q => q.id === 'antigravity') || quotas[0];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) +
        '  ' +
        now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-7 w-full bg-slate-950/70 backdrop-blur-xl border-b border-white/10 px-4 flex items-center justify-between text-xs text-slate-200 select-none z-30">
      {/* Left Menu Items (macOS App Bar) */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            sounds.playHoverTick();
            openSidecar('quotas');
          }}
          className="flex items-center gap-1.5 hover:text-white font-bold transition-colors"
        >
          <Apple className="w-3.5 h-3.5" />
          <span className="font-semibold tracking-tight">SideNotch</span>
        </button>

        <span className="text-slate-400 font-medium hidden md:inline">Workspace: <strong className="text-white">{activeWorkspace?.name}</strong></span>

        {/* Wallpaper Menu Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowWpMenu(!showWpMenu)}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            <Image className="w-3 h-3 text-sky-400" />
            <span className="text-[11px]">Fondo</span>
          </button>

          {showWpMenu && (
            <div className="absolute top-8 left-0 w-48 rounded-xl liquid-glass border border-white/20 p-1.5 shadow-2xl space-y-1 z-50">
              <div className="text-[10px] text-slate-400 font-bold px-2 py-1 uppercase">Fondos de Pantalla</div>
              {WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => {
                    setWallpaper(wp.url);
                    setShowWpMenu(false);
                    sounds.playHoverTick();
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    wallpaper === wp.url ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{wp.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Menu Items & Notch Fast Trigger */}
      <div className="flex items-center gap-3.5 text-xs text-slate-300">
        {/* Quick Snipaste button */}
        <button
          onClick={startSnipMode}
          title="Captura Snipaste (⌥S)"
          className="flex items-center gap-1 text-purple-300 hover:text-purple-200 px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors"
        >
          <Scissors className="w-3 h-3" />
          <span className="text-[11px] font-mono font-semibold">Snip</span>
        </button>

        {/* Live Token Status Pill */}
        <button
          onClick={() => openSidecar('quotas')}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-mono text-sky-300 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-sky-400" />
          <span>{(100 - antigravityQuota.usedPercentage).toFixed(0)}% Antigravity</span>
        </button>

        <Wifi className="w-3.5 h-3.5" />
        <BatteryCharging className="w-4 h-4 text-emerald-400" />

        <span className="font-mono text-[11px] text-slate-200">{timeStr}</span>
      </div>
    </header>
  );
};
