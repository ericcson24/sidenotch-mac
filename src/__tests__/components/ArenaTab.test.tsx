import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArenaTab } from '../../components/dashboard/tabs/ArenaTab';
import type { ArenaResult } from '../../types/dashboard';

describe('ArenaTab React Component', () => {
  const mockRealResults: ArenaResult[] = [
    { modelId: 'gemini-3.7', modelName: 'Gemini 3.7 Pro', provider: 'Antigravity Local Engine', color: '#D4FF00', isRealAPI: true, latencyMs: 24, text: 'Enfoque arquitectónico.', tokenEstimate: 120 },
    { modelId: 'claude-3.7', modelName: 'Claude 3.7 Sonnet', provider: 'Anthropic', color: '#FF6B4A', isRealAPI: false, latencyMs: 38, text: 'Implementación TypeScript limpia.', tokenEstimate: 140 },
    { modelId: 'gpt-4o', modelName: 'OpenAI GPT-4o', provider: 'OpenAI', color: '#10A37F', isRealAPI: false, latencyMs: 32, text: 'QA y tests unitarios.', tokenEstimate: 110 },
    { modelId: 'deepseek-v3', modelName: 'DeepSeek V3 Reasoner', provider: 'DeepSeek', color: '#4D6BFE', isRealAPI: false, latencyMs: 45, text: 'Auditoría y optimización.', tokenEstimate: 130 },
  ];

  it('renders clean empty state when no battle results exist', () => {
    const setPrompt = vi.fn();
    const runArena = vi.fn();

    render(
      <ArenaTab
        arenaPrompt=""
        setArenaPrompt={setPrompt}
        isExecutingArena={false}
        arenaResults={[]}
        arenaExecutionTime={0}
        onRunArena={runArena}
      />
    );

    expect(screen.getByText('Arena de Modelos en Paralelo (4x)')).toBeDefined();
    expect(screen.getByText('Sin resultados de batalla')).toBeDefined();
  });

  it('renders actual competing models when arena results are present', () => {
    const setPrompt = vi.fn();
    const runArena = vi.fn();

    render(
      <ArenaTab
        arenaPrompt="Optimizar hook"
        setArenaPrompt={setPrompt}
        isExecutingArena={false}
        arenaResults={mockRealResults}
        arenaExecutionTime={139}
        onRunArena={runArena}
      />
    );

    expect(screen.getByText('Gemini 3.7 Pro')).toBeDefined();
    expect(screen.getByText('Claude 3.7 Sonnet')).toBeDefined();
    expect(screen.getByText('OpenAI GPT-4o')).toBeDefined();
    expect(screen.getByText('DeepSeek V3 Reasoner')).toBeDefined();
    expect(screen.getByText('Tiempo total: 139ms')).toBeDefined();
  });

  it('triggers prompt submission on button click', () => {
    const setPrompt = vi.fn();
    const runArena = vi.fn((e?: React.FormEvent) => e?.preventDefault());

    render(
      <ArenaTab
        arenaPrompt="Crear componente accesible"
        setArenaPrompt={setPrompt}
        isExecutingArena={false}
        arenaResults={[]}
        arenaExecutionTime={0}
        onRunArena={runArena}
      />
    );

    const submitBtn = screen.getByText('Lanzar Batalla 4x');
    fireEvent.click(submitBtn);
    expect(runArena).toHaveBeenCalled();
  });
});
