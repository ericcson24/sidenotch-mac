import { useState, useCallback } from 'react';
import type { WorkspaceContextData } from '../types/dashboard';

export const useWorkspaceContext = (_currentWorkspace?: string) => {
  const [workspaceContext, setWorkspaceContext] = useState<WorkspaceContextData | null>(null);

  const loadWorkspaceDeepContext = useCallback(async (dirPath: string) => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, p: string) => Promise<WorkspaceContextData> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const ctx = await electron.ipcRenderer.invoke('get-workspace-context', dirPath);
          if (ctx) setWorkspaceContext(ctx);
        }
      } catch (err) {
        console.error('Error loading workspace context:', err);
      }
    }
  }, []);

  return {
    workspaceContext,
    setWorkspaceContext,
    loadWorkspaceDeepContext,
  };
};
