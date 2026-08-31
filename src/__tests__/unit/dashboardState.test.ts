import { describe, it, expect } from 'vitest';
import type { Agent, ChatMessage } from '../../types/dashboard';

describe('Dashboard State Transitions & Queue Management', () => {
  it('should manage prompt queue order correctly (FIFO)', () => {
    const queue: string[] = [];
    
    // Add prompts
    queue.push('Prompt 1: Refactorizar cabecera');
    queue.push('Prompt 2: Crear tests unitarios');
    queue.push('Prompt 3: Verificar en simulador móvil');

    expect(queue.length).toBe(3);

    // Process first prompt
    const current = queue.shift();
    expect(current).toBe('Prompt 1: Refactorizar cabecera');
    expect(queue.length).toBe(2);
    expect(queue[0]).toBe('Prompt 2: Crear tests unitarios');
  });

  it('should maintain immutability when appending chat messages', () => {
    const initialMessages: ChatMessage[] = [
      { sender: 'Tú', text: 'Hola equipo', time: '12:00', isAgent: false },
    ];

    const newMessage: ChatMessage = {
      sender: 'Gemini 3.7 Pro',
      text: 'Listo para programar en tu proyecto.',
      time: '12:01',
      isAgent: true,
    };

    const updated = [...initialMessages, newMessage];
    expect(initialMessages.length).toBe(1);
    expect(updated.length).toBe(2);
    expect(updated[1].sender).toBe('Gemini 3.7 Pro');
  });

  it('should update agent status correctly', () => {
    const agent: Agent = {
      id: 'gemini-architect',
      name: 'Gemini 3.7',
      role: 'Arquitecto de Software',
      model: 'gemini-3.7-pro',
      status: 'idle',
      currentTask: 'En espera',
      avatarColor: 'from-lime-400 to-emerald-500',
      assignedWorkspace: '/Users/eric/Desktop/Applicacion Sidebar',
      memoryUsage: '142 MB',
      temperature: 0.2,
    };

    const runningAgent: Agent = {
      ...agent,
      status: 'running',
      currentTask: 'Diseñando esquema de componentes',
    };

    expect(runningAgent.status).toBe('running');
    expect(runningAgent.currentTask).toContain('Diseñando');
    expect(agent.status).toBe('idle');
  });
});
