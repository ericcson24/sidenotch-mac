import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsTab } from '../../components/dashboard/tabs/SettingsTab';
import type { SavedConfig, RealQuotasState } from '../../types/dashboard';

describe('SettingsTab React Component', () => {
  const mockConfig: SavedConfig = {
    launchAtLogin: false,
    showInDock: true,
    autoHide: false,
    notchPosition: 'top-right',
    shutterSound: true,
    blurIntensity: 20,
    autoRefillAlerts: true,
  };

  const mockQuotas: RealQuotasState = {
    geminiFiveHour: 85,
    geminiFiveHourText: '85%',
    geminiWeekly: 90,
    geminiWeeklyText: '90%',
    credits: 2016,
    plan: 'Pro Plan',
    enableOverages: false,
    claudeFiveHour: 60,
    claudeWeekly: 70,
    gptFiveHour: 75,
    claudeLinked: true,
    openaiLinked: true,
    deepseekLinked: false,
    openrouterLinked: false,
  };

  it('renders quota cards with correct model names', () => {
    const updateConfig = vi.fn();

    render(
      <SettingsTab
        config={mockConfig}
        isSaved={false}
        onUpdateConfig={updateConfig}
        realQuotas={mockQuotas}
      />
    );

    expect(screen.getByText('Ajustes & Cuotas')).toBeDefined();
    expect(screen.getByText('Gemini 3.7')).toBeDefined();
    expect(screen.getByText('Claude 3.7')).toBeDefined();
    expect(screen.getByText('GPT-4o')).toBeDefined();
  });

  it('toggles notch position correctly', () => {
    const updateConfig = vi.fn();

    render(
      <SettingsTab
        config={mockConfig}
        isSaved={false}
        onUpdateConfig={updateConfig}
        realQuotas={mockQuotas}
      />
    );

    const centerRightBtn = screen.getByText('Centro derecho');
    fireEvent.click(centerRightBtn);
    expect(updateConfig).toHaveBeenCalledWith(expect.objectContaining({ notchPosition: 'center-right' }));
  });
});
