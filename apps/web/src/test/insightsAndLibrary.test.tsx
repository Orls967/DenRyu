import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { generateOperatingInsights } from '@/features/insights/insightsEngine';
import { TechnicalLibraryPage } from '@/features/library/TechnicalLibraryPage';
import { requestSensitivitySweep } from '@/services/analyticsClient';
import { SCENARIO_PRESETS } from '@/services/dataLoader';
import type { SimulationOutput } from '@/types/domain';

const SAMPLE_OUTPUT: SimulationOutput = {
  timestampSimS: 1.0,
  availableFlowLimitM3s: 72,
  actualFlowRateM3s: 60,
  bepFlowAtHeadM3s: 58,
  flowRatioToBep: 1.034,
  hydraulicPowerW: 50_013_915,
  turbineMechanicalPowerW: 45_927_671.4,
  electricalGeneratedPowerW: 44_551_816.3,
  deliveredElectricalPowerW: 40_000_000,
  requestedLoadW: 40_000_000,
  powerDeficitW: 0,
  reserveMarginW: 4_551_816.3,
  turbineLossW: 4_086_243.6,
  generatorLossW: 1_375_855.1,
  turbineEfficiency: 0.9183,
  generatorEfficiency: 0.97,
  overallEfficiency: 0.8908,
  turbineTorqueNm: 1_754_307.8,
  synchronousSpeedRpm: 250,
  rotationalSpeedRpm: 250,
  angularSpeedRadS: 26.18,
  cumulativeGeneratedEnergyJ: 44_551_816,
  cumulativeDeliveredEnergyJ: 40_000_000,
  operatingCondition: 'normal',
  efficiencyMode: 'operating_curve',
  warnings: [],
  isSyntheticEducationalModel: true,
};

describe('Insights Engine, Analytics Offline Fallback & Technical Library', () => {
  it('generates structured BEP & loss diagnostics for nominal and deficit states', () => {
    const nominalDiagnostics = generateOperatingInsights(SCENARIO_PRESETS[0].input, SAMPLE_OUTPUT);
    expect(nominalDiagnostics.some((d) => d.id === 'diag-bep-optimal')).toBe(true);
    expect(nominalDiagnostics.some((d) => d.id === 'diag-loss-split')).toBe(true);

    const deficitDiagnostics = generateOperatingInsights(SCENARIO_PRESETS[0].input, {
      ...SAMPLE_OUTPUT,
      powerDeficitW: 5_000_000,
      reserveMarginW: 0,
      flowRatioToBep: 0.55,
    });
    expect(deficitDiagnostics.some((d) => d.id === 'diag-part-load-swirl')).toBe(true);
    expect(deficitDiagnostics.some((d) => d.id === 'diag-grid-deficit')).toBe(true);
  });

  it('gracefully degrades analyticsClient when VITE_API_BASE_URL is not configured', async () => {
    const res = await requestSensitivitySweep({
      baseInput: SCENARIO_PRESETS[0].input,
      sweepParameter: 'netHeadM',
      minValue: 35,
      maxValue: 115,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe('BACKEND_UNAVAILABLE');
    }
  });

  it('renders TechnicalLibraryPage and filters glossary cards by category and search text', () => {
    render(
      <MemoryRouter>
        <TechnicalLibraryPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Technical Library')).toBeInTheDocument();
    expect(screen.getByText('Governing Simulation Equations')).toBeInTheDocument();
    expect(screen.getByText('Synthetic Model Assumptions & Limitations')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Turbomachinery' }));
    const search = screen.getByLabelText('Search technical library');
    fireEvent.change(search, { target: { value: 'Francis' } });
    expect(screen.getByText(/Domain Glossary/)).toBeInTheDocument();
  });
});
