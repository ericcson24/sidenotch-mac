import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsoleTab } from '../../components/dashboard/tabs/ConsoleTab';
import type { Agent, ChatMessage } from '../../types/dashboard';

describe('ConsoleTab Agents & Chat Component', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  const mockAgents: Agent[] = [
    {
      id: 'gemini-architect',
      name: 'Gemini 3.7',
      role: 'Arquitecto de Software',
      model: 'gemini-3.7-pro',
      status: 'idle',
      currentTask: 'En espera',
      avatarColor: 'from-lime-400 to-emerald-500',
      assignedWorkspace: '/test',
      memoryUsage: '120MB',
      temperature: 0.2,
    },
  ];

  it('renders queue indicator when tasks are queued', () => {
    const setMode = vi.fn();
    const setMessages = vi.fn();
    const setInput = vi.fn();
    const sendPrompt = vi.fn();
    const exportSession = vi.fn();

    render(
      <ConsoleTab
        agents={mockAgents}
        selectedAgentId="gemini-architect"
        setSelectedAgentId={vi.fn()}
        activeAgent={mockAgents[0]}
        agentDispatchMode="swarm"
        setAgentDispatchMode={setMode}
        workspaceContext={null}
        chatMessages={[]}
        setChatMessages={setMessages}
        isSendingPrompt={false}
        promptInput=""
        setPromptInput={setInput}
        onSendPrompt={sendPrompt}
        onExportSession={exportSession}
        promptQueueCount={3}
      />
    );

    expect(screen.getByText('3 en espera')).toBeDefined();
    expect(screen.getByText('Equipo Cooperativo')).toBeDefined();
  });

  it('switches between cooperative swarm and single mode', () => {
    const setMode = vi.fn();
    const setMessages = vi.fn();
    const setInput = vi.fn();
    const sendPrompt = vi.fn();
    const exportSession = vi.fn();

    render(
      <ConsoleTab
        agents={mockAgents}
        selectedAgentId="gemini-architect"
        setSelectedAgentId={vi.fn()}
        activeAgent={mockAgents[0]}
        agentDispatchMode="swarm"
        setAgentDispatchMode={setMode}
        workspaceContext={null}
        chatMessages={[]}
        setChatMessages={setMessages}
        isSendingPrompt={false}
        promptInput=""
        setPromptInput={setInput}
        onSendPrompt={sendPrompt}
        onExportSession={exportSession}
      />
    );

    const singleModeBtn = screen.getByText('Modo Rápido');
    fireEvent.click(singleModeBtn);
    expect(setMode).toHaveBeenCalledWith('single');
  });

  it('renders chat messages with agent badges correctly', () => {
    const messages: ChatMessage[] = [
      { sender: 'Tú', text: 'Crea un componente de navegación', time: '14:20', isAgent: false },
      { sender: 'Equipo Cooperativo (Gemini + Claude + GPT)', text: '=== FASE 1: ARQUITECTURA ===', time: '14:20', isAgent: true, isSwarmBadge: true },
    ];

    render(
      <ConsoleTab
        agents={mockAgents}
        selectedAgentId="gemini-architect"
        setSelectedAgentId={vi.fn()}
        activeAgent={mockAgents[0]}
        agentDispatchMode="swarm"
        setAgentDispatchMode={vi.fn()}
        workspaceContext={null}
        chatMessages={messages}
        setChatMessages={vi.fn()}
        isSendingPrompt={false}
        promptInput=""
        setPromptInput={vi.fn()}
        onSendPrompt={vi.fn()}
        onExportSession={vi.fn()}
      />
    );

    expect(screen.getByText('Crea un componente de navegación')).toBeDefined();
    expect(screen.getByText('=== FASE 1: ARQUITECTURA ===')).toBeDefined();
  });
});
