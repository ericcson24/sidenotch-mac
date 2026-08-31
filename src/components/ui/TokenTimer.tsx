import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';

interface TokenTimerProps {
  resetInMinutes: number;
  refillTime: string;
  refillAmount: number;
  onManualRefill?: () => void;
  accentColor?: string;
}

export const TokenTimer: React.FC<TokenTimerProps> = ({
  resetInMinutes,
  refillTime,
  refillAmount,
  onManualRefill,
  accentColor = '#38bdf8',
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(resetInMinutes * 60);

  useEffect(() => {
    setSecondsRemaining(resetInMinutes * 60);
  }, [resetInMinutes]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10"
          style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
        >
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Recarga de Tokens</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
              +{refillAmount.toLocaleString()} tokens
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Próximo ciclo a las <span className="font-mono text-slate-200 font-medium">{refillTime}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="text-right">
          <div className="font-mono text-xs font-bold text-white tracking-wider bg-black/40 px-2 py-1 rounded-md border border-white/5">
            {formattedTime}
          </div>
        </div>

        {onManualRefill && (
          <button
            onClick={onManualRefill}
            title="Simular recarga instantánea"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 transition-colors spring-interactive"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
