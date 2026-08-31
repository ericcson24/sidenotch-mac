import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SwarmTab } from '../../components/dashboard/tabs/SwarmTab';
import type { Agent } from '../../types/dashboard';

describe('SwarmTab Pipeline React Component', () => {
  const mockAgents: Agent[] = [
    {
      id: 'gemini-architect',
      name: 'Gemini 3.7',
      role: 'Arquitecto de Software',
      model: 'gemini-3.7-pro',
      status: 'idle',
      currentTask: '',
      avatarColor: 'from-lime-400 to-emerald-500',
      assignedWorkspace: '/test',
      memoryUsage: '100MB',
      temperature: 0.2,
    },
    {
      id: 'claude-dev',
      name: 'Claude 3.7',
      role: 'Desarrollador Senior',
      model: 'claude-3.7-sonnet',
      status: 'idle',
      currentTask: '',
      avatarColor: 'from-orange-400 to-amber-500',
      assignedWorkspace: '/test',
      memoryUsage: '120MB',
      temperature: 0.3,
    },
  ];

  it('renders agent selection cards and count badge', () => {
    const setSelectedAgents = vi.fn();
    const setPrompt = vi.fn();
    const runPipeline = vi.fn();

    render(
      <SwarmTab
        agents={mockAgents}
        selectedSwarmAgentIds={['gemini-architect']}
        setSelectedSwarmAgentIds={setSelectedAgents}
        swarmPrompt=""
        setSwarmPrompt={setPrompt}
        isExecutingSwarm={false}
        swarmProgressLogs={['[Paso 1/2] Iniciando arquitectura...']}
        workspaceContext={null}
        onRunSwarmPipeline={runPipeline}
      />
    );

    expect(screen.getByText('Equipo Multi-Agente (Swarm Pipeline)')).toBeDefined();
    expect(screen.getByText('1 agentes seleccionados')).toBeDefined();
    expect(screen.getByText('Gemini 3.7')).toBeDefined();
    expect(screen.getByText('Claude 3.7')).toBeDefined();
    expect(screen.getByText('[Paso 1/2] Iniciando arquitectura...')).toBeDefined();
  });

  it('updates prompt on sample task suggestion click', () => {
    const setPrompt = vi.fn();

    render(
      <SwarmTab
        agents={mockAgents}
        selectedSwarmAgentIds={['gemini-architect', 'claude-dev']}
        setSelectedSwarmAgentIds={vi.fn()}
        swarmPrompt=""
        setSwarmPrompt={setPrompt}
        isExecutingSwarm={false}
        swarmProgressLogs={[]}
        workspaceContext={null}
        onRunSwarmPipeline={vi.fn()}
      />
    );

    const suggestionBtn = screen.getByText('Diseñar e implementar autenticación con validación de tipos y pruebas');
    fireEvent.click(suggestionBtn);
    expect(setPrompt).toHaveBeenCalledWith('Diseñar e implementar autenticación con validación de tipos y pruebas');
  });
});
