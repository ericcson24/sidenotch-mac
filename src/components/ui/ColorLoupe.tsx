import React from 'react';
import type { ColorSample } from '../../types';
import { Copy, Check } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ColorLoupeProps {
  x: number;
  y: number;
  sample: ColorSample;
  onCopy?: () => void;
}

export const ColorLoupe: React.FC<ColorLoupeProps> = ({ x, y, sample, onCopy }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sample.hex);
    sounds.playColorCopy();
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 1500);
  };

  // Adjust loupe position so it doesn't go off-screen
  const loupeX = Math.min(window.innerWidth - 180, Math.max(20, x + 24));
  const loupeY = Math.min(window.innerHeight - 200, Math.max(20, y + 24));

  return (
    <div
      style={{
        left: loupeX,
        top: loupeY,
      }}
      className="fixed z-50 pointer-events-auto rounded-2xl liquid-glass p-3.5 shadow-2xl border border-white/20 w-44 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Loupe Reticle / Pixel Grid Simulator */}
      <div className="relative w-full h-24 rounded-xl overflow-hidden border border-white/20 mb-2.5 flex items-center justify-center pixel-grid" style={{ backgroundColor: sample.hex }}>
        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-5 h-5 border-2 border-white rounded shadow-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow" />
          </div>
        </div>
        {/* Zoom label */}
        <span className="absolute bottom-1 right-1.5 text-[9px] font-mono bg-black/60 px-1 py-0.5 rounded text-white/80">
          8x LOUPE
        </span>
      </div>

      {/* Color Info & Quick Copy */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-white">{sample.hex}</span>
          <button
            onClick={handleCopy}
            title="Copiar HEX"
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        <div className="text-[10px] font-mono text-slate-400">
          RGB: <span className="text-slate-200">{sample.rgb}</span>
        </div>
      </div>
    </div>
  );
};
