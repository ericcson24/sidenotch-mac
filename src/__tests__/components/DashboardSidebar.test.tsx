import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardSidebar } from '../../components/dashboard/navigation/DashboardSidebar';

describe('DashboardSidebar React Component', () => {
  it('renders all 4 main navigation tabs', () => {
    const setActiveTab = vi.fn();

    render(
      <DashboardSidebar
        activeTab="console"
        setActiveTab={setActiveTab}
        geminiFiveHour={88}
        credits={2016}
      />
    );

    expect(screen.getByText('Asistente IA')).toBeDefined();
    expect(screen.getByText('Herramientas')).toBeDefined();
    expect(screen.getByText('Archivos & Git')).toBeDefined();
    expect(screen.getByText('Ajustes & Cuotas')).toBeDefined();
    expect(screen.getByText('2,016 cr')).toBeDefined();
  });

  it('triggers tab change on click', () => {
    const setActiveTab = vi.fn();

    render(
      <DashboardSidebar
        activeTab="console"
        setActiveTab={setActiveTab}
        geminiFiveHour={88}
        credits={2016}
      />
    );

    const toolsBtn = screen.getByText('Herramientas');
    fireEvent.click(toolsBtn);
    expect(setActiveTab).toHaveBeenCalledWith('tools');
  });
});
