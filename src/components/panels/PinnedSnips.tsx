import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { SnipItem } from '../../types';
import { PinOff, Sparkles, Copy, Sliders, X, FileText, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { sounds } from '../../utils/soundEffects';

export const PinnedSnips: React.FC = () => {
  const { pinnedSnips, togglePinSnip, removeSnip, updateSnipPosition, updateSnipOpacity, openSidecar, sendMessage } = useApp();
  const [showOcrId, setShowOcrId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (pinnedSnips.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {pinnedSnips.map((snip: SnipItem) => {
        return (
          <motion.div
            key={snip.id}
            drag
            dragMomentum={false}
            onDragEnd={(_, info) => {
              updateSnipPosition(snip.id, snip.x + info.offset.x, snip.y + info.offset.y);
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: snip.opacity, scale: snip.scale, y: 0 }}
            style={{
              left: snip.x,
              top: snip.y,
              width: snip.width,
            }}
            className="
              absolute pointer-events-auto group select-none
              rounded-2xl pin-glass overflow-hidden shadow-2xl
              border border-white/20 hover:border-sky-400/50
              transition-shadow duration-200 cursor-move
            "
          >
            {/* Header bar on Hover */}
            <div className="
              absolute top-0 left-0 right-0 h-8 bg-slate-950/80 backdrop-blur-md
              border-b border-white/10 flex items-center justify-between px-2.5
              opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20
            ">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Snipaste Pin</span>
              </div>

              <div className="flex items-center gap-1">
                {/* OCR Text Viewer Toggle */}
                {snip.ocrText && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOcrId(showOcrId === snip.id ? null : snip.id);
                    }}
                    title="Ver texto OCR extraído"
                    className="p-1 rounded hover:bg-white/20 text-slate-300 hover:text-white"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Ask AI Context */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidecar('prompts');
                    sendMessage('Por favor analiza este fragmento de código capturado y busca posibles optimizaciones:', 'Claude 3.7 Sonnet', snip.imageDataUrl);
                  }}
                  title="Preguntar a Antigravity AI"
                  className="p-1 rounded hover:bg-sky-500/30 text-sky-300 hover:text-sky-100"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>

                {/* Copy Image */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playColorCopy();
                    setCopiedId(snip.id);
                    setTimeout(() => setCopiedId(null), 1500);
                  }}
                  title="Copiar imagen"
                  className="p-1 rounded hover:bg-white/20 text-slate-300 hover:text-white"
                >
                  {copiedId === snip.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Unpin */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePinSnip(snip.id);
                  }}
                  title="Desfijar de pantalla"
                  className="p-1 rounded hover:bg-white/20 text-slate-300 hover:text-white"
                >
                  <PinOff className="w-3.5 h-3.5" />
                </button>

                {/* Close */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSnip(snip.id);
                  }}
                  title="Cerrar recorte"
                  className="p-1 rounded hover:bg-red-500/30 text-slate-300 hover:text-red-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Image Body */}
            <div className="relative overflow-hidden">
              <img
                src={snip.imageDataUrl}
                alt="Pinned Snip"
                className="w-full h-auto object-cover rounded-b-xl"
              />

              {/* OCR Text Drawer Overlay */}
              {showOcrId === snip.id && snip.ocrText && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md p-3 overflow-y-auto z-10 text-xs font-mono text-slate-200">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-2">
                    <span className="text-[10px] text-sky-400 font-bold uppercase">OCR Reconocido</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(snip.ocrText || '');
                        sounds.playColorCopy();
                      }}
                      className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white hover:bg-white/20"
                    >
                      Copiar
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed">{snip.ocrText}</pre>
                </div>
              )}
            </div>

            {/* Bottom Opacity Slider Bar on Hover */}
            <div className="
              absolute bottom-0 left-0 right-0 h-6 bg-black/70 backdrop-blur-sm
              border-t border-white/10 flex items-center justify-between px-3
              opacity-0 group-hover:opacity-100 transition-opacity duration-150
            ">
              <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                <Sliders className="w-2.5 h-2.5" />
                <span>Opacidad: {Math.round(snip.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={snip.opacity}
                onChange={(e) => updateSnipOpacity(snip.id, parseFloat(e.target.value))}
                className="w-20 h-1 accent-sky-400 cursor-pointer"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
