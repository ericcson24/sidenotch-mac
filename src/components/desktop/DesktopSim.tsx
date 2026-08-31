import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle2, ChevronRight, ArrowRight, Scissors, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export const DesktopSim: React.FC = () => {
  const { openSidecar, startSnipMode, quotas } = useApp();
  const [activeCodeTab, setActiveCodeTab] = useState<'app' | 'shader' | 'quota'>('app');

  const antigravity = quotas.find(q => q.id === 'antigravity') || quotas[0];

  return (
    <div className="relative w-full h-[calc(100vh-28px)] overflow-hidden p-6 flex flex-col justify-between select-none">
      {/* Desktop Main Workspaces Windows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start max-h-[85vh]">
        {/* Left Column: Simulated IDE / Code Editor Window */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 rounded-2xl liquid-glass border border-white/15 shadow-2xl flex flex-col h-full max-h-[760px] overflow-hidden"
        >
          {/* Window Header */}
          <div className="h-10 bg-slate-950/80 border-b border-white/10 px-4 flex items-center justify-between">
            {/* macOS Traffic Lights */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600" />
              <span className="text-xs font-medium text-slate-400 ml-3 font-mono">
                Visual Studio Code — Applicacion Sidebar
              </span>
            </div>

            {/* Code Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveCodeTab('app')}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  activeCodeTab === 'app' ? 'bg-white/10 text-sky-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                SideNotch.tsx
              </button>
              <button
                onClick={() => setActiveCodeTab('shader')}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  activeCodeTab === 'shader' ? 'bg-white/10 text-purple-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                liquid-glass.css
              </button>
              <button
                onClick={() => setActiveCodeTab('quota')}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  activeCodeTab === 'quota' ? 'bg-white/10 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                tokenRecovery.ts
              </button>
            </div>
          </div>

          {/* Code Editor Body */}
          <div className="flex-1 p-5 font-mono text-xs overflow-y-auto bg-slate-950/90 text-slate-200 leading-relaxed">
            {activeCodeTab === 'app' && (
              <div className="space-y-1">
                <p className="text-slate-500">{'// ⚡ Antigravity Agentic Sidecar Engine — v1.4.0'}</p>
                <p><span className="text-purple-400">import</span> {'{'} <span className="text-sky-300">LiquidGlassSidecar</span>, <span className="text-sky-300">QuotaMonitor</span> {'}'} <span className="text-purple-400">from</span> <span className="text-emerald-300">'@apple/liquid-glass'</span>;</p>
                <p><span className="text-purple-400">import</span> {'{'} <span className="text-sky-300">SnipasteVisionAI</span> {'}'} <span className="text-purple-400">from</span> <span className="text-emerald-300">'@antigravity/vision-lens'</span>;</p>
                <p>&nbsp;</p>
                <p><span className="text-blue-400">export const</span> <span className="text-amber-300">initSidecar</span> = () =&gt; {'{'}</p>
                <p className="pl-4"><span className="text-blue-400">const</span> notch = <span className="text-blue-400">new</span> <span className="text-sky-300">LiquidGlassSidecar</span>({'{'}</p>
                <p className="pl-8 text-slate-400">edge: <span className="text-emerald-300">'screen-right'</span>,</p>
                <p className="pl-8 text-slate-400">hapticPhysics: {'{'} stiffness: <span className="text-amber-300">320</span>, damping: <span className="text-amber-300">28</span> {'}'},</p>
                <p className="pl-8 text-slate-400">specularGlow: <span className="text-purple-400">true</span>,</p>
                <p className="pl-8 text-slate-400">autoTokenRecovery: <span className="text-purple-400">true</span>,</p>
                <p className="pl-4">{'}'});</p>
                <p>&nbsp;</p>
                <p className="pl-4 text-slate-500">{'// Escucha de proximidad del cursor en el borde derecho'}</p>
                <p className="pl-4">notch.<span className="text-amber-300">onEdgeProximity</span>((coords) =&gt; {'{'}</p>
                <p className="pl-8">notch.<span className="text-amber-300">morphToPeek</span>({'{'} remainingTokens: <span className="text-amber-300">{(antigravity.totalTokens - antigravity.usedTokens).toLocaleString()}</span> {'}'});</p>
                <p className="pl-4">{'}'});</p>
                <p>&nbsp;</p>
                <p className="pl-4"><span className="text-purple-400">return</span> notch;</p>
                <p>{'}'};</p>
              </div>
            )}

            {activeCodeTab === 'shader' && (
              <div className="space-y-1 text-slate-300">
                <p className="text-slate-500">{'/* Apple Liquid Glass continuous squircle curvature */'}</p>
                <p><span className="text-sky-400">.liquid-glass</span> {'{'}</p>
                <p className="pl-4">background: <span className="text-emerald-300">rgba(13, 16, 26, 0.72)</span>;</p>
                <p className="pl-4">backdrop-filter: <span className="text-amber-300">blur(32px) saturate(190%) contrast(105%)</span>;</p>
                <p className="pl-4">border: <span className="text-purple-300">1px solid rgba(255, 255, 255, 0.14)</span>;</p>
                <p className="pl-4">box-shadow: <span className="text-slate-400">inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)</span>;</p>
                <p>{'}'}</p>
              </div>
            )}

            {activeCodeTab === 'quota' && (
              <div className="space-y-1 text-slate-300">
                <p className="text-slate-500">{'// Token Recovery Algorithm (Antigravity & Copilot)'}</p>
                <p><span className="text-blue-400">export function</span> <span className="text-amber-300">calcTokenRecovery</span>(quota: <span className="text-sky-300">LLMQuota</span>) {'{'}</p>
                <p className="pl-4"><span className="text-blue-400">const</span> now = Date.now();</p>
                <p className="pl-4"><span className="text-blue-400">const</span> refillTime = <span className="text-emerald-300">'{antigravity.nextRefillTime}'</span>;</p>
                <p className="pl-4"><span className="text-purple-400">return</span> {'{'} refillTokens: <span className="text-amber-300">+{antigravity.refillAmount.toLocaleString()}</span>, eta: <span className="text-emerald-300">'1h 42m'</span> {'}'};</p>
                <p>{'}'}</p>
              </div>
            )}
          </div>

          {/* IDE Bottom Status Bar */}
          <div className="h-6 bg-sky-950/80 border-t border-white/10 px-3 flex items-center justify-between text-[11px] font-mono text-sky-200">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>TypeScript OK</span>
              </span>
              <span className="text-slate-400">|</span>
              <span>Antigravity: {((1 - antigravity.usedPercentage / 100) * 100).toFixed(0)}% disp.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-sky-500/20 px-2 py-0.5 rounded text-sky-300">UTF-8</span>
              <span>⌥ + Space para abrir SideNotch</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Interactive Quick Guide & Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-4"
        >
          {/* Quick Trigger Callout */}
          <div className="p-5 rounded-2xl liquid-glass border border-sky-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Cómo interactuar con el Notch</span>
            </div>

            <h3 className="text-base font-extrabold text-white leading-snug mb-2">
              Lleva tu cursor al borde derecho de la pantalla 👉
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Verás cómo la píldora se activa con física de resortes y efecto <strong className="text-white">Liquid Glass</strong>. También puedes hacer click o pulsar el atajo directo:
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openSidecar('quotas')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all spring-interactive"
              >
                <span>Abrir Sidecar HUD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={startSnipMode}
                title="Probar Snipaste"
                className="p-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all spring-interactive"
              >
                <Scissors className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feature Checklist */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
            <div className="text-xs font-bold text-slate-200 mb-2">Capacidades Integradas:</div>

            <div className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span><strong>Radar de Cuotas & Tokens:</strong> Monitorea Antigravity, VS Code, Claude y OpenAI con temporizador de recarga.</span>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span><strong>Snipaste & Pin F3:</strong> Recorta la pantalla, usa la lupa HEX/RGB y fija recortes flotantes.</span>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Companion Móvil PWA:</strong> Sincroniza en tiempo real para consultar tokens desde el smartphone.</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edge Proximity Guide Arrow (Visual Cue) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-500 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-mono rotate-90 uppercase tracking-widest">Borde Activo</span>
        <ChevronRight className="w-5 h-5 animate-pulse" />
      </div>
    </div>
  );
};
