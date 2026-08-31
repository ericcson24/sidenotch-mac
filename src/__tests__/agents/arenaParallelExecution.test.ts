import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { executeArenaPrompt } = require('../../../electron/accountProviders.cjs');

describe('AI Parallel Arena Execution Engine', () => {
  it('dispatches the prompt simultaneously to 4 competitive AI models', async () => {
    const prompt = 'Implementar un algoritmo de cola de prioridad binaria en TypeScript';
    const arena = await executeArenaPrompt(prompt, process.cwd());

    expect(arena).toBeDefined();
    expect(arena.prompt).toBe(prompt);
    expect(arena.totalTimeMs).toBeGreaterThanOrEqual(0);
    expect(arena.results.length).toBe(4);

    const modelIds = arena.results.map((r: { modelId: string }) => r.modelId);
    expect(modelIds).toContain('gemini-3.7');
    expect(modelIds).toContain('claude-3.7');
    expect(modelIds).toContain('gpt-4o');
    expect(modelIds).toContain('deepseek-v3');

    // Verify properties on each model result
    for (const result of arena.results) {
      expect(result.modelName).toBeDefined();
      expect(result.provider).toBeDefined();
      expect(result.color).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
      expect(result.tokenEstimate).toBeGreaterThan(0);
    }
  });
});
