import React from 'react';
import type { AccountCredentials } from '../../../types/dashboard';

interface LinkingTabProps {
  credentials: AccountCredentials;
  setCredentials: React.Dispatch<React.SetStateAction<AccountCredentials>>;
  providerStatuses: {
    claude?: { isLinked: boolean; percent: number; error?: string; maxBadge?: string };
    openai?: { isLinked: boolean; percent: number; error?: string; maxBadge?: string };
    deepseek?: { isLinked: boolean; balance?: string; error?: string };
    openrouter?: { isLinked: boolean; credits?: number; error?: string };
  };
  isTestingProvider: string | null;
  onTestAndSaveProvider: (provider: 'claude' | 'openai' | 'deepseek' | 'openrouter') => void;
}

export const LinkingTab: React.FC<LinkingTabProps> = ({
  credentials,
  setCredentials,
  providerStatuses,
  isTestingProvider,
  onTestAndSaveProvider,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Vinculacion de APIs & Modelos Externos</h2>
        <p className="text-xs text-neutral-400">Conecta tus claves directas para sincronizar telemetria de cuota real.</p>
      </div>

      {/* Claude Key */}
      <div className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-3 shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A]" />
            <span>Anthropic Claude API</span>
          </div>
          <span className={`text-xs font-mono ${providerStatuses.claude?.isLinked ? 'text-emerald-400' : 'text-neutral-400'}`}>
            {providerStatuses.claude?.isLinked ? `Conectado (${providerStatuses.claude.percent}%)` : 'Sin Vincular'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={credentials.claudeApiKey}
            onChange={e => setCredentials(prev => ({ ...prev, claudeApiKey: e.target.value }))}
            placeholder="sk-ant-api03-..."
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0071e3]"
          />
          <button
            onClick={() => onTestAndSaveProvider('claude')}
            disabled={isTestingProvider === 'claude'}
            className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isTestingProvider === 'claude' ? 'Probando...' : 'Vincular'}
          </button>
        </div>
      </div>

      {/* OpenAI Key */}
      <div className="p-4 rounded-2xl bg-[#17171c]/90 border border-white/[0.08] space-y-3 shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10A37F]" />
            <span>OpenAI ChatGPT API</span>
          </div>
          <span className={`text-xs font-mono ${providerStatuses.openai?.isLinked ? 'text-emerald-400' : 'text-neutral-400'}`}>
            {providerStatuses.openai?.isLinked ? 'Conectado (100%)' : 'Sin Vincular'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={credentials.openaiApiKey}
            onChange={e => setCredentials(prev => ({ ...prev, openaiApiKey: e.target.value }))}
            placeholder="sk-proj-..."
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0071e3]"
          />
          <button
            onClick={() => onTestAndSaveProvider('openai')}
            disabled={isTestingProvider === 'openai'}
            className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isTestingProvider === 'openai' ? 'Probando...' : 'Vincular'}
          </button>
        </div>
      </div>
    </div>
  );
};
