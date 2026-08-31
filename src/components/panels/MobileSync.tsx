import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Smartphone, QrCode, Wifi,
  Send, Clock, Layers
} from 'lucide-react';
import { GaugeRing } from '../ui/GaugeRing';

export const MobileSync: React.FC = () => {
  const { quotas, sendMessage, isMobileDeviceView, setIsMobileDeviceView } = useApp();
  const [mobileInput, setMobileInput] = useState('');

  const antigravityQuota = quotas.find(q => q.id === 'antigravity') || quotas[0];
  const remainingPercent = 100 - antigravityQuota.usedPercentage;

  const handleMobileSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileInput.trim()) return;
    sendMessage(mobileInput, 'Gemini 3.7 Flash');
    setMobileInput('');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Sync Status */}
      <div className="p-4 rounded-2xl liquid-glass border border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sky-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Companion Móvil & Cloud Sync</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                <Wifi className="w-2.5 h-2.5" /> En vivo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Continúa tus sesiones con el IDE y vigila los tokens desde tu iPhone / Android.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileDeviceView(!isMobileDeviceView)}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/15 transition-all spring-interactive"
        >
          {isMobileDeviceView ? 'Ocultar Simulador Móvil' : 'Simular iPhone en Pantalla'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Pairing QR Code & Instructions */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <div className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-sky-400" />
              <span>Vincular Dispositivo Móvil</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">PWA Nativa</span>
          </div>

          {/* QR Code Graphics */}
          <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center shadow-lg w-fit mx-auto">
            {/* SVG QR Code Simulation */}
            <svg width="140" height="140" viewBox="0 0 100 100" className="text-slate-900">
              <path fill="currentColor" d="M10 10h30v30H10zm5 5v20h20V15zm5 5h10v10H20zm40-10h30v30H60zm5 5v20h20V15zm5 5h10v10H70zM10 60h30v30H10zm5 5v20h20V65zm5 5h10v10H20zm45-5h10v10H65zm15 0h10v10H80zm-15 15h10v10H65zm15 10h10v10H80zm-5-5h10v10H75zM45 10h10v10H45zm0 25h10v10H45zm0 25h10v10H45zm0 25h10v10H45z" />
            </svg>
            <span className="text-[9px] font-mono font-bold text-slate-700 mt-1">
              https://app.sidenotch.local/sync
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>Escanea el QR con la cámara de tu móvil para abrir la Web App PWA.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>Tus tokens de Antigravity y VS Code se sincronizan vía WebSocket local.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>Recibe alertas cuando tu cuota se recupere mientras estás fuera del Mac.</span>
            </div>
          </div>
        </div>

        {/* Right: Embedded Interactive iPhone Companion Preview */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs font-bold text-slate-200 mb-3">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Vista Previa del Companion</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Enlace Activo</span>
          </div>

          {/* iPhone Mock Device */}
          <div className="w-64 h-96 rounded-[36px] bg-slate-950 border-[6px] border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
            {/* Dynamic Island at Top */}
            <div className="w-full pt-2 px-6 flex justify-center bg-slate-950 z-20">
              <div className="w-24 h-5 rounded-full bg-black border border-white/10 flex items-center justify-between px-2 text-[8px] text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-dot" />
                <span className="font-mono text-[8px] text-sky-300 font-bold">{remainingPercent.toFixed(0)}%</span>
                <Clock className="w-2.5 h-2.5 text-slate-400" />
              </div>
            </div>

            {/* Mobile Body Content */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-white">
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <div className="text-[11px] font-bold">SideNotch Mobile</div>
                  <div className="text-[8px] text-slate-400">Antigravity IDE Sync</div>
                </div>
                <div className="text-[9px] font-mono text-sky-400 font-bold">
                  {antigravityQuota.nextRefillTime}
                </div>
              </div>

              {/* Token Pill */}
              <div className="p-2 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase font-bold">Cuota Antigravity</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {(antigravityQuota.totalTokens - antigravityQuota.usedTokens).toLocaleString()} t
                  </span>
                </div>
                <div className="w-6 h-6">
                  <GaugeRing percentage={remainingPercent} size={24} strokeWidth={3} color="#38bdf8" />
                </div>
              </div>

              {/* Chat snippet */}
              <div className="space-y-1.5 pt-1">
                <div className="p-1.5 rounded-lg bg-sky-600/80 text-[9px] leading-tight text-white ml-auto max-w-[85%]">
                  ¿Cuándo se recuperan los tokens?
                </div>
                <div className="p-1.5 rounded-lg bg-white/10 text-[9px] leading-tight text-slate-200 mr-auto max-w-[90%] border border-white/5">
                  A las <strong>{antigravityQuota.nextRefillTime}</strong> recibirás <strong>+{antigravityQuota.refillAmount.toLocaleString()} tokens</strong>.
                </div>
              </div>
            </div>

            {/* Mobile Bottom Input */}
            <form onSubmit={handleMobileSend} className="p-2 bg-slate-900/90 border-t border-white/10 flex items-center gap-1">
              <input
                type="text"
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value)}
                placeholder="Preguntar al IDE..."
                className="flex-1 bg-white/10 rounded-full px-2.5 py-1 text-[10px] text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white"
              >
                <Send className="w-2.5 h-2.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
