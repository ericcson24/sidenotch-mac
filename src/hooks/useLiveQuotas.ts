import { useState, useEffect, useCallback } from 'react';
import type { RealQuotasState } from '../types/dashboard';

export const useLiveQuotas = () => {
  const [realQuotas, setRealQuotas] = useState<RealQuotasState>({
    geminiFiveHour: 99,
    geminiFiveHourText: 'Recarga en 4 horas, 59 minutos.',
    geminiWeekly: 17,
    geminiWeeklyText: 'Recarga en 3 dias, 12 horas.',
    credits: 2016,
    plan: 'Google AI Pro',
    enableOverages: true,
    claudeFiveHour: 100,
    claudeWeekly: 100,
    gptFiveHour: 100,
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
      availableCredits: number;
      enableOverages: boolean;
      geminiModels: { fiveHourRemaining: number; weeklyRemaining: number; fiveHourRefreshText: string; weeklyRefreshText: string };
      claudeGptModels: { fiveHourRemaining: number; weeklyRemaining: number };
    };
    claude?: { isLinked: boolean; percent: number; maxBadge: string; error?: string };
    openai?: { isLinked: boolean; percent: number; maxBadge: string; error?: string };
    deepseek?: { isLinked: boolean; balance?: string; error?: string };
    openrouter?: { isLinked: boolean; credits?: number; error?: string };
  }) => {
    if (!data) return;

    if (data.antigravity) {
      setRealQuotas(prev => ({
        ...prev,
        geminiFiveHour: data.antigravity?.geminiModels?.fiveHourRemaining ?? prev.geminiFiveHour,
        geminiFiveHourText: data.antigravity?.geminiModels?.fiveHourRefreshText || prev.geminiFiveHourText,
        geminiWeekly: data.antigravity?.geminiModels?.weeklyRemaining ?? prev.geminiWeekly,
        geminiWeeklyText: data.antigravity?.geminiModels?.weeklyRefreshText || prev.geminiWeeklyText,
        credits: data.antigravity?.availableCredits ?? prev.credits,
        plan: data.antigravity?.plan || prev.plan,
        enableOverages: data.antigravity?.enableOverages ?? prev.enableOverages,
        claudeFiveHour: data.claude?.percent ?? (data.antigravity?.claudeGptModels?.fiveHourRemaining ?? 100),
        claudeWeekly: data.antigravity?.claudeGptModels?.weeklyRemaining ?? 100,
        gptFiveHour: data.openai?.percent ?? 100,
        claudeLinked: data.claude?.isLinked ?? false,
        openaiLinked: data.openai?.isLinked ?? false,
        deepseekLinked: data.deepseek?.isLinked ?? false,
        openrouterLinked: data.openrouter?.isLinked ?? false,
      }));
    }

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
