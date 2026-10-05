import { useState, useEffect, useCallback } from 'react';
import type { RealQuotasState } from '../types/dashboard';

export const useLiveQuotas = () => {
  const [realQuotas, setRealQuotas] = useState<RealQuotasState>({
    geminiFiveHour: 0,
    geminiFiveHourText: 'Cargando…',
    geminiWeekly: 0,
    geminiWeeklyText: 'Cargando…',
    credits: null,
    plan: 'Antigravity',
    enableOverages: false,
    antigravityLinked: false,
    agThirdPartyFiveHour: 0,
    agThirdPartyWeekly: 0,
    claudeFiveHour: 0,
    claudeFiveHourText: 'Cargando…',
    claudeWeekly: 0,
    claudeWeeklyText: 'Cargando…',
    claudePlan: 'Claude',
    gptFiveHour: 0,
    claudeLinked: false,
    openaiLinked: false,
    deepseekLinked: false,
    openrouterLinked: false,
  });

  const [providerStatuses, setProviderStatuses] = useState<{
    claude?: { isLinked: boolean; percent: number; error?: string; maxBadge?: string };
    openai?: { isLinked: boolean; percent: number; error?: string; maxBadge?: string };
    deepseek?: { isLinked: boolean; balance?: string; error?: string };
    openrouter?: { isLinked: boolean; credits?: number; error?: string };
  }>({});

  const updateQuotasFromPayload = useCallback((data: {
    antigravity?: {
      isLinked: boolean;
      plan: string;
      availableCredits: number | null;
      enableOverages: boolean;
      geminiModels: { fiveHourRemaining: number; weeklyRemaining: number; fiveHourRefreshText: string; weeklyRefreshText: string };
      claudeGptModels: { fiveHourRemaining: number; weeklyRemaining: number };
    };
    claude?: {
      isLinked: boolean;
      percent: number;
      maxBadge: string;
      error?: string;
      fiveHourPercent?: number;
      fiveHourResetText?: string;
      weeklyPercent?: number;
      weeklyResetText?: string;
    };
    openai?: { isLinked: boolean; percent: number; maxBadge: string; error?: string };
    deepseek?: { isLinked: boolean; balance?: string; error?: string };
    openrouter?: { isLinked: boolean; credits?: number; error?: string };
  }) => {
    if (!data) return;

    const { antigravity, claude } = data;
    setRealQuotas(prev => ({
      ...prev,
      ...(antigravity && {
        geminiFiveHour: antigravity.geminiModels?.fiveHourRemaining ?? prev.geminiFiveHour,
        geminiFiveHourText: antigravity.geminiModels?.fiveHourRefreshText ?? prev.geminiFiveHourText,
        geminiWeekly: antigravity.geminiModels?.weeklyRemaining ?? prev.geminiWeekly,
        geminiWeeklyText: antigravity.geminiModels?.weeklyRefreshText ?? prev.geminiWeeklyText,
        credits: antigravity.availableCredits ?? null,
        plan: antigravity.plan || prev.plan,
        enableOverages: antigravity.enableOverages ?? prev.enableOverages,
        antigravityLinked: antigravity.isLinked,
        agThirdPartyFiveHour: antigravity.claudeGptModels?.fiveHourRemaining ?? prev.agThirdPartyFiveHour,
        agThirdPartyWeekly: antigravity.claudeGptModels?.weeklyRemaining ?? prev.agThirdPartyWeekly,
      }),
      ...(claude && {
        claudeFiveHour: claude.fiveHourPercent ?? claude.percent ?? 0,
        claudeFiveHourText: claude.fiveHourResetText ?? claude.error ?? '',
        claudeWeekly: claude.weeklyPercent ?? claude.percent ?? 0,
        claudeWeeklyText: claude.weeklyResetText ?? claude.error ?? '',
        claudePlan: claude.maxBadge,
      }),
      gptFiveHour: data.openai?.percent ?? 0,
      claudeLinked: claude?.isLinked ?? false,
      openaiLinked: data.openai?.isLinked ?? false,
      deepseekLinked: data.deepseek?.isLinked ?? false,
      openrouterLinked: data.openrouter?.isLinked ?? false,
    }));

    setProviderStatuses({
      claude: data.claude,
      openai: data.openai,
      deepseek: data.deepseek,
      openrouter: data.openrouter,
    });
  }, []);

  const fetchLiveTelemetry = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string) => Promise<unknown> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const data = (await electron.ipcRenderer.invoke('get-real-quotas')) as Parameters<typeof updateQuotasFromPayload>[0];
          updateQuotasFromPayload(data);
        }
      } catch {
        // fallback
      }
    }
  }, [updateQuotasFromPayload]);

  useEffect(() => {
    fetchLiveTelemetry();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { on: (ch: string, cb: (e: unknown, data: unknown) => void) => void; removeAllListeners: (ch: string) => void } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          electron.ipcRenderer.on('quotas-updated', (_event, data) => {
            updateQuotasFromPayload(data as Parameters<typeof updateQuotasFromPayload>[0]);
          });
          return () => {
            electron.ipcRenderer.removeAllListeners('quotas-updated');
          };
        }
      } catch {
        // fallback
      }
    }
    const interval = setInterval(fetchLiveTelemetry, 2500);
    return () => clearInterval(interval);
  }, [fetchLiveTelemetry, updateQuotasFromPayload]);

  return {
    realQuotas,
    providerStatuses,
    fetchLiveTelemetry,
  };
};
