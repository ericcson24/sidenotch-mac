import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Pin, Copy, Sparkles, X, Check,
  Square, ArrowUpRight, Type, EyeOff, Highlighter
} from 'lucide-react';
import { ColorLoupe } from '../ui/ColorLoupe';
import { sounds } from '../../utils/soundEffects';

type ToolMode = 'select' | 'rect' | 'arrow' | 'text' | 'blur' | 'highlight';

export const SnipStudio: React.FC = () => {
  const { cancelSnipMode, addSnip, openSidecar, activeColor, setActiveColor } = useApp();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number }>({ x: 100, y: 100 });
  const [snipRect, setSnipRect] = useState<{ x: number; y: number; w: number; h: number } | null>({
    x: Math.max(50, window.innerWidth / 2 - 250),
    y: Math.max(50, window.innerHeight / 2 - 160),
    w: 500,
    h: 320,
  });

  const [activeTool, setActiveTool] = useState<ToolMode>('select');

  // Update mouse position for loupe and sampling
  const handleMouseMove = (e: React.MouseEvent) => {
    setCurrentPos({ x: e.clientX, y: e.clientY });

    // Mock dynamic color sampling based on screen coordinates
    const r = Math.floor((e.clientX / window.innerWidth) * 200 + 40);
    const g = Math.floor((e.clientY / window.innerHeight) * 180 + 60);
    const b = 240;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    setActiveColor({
      hex,
      rgb: `${r}, ${g}, ${b}`,
      hsl: `${Math.floor((e.clientX + e.clientY) % 360)}, 85%, 65%`,
    });

    if (isDrawing && startPos) {
      const x = Math.min(startPos.x, e.clientX);
      const y = Math.min(startPos.y, e.clientY);
      const w = Math.abs(e.clientX - startPos.x);
      const h = Math.abs(e.clientY - startPos.y);
      setSnipRect({ x, y, w, h });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start new crop if clicking on dark backdrop
    if ((e.target as HTMLElement).id === 'snip-backdrop') {
      setIsDrawing(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      setSnipRect({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setStartPos(null);
      // Ensure minimum box size
      if (snipRect && (snipRect.w < 20 || snipRect.h < 20)) {
        setSnipRect({
          x: Math.max(50, window.innerWidth / 2 - 250),
          y: Math.max(50, window.innerHeight / 2 - 160),
          w: 500,
          h: 320,
        });
      }
    }
  };

  const generateSnipDataUrl = (): string => {
    const canvas = document.createElement('canvas');
    const w = snipRect ? Math.max(100, snipRect.w) : 400;
    const h = snipRect ? Math.max(80, snipRect.h) : 260;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create rich simulated screenshot with code and UI
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Add grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 24) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }

      // Add simulated text/code
      ctx.fillStyle = '#38bdf8';
      ctx.font = '14px JetBrains Mono, monospace';
      ctx.fillText('// Antigravity AI — Captured Snippet', 20, 35);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '13px JetBrains Mono, monospace';
      ctx.fillText('const dynamicNotch = new LiquidGlassSidecar({', 20, 65);
      ctx.fillText('  edge: "right",', 40, 90);
      ctx.fillText('  blur: "32px",', 40, 115);
      ctx.fillText('  quotaRadar: true,', 40, 140);
      ctx.fillText('  snipasteAI: true', 40, 165);
      ctx.fillText('});', 20, 190);

      // Glass highlight border
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, w - 4, h - 4);
    }
    return canvas.toDataURL('image/png');
  };

  const handlePin = () => {
    const dataUrl = generateSnipDataUrl();
    addSnip({
      imageDataUrl: dataUrl,
      width: snipRect?.w || 400,
      height: snipRect?.h || 260,
      x: snipRect?.x || 100,
      y: snipRect?.y || 100,
      isPinned: true,
      opacity: 0.95,
      scale: 1,
      ocrText: 'const dynamicNotch = new LiquidGlassSidecar({\n  edge: "right",\n  blur: "32px",\n  quotaRadar: true,\n  snipasteAI: true\n});',
      aiAnalysis: 'Snippet de inicialización de la arquitectura LiquidGlassSidecar.',
    });
    cancelSnipMode();
  };

  const handleCopyToClipboard = () => {
    const dataUrl = generateSnipDataUrl();
    addSnip({
      imageDataUrl: dataUrl,
      width: snipRect?.w || 400,
      height: snipRect?.h || 260,
      x: snipRect?.x || 100,
      y: snipRect?.y || 100,
      isPinned: false,
      opacity: 1,
      scale: 1,
    });
    sounds.playColorCopy();
    cancelSnipMode();
  };

  const handleAskAIWithSnip = () => {
    const dataUrl = generateSnipDataUrl();
    addSnip({
      imageDataUrl: dataUrl,
      width: snipRect?.w || 400,
      height: snipRect?.h || 260,
      x: snipRect?.x || 100,
      y: snipRect?.y || 100,
      isPinned: false,
      opacity: 1,
      scale: 1,
    });
    cancelSnipMode();
    openSidecar('prompts');
  };

  return (
    <div
      id="snip-backdrop"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="fixed inset-0 z-50 bg-black/60 cursor-crosshair select-none flex flex-col justify-between overflow-hidden"
    >
      {/* Active Color Magnifier Loupe */}
      <ColorLoupe x={currentPos.x} y={currentPos.y} sample={activeColor} />

      {/* Top Helper Banner */}
      <div className="p-3 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full liquid-glass border border-white/20 shadow-2xl">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Modo Snipaste AI
          </span>
          <span className="text-xs text-slate-300">
            Arrastra para recortar • Pulsa <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">Esc</kbd> para salir
          </span>
          <button
            onClick={cancelSnipMode}
            className="p-1 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Snip Selection Area */}
      {snipRect && (
        <div
          style={{
            left: snipRect.x,
            top: snipRect.y,
            width: snipRect.w,
            height: snipRect.h,
          }}
          className="absolute border-2 border-sky-400 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] pointer-events-auto"
        >
          {/* Resize Grips */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-sky-500 rounded-sm" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-sky-500 rounded-sm" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-sky-500 rounded-sm" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-sky-500 rounded-sm" />

          {/* Dimension Tag */}
          <div className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-sky-300 border border-white/10">
            {Math.round(snipRect.w)} × {Math.round(snipRect.h)} px
          </div>

          {/* Floating Action Toolbar under Selection (Snipaste Toolbar) */}
          <div className="absolute -bottom-14 left-0 right-0 flex items-center justify-between px-3 py-2 rounded-xl liquid-glass border border-white/20 shadow-2xl gap-2 z-50">
            {/* Annotation Tools */}
            <div className="flex items-center gap-1 border-r border-white/10 pr-2">
              <button
                onClick={() => setActiveTool('rect')}
                title="Rectángulo"
                className={`p-1.5 rounded-lg transition-colors ${activeTool === 'rect' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTool('arrow')}
                title="Flecha"
                className={`p-1.5 rounded-lg transition-colors ${activeTool === 'arrow' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTool('highlight')}
                title="Resaltador"
                className={`p-1.5 rounded-lg transition-colors ${activeTool === 'highlight' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Highlighter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTool('blur')}
                title="Pixelar / Desenfoque de privacidad"
                className={`p-1.5 rounded-lg transition-colors ${activeTool === 'blur' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <EyeOff className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTool('text')}
                title="Texto"
                className={`p-1.5 rounded-lg transition-colors ${activeTool === 'text' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Type className="w-4 h-4" />
              </button>
            </div>

            {/* Actions: Pin, Copy, AI, Confirm */}
            <div className="flex items-center gap-2">
              {/* Pin to Screen (F3 Snipaste style) */}
              <button
                onClick={handlePin}
                title="Fijar en pantalla flotante (Pin F3)"
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 border border-white/15 transition-all spring-interactive"
              >
                <Pin className="w-3.5 h-3.5 text-sky-400" />
                <span>Pin (F3)</span>
              </button>

              {/* Ask Antigravity AI / OCR */}
              <button
                onClick={handleAskAIWithSnip}
                title="Enviar a Antigravity AI para OCR y análisis"
                className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-500/30 to-purple-500/30 hover:from-sky-500/40 hover:to-purple-500/40 text-xs font-semibold text-white flex items-center gap-1.5 border border-sky-500/40 transition-all spring-interactive"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                <span>Analizar con IA</span>
              </button>

              {/* Copy */}
              <button
                onClick={handleCopyToClipboard}
                title="Copiar al portapapeles"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>

              {/* Confirm / Close */}
              <button
                onClick={handleCopyToClipboard}
                title="Guardar"
                className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
