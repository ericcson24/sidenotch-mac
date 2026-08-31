import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArenaTab } from '../../components/dashboard/tabs/ArenaTab';

describe('ArenaTab React Component', () => {
  it('renders all 4 competing models correctly', () => {
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
    expect(screen.getByText('Gemini 3.7 Pro')).toBeDefined();
    expect(screen.getByText('Claude 3.7 Sonnet')).toBeDefined();
    expect(screen.getByText('OpenAI GPT-4o')).toBeDefined();
    expect(screen.getByText('DeepSeek V3 Reasoner')).toBeDefined();
  });

  it('triggers prompt change on sample chip click', () => {
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

    const sampleBtn = screen.getByText('Función de debounce optimizada en TypeScript');
    fireEvent.click(sampleBtn);
    expect(setPrompt).toHaveBeenCalledWith('Función de debounce optimizada en TypeScript');
  });
});
