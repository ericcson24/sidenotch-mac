import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DebuggerTab } from '../../components/dashboard/tabs/DebuggerTab';
import type { ErrorDiagnosis } from '../../types/dashboard';

describe('DebuggerTab Diagnosis React Component', () => {
  it('renders input form and diagnoses pasted error trace', () => {
    const setInput = vi.fn();
    const diagnoseError = vi.fn();

    render(
      <DebuggerTab
        currentWorkspace="/test"
        errorInput=""
        setErrorInput={setInput}
        errorDiagnosis={null}
        onDiagnoseError={diagnoseError}
        onOpenFileInViewer={vi.fn()}
        onSendPrompt={vi.fn()}
      />
    );

    expect(screen.getByText('Depurador IA de Errores')).toBeDefined();
    expect(screen.getByPlaceholderText(/Ejemplo: TypeError: Cannot read properties/)).toBeDefined();
  });

  it('renders diagnosed result with affected file and recommended fix', () => {
    const mockDiagnosis: ErrorDiagnosis = {
      affectedFile: 'src/components/App.tsx',
      lineNumber: '28',
      summary: 'Error detectado en src/components/App.tsx (Línea 28)',
      explanation: 'Problema de ejecución en hooks React.',
      recommendedFix: 'Verificar la lista de dependencias del hook useEffect.',
    };

    const openInViewer = vi.fn();
    const sendPrompt = vi.fn();

    render(
      <DebuggerTab
        currentWorkspace="/test"
        errorInput="TypeError at App.tsx:28"
        setErrorInput={vi.fn()}
        errorDiagnosis={mockDiagnosis}
        onDiagnoseError={vi.fn()}
        onOpenFileInViewer={openInViewer}
        onSendPrompt={sendPrompt}
      />
    );

    expect(screen.getByText('Diagnóstico de Causa Raíz')).toBeDefined();
    expect(screen.getByText('src/components/App.tsx')).toBeDefined();
    expect(screen.getByText(/Línea estimada:/)).toBeDefined();
    expect(screen.getByText('Verificar la lista de dependencias del hook useEffect.')).toBeDefined();

    // Test Open in Viewer button
    const openBtn = screen.getByText('Abrir archivo en el Visor');
    fireEvent.click(openBtn);
    expect(openInViewer).toHaveBeenCalledWith('/test/src/components/App.tsx');

    // Test Apply Fix button
    const applyBtn = screen.getByText('Aplicar solución con el Asistente');
    fireEvent.click(applyBtn);
    expect(sendPrompt).toHaveBeenCalledWith(undefined, expect.stringContaining('src/components/App.tsx'));
  });
});
