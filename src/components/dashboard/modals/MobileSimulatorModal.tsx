import React, { useState } from 'react';
import { sounds } from '../../../utils/soundEffects';

interface MobileSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulatorUrl: string;
  setSimulatorUrl: (url: string) => void;
  onRunCommand: (cmd: string) => void;
  onAuditMobileUI: (device: string, orientation: string) => void;
}

export const MobileSimulatorModal: React.FC<MobileSimulatorModalProps> = ({
  isOpen,
  onClose,
  simulatorUrl,
  setSimulatorUrl,
  onRunCommand,
  onAuditMobileUI,
}) => {
  const [device, setDevice] = useState<'iphone-16' | 'pixel-8' | 'ipad'>('iphone-16');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [iframeKey, setIframeKey] = useState<number>(1);

  if (!isOpen) return null;

  const handleDeviceChange = (dev: 'iphone-16' | 'pixel-8' | 'ipad') => {
    setDevice(dev);
    sounds.playHoverTick();
  };

  const handleOrientationToggle = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
    sounds.playHoverTick();
  };

  const handleReloadFrame = () => {
    setIframeKey(k => k + 1);
    sounds.playHoverTick();
  };

  const handleAudit = () => {
    const spec = device === 'iphone-16' ? 'iPhone 16 Pro (393x852)' : device === 'pixel-8' ? 'Google Pixel 8 (412x915)' : 'iPad Mini (744x1133)';
    onAuditMobileUI(spec, orientation);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#15151b] border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] max-w-4xl w-full p-5 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Simulador Móvil & Inspector Expo</h3>
              <p className="text-[11px] text-neutral-400">Previsualiza y permite que los agentes de IA auditen tu UI móvil en vivo.</p>
            </div>
          </div>

          {/* Device Selector & Rotation */}
          <div className="flex items-center gap-2">
            <div className="flex bg-black/50 p-0.5 rounded-xl border border-white/10 text-xs font-mono">
              <button
                onClick={() => handleDeviceChange('iphone-16')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${device === 'iphone-16' ? 'bg-[#0071e3] text-white font-bold' : 'text-neutral-400 hover:text-white'}`}
              >
                iPhone 16 Pro
              </button>
              <button
                onClick={() => handleDeviceChange('pixel-8')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${device === 'pixel-8' ? 'bg-[#0071e3] text-white font-bold' : 'text-neutral-400 hover:text-white'}`}
              >
                Pixel 8
              </button>
              <button
                onClick={() => handleDeviceChange('ipad')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${device === 'ipad' ? 'bg-[#0071e3] text-white font-bold' : 'text-neutral-400 hover:text-white'}`}
              >
                iPad Mini
              </button>
            </div>

            <button
              onClick={handleOrientationToggle}
              title="Rotar Orientación"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 text-neutral-400 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* URL Input Bar & Action Triggers */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-white">
            <span className="text-neutral-500 font-bold">URL:</span>
            <input
              type="text"
              value={simulatorUrl}
              onChange={e => setSimulatorUrl(e.target.value)}
              placeholder="http://localhost:8081 o http://localhost:5173"
              className="flex-1 bg-transparent focus:outline-none text-neutral-200"
            />
            <button
              onClick={handleReloadFrame}
              title="Recargar frame"
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-neutral-300 transition-colors cursor-pointer"
            >
              Recargar
            </button>
          </div>

          {/* Iniciar Expo / Metro */}
          <button
            onClick={() => onRunCommand('npx expo start --web || npm run dev')}
            className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Iniciar Expo/Metro</span>
          </button>

          {/* Botón Auditar con IA */}
          <button
            onClick={handleAudit}
            className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span>Auditar UI con IA</span>
          </button>
        </div>

        {/* Mobile Frame Container */}
        <div className="flex-1 flex items-center justify-center p-4 bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
          <div
            className={`relative bg-black rounded-[48px] border-[10px] border-[#2c2c34] shadow-2xl overflow-hidden transition-all duration-300 flex flex-col items-center justify-between ${
              orientation === 'portrait'
                ? device === 'iphone-16' ? 'w-[375px] h-[640px]' : device === 'pixel-8' ? 'w-[390px] h-[640px]' : 'w-[520px] h-[640px]'
                : 'w-[640px] h-[375px]'
            }`}
          >
            {/* iPhone Dynamic Island Notch */}
            {device === 'iphone-16' && orientation === 'portrait' && (
              <div className="absolute top-2.5 z-30 w-24 h-6 rounded-full bg-black flex items-center justify-between px-2 shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/10" />
                <span className="w-2 h-2 rounded-full bg-[#0a192f] border border-blue-500/30" />
              </div>
            )}

            {/* Live Web / Metro Iframe */}
            <iframe
              key={iframeKey}
              src={simulatorUrl}
              title="Mobile App Viewport"
              className="w-full h-full border-0 bg-white"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />

            {/* iOS Home Indicator Bar */}
            {orientation === 'portrait' && (
              <div className="absolute bottom-1.5 w-32 h-1 rounded-full bg-white/40 z-30 pointer-events-none" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
