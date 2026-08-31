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
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#13141c] border border-white/[0.12] rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] max-w-4xl w-full p-5 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Simulador Móvil iPhone</h3>
              <p className="text-[11px] text-neutral-400">Previsualiza y audita tu interfaz en pantalla pequeña y áreas seguras.</p>
            </div>
          </div>

          {/* Device Selector & Rotation */}
          <div className="flex items-center gap-2">
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-mono">
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
              title="Rotar orientación"
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-neutral-300 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 text-neutral-400 transition-colors cursor-pointer"
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
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-white">
            <span className="text-neutral-500 font-bold">URL:</span>
            <input
              type="text"
              value={simulatorUrl}
              onChange={e => setSimulatorUrl(e.target.value)}
              placeholder="http://localhost:5173 o http://localhost:8081"
              className="flex-1 bg-transparent focus:outline-none text-neutral-200"
            />
            <button
              onClick={handleReloadFrame}
              title="Recargar frame"
              className="px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10.5px] text-neutral-300 transition-colors cursor-pointer"
            >
              Recargar
            </button>
          </div>

          <button
            onClick={() => onRunCommand('npm run dev || npx expo start --web')}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-neutral-200 border border-white/10 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            Iniciar Servidor Local
          </button>

          <button
            onClick={handleAudit}
            className="px-4 py-1.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-xs font-bold text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Auditar UI con IA
          </button>
        </div>

        {/* Viewport Frame with Realistic Bezels */}
        <div className="flex-1 flex items-center justify-center p-4 bg-black/40 rounded-2xl border border-white/[0.06] overflow-auto">
          <div
            className={`transition-all duration-300 bg-black border-[5px] border-[#222430] rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col ${
              device === 'iphone-16'
                ? orientation === 'portrait' ? 'w-[320px] h-[520px]' : 'w-[520px] h-[320px]'
                : device === 'pixel-8'
                ? orientation === 'portrait' ? 'w-[330px] h-[530px]' : 'w-[530px] h-[330px]'
                : orientation === 'portrait' ? 'w-[440px] h-[560px]' : 'w-[560px] h-[440px]'
            }`}
          >
            {/* Dynamic Island on Phone */}
            {orientation === 'portrait' && device === 'iphone-16' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 flex items-center justify-end px-1.5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
              </div>
            )}

            {/* Embedded Web View */}
            <iframe
              key={iframeKey}
              src={simulatorUrl}
              title="Mobile Simulator Viewport"
              className="w-full h-full border-0 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
