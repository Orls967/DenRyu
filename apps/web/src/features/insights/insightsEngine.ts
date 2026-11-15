import type { ComponentId, SimulationInput, SimulationOutput } from '@/types/domain';

export interface InsightDiagnostic {
  id: string;
  category: 'efficiency' | 'losses' | 'hydraulics' | 'dispatch';
  severity: 'info' | 'warning' | 'error' | 'success';
  title: string;
  summary: string;
  recommendation: string;
  components: ComponentId[];
}

export const NOMINAL_BASELINE = {
  hydraulicPowerW: 50_013_915,
  turbineMechanicalPowerW: 45_927_671.4,
  electricalGeneratedPowerW: 44_551_816.3,
  overallEfficiency: 0.8907884,
  bepFlowM3s: 58,
  ratedHeadM: 85,
};

export function generateOperatingInsights(
  input: SimulationInput,
  output: SimulationOutput,
): InsightDiagnostic[] {
  const insights: InsightDiagnostic[] = [];

  const effDeltaPctPoints = (output.overallEfficiency - NOMINAL_BASELINE.overallEfficiency) * 100;
  const totalLossW = output.turbineLossW + output.generatorLossW;
  const turbineLossSharePct =
    totalLossW > 0 ? (output.turbineLossW / totalLossW) * 100 : 0;

  if (output.operatingCondition === 'shutdown') {
    insights.push({
      id: 'diag-shutdown',
      category: 'dispatch',
      severity: 'info',
      title: 'Unit in Controlled Shutdown',
      summary:
        'Wicket gates are closed and synchronous breaker is open; hydraulic flow, torque, and grid export remain at zero.',
      recommendation:
        'Select Scenario A or increase guide vane opening with Normal condition to restore synchronous power.',
      components: ['comp-main-inlet-valve', 'comp-guide-vanes', 'comp-circuit-breaker'],
    });
    return insights;
  }

  // 1. BEP & Turbine Efficiency Alignment
  if (output.flowRatioToBep >= 0.85 && output.flowRatioToBep <= 1.1) {
    insights.push({
      id: 'diag-bep-optimal',
      category: 'efficiency',
      severity: 'success',
      title: 'Operating Near Francis Best Efficiency Point (BEP)',
      summary: `Flow ratio Q/Q_BEP is ${(output.flowRatioToBep * 100).toFixed(1)}%, keeping incident shock losses low across the 15 Francis blades.`,
      recommendation:
        'Maintain guide vane modulation near this envelope to maximize annual energy yield per cubic meter of storage.',
      components: ['comp-runner', 'comp-runner-blades', 'comp-guide-vanes'],
    });
  } else if (output.flowRatioToBep < 0.65 && output.actualFlowRateM3s > 0) {
    insights.push({
      id: 'diag-part-load-swirl',
      category: 'hydraulics',
      severity: 'warning',
      title: 'Part-Load Off-BEP Swirl & Draft Tube Pulsation Zone',
      summary: `Actual flow (${output.actualFlowRateM3s.toFixed(1)} m³/s) is ${(output.flowRatioToBep * 100).toFixed(1)}% of head-adjusted BEP flow (${output.bepFlowAtHeadM3s.toFixed(1)} m³/s). Overall efficiency shifts by ${effDeltaPctPoints.toFixed(1)} pp vs. nominal.`,
      recommendation:
        'Residual angular momentum leaving the runner increases draft-tube losses. Avoid prolonged deep part-load dispatch where grid flexibility allows.',
      components: ['comp-runner-blades', 'comp-draft-tube', 'comp-draft-tube-outlet'],
    });
  } else if (output.flowRatioToBep > 1.1) {
    insights.push({
      id: 'diag-high-flow-off-bep',
      category: 'efficiency',
      severity: 'warning',
      title: 'Above-BEP High Discharge Roll-Off',
      summary: `Discharge is ${(output.flowRatioToBep * 100).toFixed(1)}% of BEP flow, increasing exit kinetic energy losses in the draft tube.`,
      recommendation:
        'Verify tailwater margin and observe the efficiency roll-off on the Francis efficiency curve.',
      components: ['comp-runner', 'comp-draft-tube'],
    });
  }

  // 2. Energy Loss Attribution
  if (output.hydraulicPowerW > 0) {
    insights.push({
      id: 'diag-loss-split',
      category: 'losses',
      severity: 'info',
      title: 'Hydro-to-Electrical Loss Partitioning',
      summary: `Total conversion loss is ${(totalLossW / 1e6).toFixed(2)} MW: ${turbineLossSharePct.toFixed(0)}% occurs in Francis hydraulic/runner stages (${(output.turbineLossW / 1e6).toFixed(2)} MW) and ${(100 - turbineLossSharePct).toFixed(0)}% in synchronous stator/rotor excitation losses (${(output.generatorLossW / 1e6).toFixed(2)} MW).`,
      recommendation:
        'Compare Operating Curve vs. Fixed Manual modes in Simulator to observe why iron core losses penalize light-load generator efficiency.',
      components: ['comp-spiral-casing', 'comp-runner', 'comp-stator-winding'],
    });
  }

  // 3. Gate / Head Throttling
  if (input.requestedFlowRateM3s > output.availableFlowLimitM3s + 0.1) {
    insights.push({
      id: 'diag-gate-constrained',
      category: 'hydraulics',
      severity: 'warning',
      title: 'Gate & Head Hydraulic Capacity Constraint Active',
      summary: `Requested ${input.requestedFlowRateM3s.toFixed(1)} m³/s exceeds current wicket-gate capacity limit (${output.availableFlowLimitM3s.toFixed(1)} m³/s) at ${input.netHeadM.toFixed(1)} m net head.`,
      recommendation:
        'Open guide vanes further or increase net head to unlock full requested discharge.',
      components: ['comp-guide-vanes', 'comp-penstock'],
    });
  }

  // 4. Grid Dispatch Margin
  if (output.powerDeficitW > 1_000) {
    insights.push({
      id: 'diag-grid-deficit',
      category: 'dispatch',
      severity: 'error',
      title: 'Grid Demand Exceeds Available Unit Generation',
      summary: `Requested load (${(output.requestedLoadW / 1e6).toFixed(2)} MW) exceeds unit capability (${(output.electricalGeneratedPowerW / 1e6).toFixed(2)} MW), leaving a ${(output.powerDeficitW / 1e6).toFixed(2)} MW deficit.`,
      recommendation:
        'Increase flow/gate opening up to nameplate ceiling or shed external system load.',
      components: ['comp-electrical-grid', 'comp-step-up-transformer', 'comp-circuit-breaker'],
    });
  } else {
    insights.push({
      id: 'diag-grid-reserve',
      category: 'dispatch',
      severity: 'success',
      title: 'Dispatch Target Satisfied with Spinning Reserve',
      summary: `Delivered ${(output.deliveredElectricalPowerW / 1e6).toFixed(2)} MW at synchronous ${(output.rotationalSpeedRpm).toFixed(0)} rpm with ${(output.reserveMarginW / 1e6).toFixed(2)} MW headroom available.`,
      recommendation:
        'Switch to Scenario E in the Simulator to examine dispatch clamping behavior above generator nameplate rating.',
      components: ['comp-generator-terminal', 'comp-step-up-transformer', 'comp-electrical-grid'],
    });
  }

  return insights;
}
