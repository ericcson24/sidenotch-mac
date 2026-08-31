import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const {
  dispatchMultiAgentWorkflow,
  generateIntelligentLocalResponse,
  buildDeveloperSystemPrompt,
} = require('../../../electron/accountProviders.cjs');

describe('Cooperative Multi-Agent Workflow Engine', () => {
  const mockAgents = [
    {
      id: 'gemini-architect',
      name: 'Gemini 3.7',
      role: 'Arquitecto de Software',
      model: 'gemini-3.7-pro',
      avatarColor: 'from-lime-400 to-emerald-500',
    },
    {
      id: 'claude-dev',
      name: 'Claude 3.7',
      role: 'Desarrollador Senior',
      model: 'claude-3.7-sonnet',
      avatarColor: 'from-orange-400 to-amber-500',
    },
    {
      id: 'gpt-qa',
      name: 'GPT-4o',
      role: 'Especialista QA & Tests',
      model: 'gpt-4o',
      avatarColor: 'from-emerald-400 to-teal-500',
    },
  ];

  it('orchestrates sequential execution across all 3 agent roles', async () => {
    const prompt = 'Crear un hook de React para gestionar estado local con persistencia en localStorage';
    const workspace = process.cwd();

    const workflow = await dispatchMultiAgentWorkflow(mockAgents, prompt, workspace);

    expect(workflow.success).toBe(true);
    expect(workflow.results.length).toBe(3);
    expect(workflow.stepLogs.length).toBeGreaterThanOrEqual(3);

    // Verify Agent 1 (Architect)
    expect(workflow.results[0].agentName).toBe('Gemini 3.7');
    expect(workflow.results[0].role).toBe('Arquitecto de Software');
    expect(workflow.results[0].output).toBeDefined();

    // Verify Agent 2 (Developer)
    expect(workflow.results[1].agentName).toBe('Claude 3.7');
    expect(workflow.results[1].role).toBe('Desarrollador Senior');
    expect(workflow.results[1].output).toBeDefined();

    // Verify Agent 3 (QA)
    expect(workflow.results[2].agentName).toBe('GPT-4o');
    expect(workflow.results[2].role).toBe('Especialista QA & Tests');
    expect(workflow.results[2].output).toBeDefined();

    // Verify Final Synthesis accumulates all outputs
    expect(workflow.finalSynthesis).toContain('Gemini 3.7');
    expect(workflow.finalSynthesis).toContain('Claude 3.7');
    expect(workflow.finalSynthesis).toContain('GPT-4o');
  });

  it('generates role-tailored prompt responses with developer system instructions', () => {
    const agent = mockAgents[1]; // Claude dev
    const systemPrompt = buildDeveloperSystemPrompt(agent, process.cwd());

    expect(systemPrompt).toContain('Claude 3.7');
    expect(systemPrompt).toContain('Desarrollador Senior');
    expect(systemPrompt).toContain('SideNotch');

    const response = generateIntelligentLocalResponse(
      agent,
      'Refactorizar función de suma',
      process.cwd(),
      'Contexto previo del arquitecto: Modularizar'
    );

    expect(response).toBeDefined();
    expect(response.length).toBeGreaterThan(20);
  });
});
