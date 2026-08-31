import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const {
  analyzePromptComplexity,
  diagnoseErrorTrace,
  optimizePromptStudio,
} = require('../../../electron/accountProviders.cjs');

describe('AI Backend Services & Prompt Intelligence', () => {
  describe('analyzePromptComplexity', () => {
    it('should recommend multi-agent collaboration on complex multi-tier prompts', () => {
      const complexPrompt = 'Necesito crear toda la arquitectura de autenticación con base de datos, backend en Node y frontend con React, validando accesibilidad y pruebas';
      const result = analyzePromptComplexity(complexPrompt);
      expect(result.isMultiAgentRecommended).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(2);
      expect(result.suggestedPlan.length).toBe(3);
    });

    it('should not force multi-agent for simple short queries', () => {
      const simplePrompt = '¿Qué hora es?';
      const result = analyzePromptComplexity(simplePrompt);
      expect(result.isMultiAgentRecommended).toBe(false);
    });
  });

  describe('diagnoseErrorTrace', () => {
    it('should extract error details from standard React / Node stack trace', () => {
      const errorTrace = `TypeError: Cannot read properties of undefined (reading 'map')
    at ConsoleTab (src/components/dashboard/tabs/ConsoleTab.tsx:42:15)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:15486:18)`;

      const diagnosis = diagnoseErrorTrace(errorTrace, '/Users/eric/Desktop/Applicacion Sidebar');
      expect(diagnosis.affectedFile).toContain('ConsoleTab.tsx');
      expect(diagnosis.lineNumber).toBe('42');
      expect(diagnosis.summary).toBeDefined();
      expect(diagnosis.recommendedFix).toBeDefined();
    });

    it('should gracefully handle empty or arbitrary error strings', () => {
      const diagnosis = diagnoseErrorTrace('Error desconocido en el servidor', '/test');
      expect(diagnosis.affectedFile).toBeDefined();
      expect(diagnosis.summary).toBeDefined();
      expect(diagnosis.recommendedFix).toBeDefined();
    });
  });

  describe('optimizePromptStudio', () => {
    it('should enrich prompts with context and guidelines', () => {
      const prompt = 'Crea un botón de login';
      const optimized = optimizePromptStudio(prompt, 'React, TypeScript y Tailwind CSS');
      expect(optimized).toContain('React');
      expect(optimized).toContain('TypeScript');
      expect(optimized).toContain('Crea un botón de login');
    });
  });
});
