import { useState, useCallback } from 'react';
import type { GitFileInfo, GitCommitNode, GitBranchItem } from '../types/dashboard';
import { sounds } from '../utils/soundEffects';

export const useWorkspaceGit = (currentWorkspace: string) => {
  const [gitStatus, setGitStatus] = useState<{ isGit: boolean; branch: string; files: GitFileInfo[] }>({
    isGit: true,
    branch: 'main',
    files: [],
  });
  const [gitCommits, setGitCommits] = useState<GitCommitNode[]>([]);
  const [gitBranches, setGitBranches] = useState<GitBranchItem[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<GitCommitNode | null>(null);
  const [commitMessage, setCommitMessage] = useState<string>('');
  const [isGeneratingCommit, setIsGeneratingCommit] = useState<boolean>(false);

  const loadGitGraph = useCallback(async (dir: string) => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, p: string) => Promise<{ success: boolean; commits: GitCommitNode[] }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('get-git-graph', dir);
          if (res && res.commits) setGitCommits(res.commits);
        }
      } catch (err) {
        console.error('Error fetching git graph:', err);
      }
    }
  }, []);

  const loadGitBranches = useCallback(async (dir: string) => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, p: string) => Promise<{ success: boolean; branches: GitBranchItem[] }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('get-git-branches', dir);
          if (res && res.branches) setGitBranches(res.branches);
        }
      } catch (err) {
        console.error('Error fetching git branches:', err);
      }
    }
  }, []);

  const loadGitStatus = useCallback(async (dir: string) => {
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, p: string) => Promise<{ isGit: boolean; branch: string; files: GitFileInfo[] }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          const res = await electron.ipcRenderer.invoke('get-workspace-git-status', dir);
          if (res) setGitStatus(res);
        }
      } catch (err) {
        console.error('Error fetching git status:', err);
      }
    }
    loadGitGraph(dir);
    loadGitBranches(dir);
  }, [loadGitGraph, loadGitBranches]);

  const checkoutBranch = async (branchName: string) => {
    sounds.playHoverTick();
    if (typeof window !== 'undefined' && (window as unknown as { require?: (mod: string) => unknown }).require) {
      try {
        const electron = (window as unknown as { require: (mod: string) => { ipcRenderer: { invoke: (ch: string, data: unknown) => Promise<{ success: boolean }> } } }).require('electron');
        if (electron && electron.ipcRenderer) {
          await electron.ipcRenderer.invoke('git-checkout-branch', { branch: branchName, cwd: currentWorkspace });
          sounds.playIslandExpand();
          loadGitStatus(currentWorkspace);
        }
      } catch (err) {
        console.error('Error switching branch:', err);
      }
    }
  };

  const generateAICommitMessage = () => {
    if (gitStatus.files.length === 0) {
      setCommitMessage('chore: update project files and sync dependencies');
      return;
    }
    setIsGeneratingCommit(true);
    sounds.playHoverTick();

    const changedNames = gitStatus.files.map(f => f.file).join(', ');
    const hasFix = changedNames.toLowerCase().includes('fix') || changedNames.toLowerCase().includes('bug');
    const hasFeat = changedNames.toLowerCase().includes('component') || changedNames.toLowerCase().includes('dash');

    setTimeout(() => {
      let prefix = 'refactor';
      if (hasFeat) prefix = 'feat';
      else if (hasFix) prefix = 'fix';

      setCommitMessage(`${prefix}: integrate improvements in ${gitStatus.files.slice(0, 3).map(f => f.file.split('/').pop()).join(', ')}`);
      setIsGeneratingCommit(false);
      sounds.playIslandExpand();
    }, 400);
  };

  return {
    gitStatus,
    gitCommits,
    gitBranches,
    selectedCommit,
    setSelectedCommit,
    commitMessage,
    setCommitMessage,
    isGeneratingCommit,
    loadGitStatus,
    checkoutBranch,
    generateAICommitMessage,
  };
};
