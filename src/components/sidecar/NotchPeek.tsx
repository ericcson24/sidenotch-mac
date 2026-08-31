import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Scissors, ArrowRight, ShieldCheck, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotchPeekProps {
  onExpand: () => void;
  onSnip: () => void;
}

export const NotchPeek: React.FC<NotchPeekProps> = ({ onExpand, onSnip }) => {
  const { quotas, activeWorkspace } = useApp();
  const antigravityQuota = quotas.find(q => q.id === 'antigravity') || quotas[0];
  const vscodeQuota = quotas.find(q => q.id === 'vscode-copilot') || quotas[1];

  const remainingTokens = antigravityQuota.totalTokens - antigravityQuota.usedTokens;
  const remainingPercent = 100 - antigravityQuota.usedPercentage;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="
        w-80 rounded-2xl liquid-glass p-4
        border border-white/20
        shadow-[-12px_12px_40px_rgba(0,0,0,0.7)]
        flex flex-col gap-3.5
        cursor-pointer
      "
      onClick={onExpand}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>SideNotch AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-dot" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{activeWorkspace?.name}</span>
          </div>
        </div>

        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-mono text-slate-300 border border-white/10">
          ⌥ + Space
        </span>
      </div>

      {/* Quota Mini Radar */}
      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold">Antigravity Tokens</span>
          </div>
          <span className="font-mono font-bold text-sky-300">
            {remainingPercent.toFixed(0)}% disp.
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 transition-all duration-500"
            style={{ width: `${remainingPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-mono">{remainingTokens.toLocaleString()} tokens</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            Reset: {antigravityQuota.nextRefillTime}
          </span>
        </div>
      </div>

      {/* Secondary Service & Snip Action Button */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col justify-center">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-purple-400" />
            <span>VS Code</span>
          </div>
          <div className="text-xs font-bold text-white font-mono mt-0.5">
            {500 - vscodeQuota.usedTokens} chats
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSnip();
          }}
          className="
            p-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20
            border border-sky-500/30 text-sky-300 hover:text-sky-200
            flex items-center justify-center gap-1.5 text-xs font-semibold
            transition-all spring-interactive
          "
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Snipaste</span>
        </button>
      </div>

      {/* Click to expand prompt */}
      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 pt-0.5 hover:text-white transition-colors">
        <span>Abrir HUD Completo</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
};
