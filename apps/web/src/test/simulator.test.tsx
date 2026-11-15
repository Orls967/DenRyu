import { describe, expect, it, beforeEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PLANT_CONFIG, SCENARIO_PRESETS } from '@/services/dataLoader';
import {
  SimulationBridge,
  SimulationValidationError,
  type SimulationTransport,
} from '@/services/simulationBridge';
import { ControlDeck } from '@/features/simulator/ControlDeck';
import { useSimulatorStore } from '@/stores/simulatorStore';
import type { SimulationInput, SimulationOutput } from '@/types/domain';

function buildSampleOutput(input: SimulationInput, simTimeS = 0.5): SimulationOutput {
  return {
    timestampSimS: simTimeS,
    availableFlowLimitM3s: 72,
    actualFlowRateM3s: input.requestedFlowRateM3s,
    bepFlowAtHeadM3s: 58,
    flowRatioToBep: 1.0,
    hydraulicPowerW: 50_000_000,
    turbineMechanicalPowerW: 46_000_000,
    electricalGeneratedPowerW: 44_551_816,
    deliveredElectricalPowerW: Math.min(44_551_816, input.requestedLoadW),
    requestedLoadW: input.requestedLoadW,
    powerDeficitW: Math.max(0, input.requestedLoadW - 44_551_816),
    reserveMarginW: Math.max(0, 44_551_816 - input.requestedLoadW),
    turbineLossW: 4_000_000,
    generatorLossW: 1_448_184,
    turbineEfficiency: 0.92,
    generatorEfficiency: 0.97,
    overallEfficiency: 0.891,
    turbineTorqueNm: 1_757_167,
    synchronousSpeedRpm: 250,
    rotationalSpeedRpm: 250,
    angularSpeedRadS: 26.18,
    cumulativeGeneratedEnergyJ: 22_275_908,
    cumulativeDeliveredEnergyJ: 20_000_000,
    operatingCondition: input.operatingCondition,
    efficiencyMode: input.efficiencyMode,
    warnings: [],
    isSyntheticEducationalModel: true,
  };
}

function createFakeTransport(): SimulationTransport {
  return {
    send: async (req) => {
      if (req.type === 'INIT' || req.type === 'GET_CONFIG') {
        return {
          plantId: PLANT_CONFIG.id,
          waterDensityKgM3: 1000,
          gravityMS2: 9.81,
          ratedNetHeadM: 85,
          minOperatingHeadM: 35,
          maxOperatingHeadM: 120,
          maxInputHeadM: 150,
          ratedGateCapacityFlowM3s: 72,
          ratedBepFlowM3s: 58,
          minStableFlowM3s: 15,
          maxInputFlowM3s: 80,
          ratedTurbineMechPowerW: 50_000_000,
          maxTurbineMechPowerW: 56_000_000,
          maxGeneratorElecPowerW: 55_000_000,
          gridFrequencyHz: 50,
          poleCount: 24,
          minTorqueAngularSpeedRadS: 1,
          startupRampDurationS: 12,
        };
      }
      if (req.type === 'RESET') return true;
      if (req.type === 'EVALUATE_SNAPSHOT' || req.type === 'STEP') {
        if (req.input.netHeadM > 150) {
          throw new SimulationValidationError({
            code: 'OUT_OF_RANGE',
            field: 'netHeadM',
            message: 'Net head must be between 0 and 150 m.',
          });
        }
        return buildSampleOutput(req.input, req.type === 'STEP' ? req.dtSeconds : 0);
      }
      if (req.type === 'EFFICIENCY_CURVE') {
        return [
          { flowRateM3s: 20, flowRatioToBep: 0.34, turbineEfficiency: 0.68 },
          { flowRateM3s: 58, flowRatioToBep: 1.0, turbineEfficiency: 0.92 },
        ];
      }
      return null;
    },
  };
}

describe('SimulationBridge & Generation Simulator Store', () => {
  beforeEach(() => {
    act(() => {
      useSimulatorStore.setState({
        config: null,
        input: { ...SCENARIO_PRESETS[0].input },
        output: null,
        efficiencyCurve: [],
        history: [],
        activeScenarioId: SCENARIO_PRESETS[0].id,
        isRunning: false,
        validationErrors: {},
        workerStatus: 'idle',
        workerError: null,
      });
    });
  });

  it('initializes from SimulationBridge and steps telemetry + 120-point history ring buffer', async () => {
    const bridge = new SimulationBridge(createFakeTransport());
    await useSimulatorStore.getState().initSimulator(bridge);

    const state = useSimulatorStore.getState();
    expect(state.workerStatus).toBe('ready');
    expect(state.output?.synchronousSpeedRpm).toBe(250);
    expect(state.efficiencyCurve.length).toBe(2);
    expect(state.history.length).toBe(1);

    await useSimulatorStore.getState().stepOnce(1.0, bridge);
    expect(useSimulatorStore.getState().history.length).toBe(2);
  });

  it('surfaces Rust ValidationError cleanly per field when Net Head exceeds 150 m', async () => {
    const bridge = new SimulationBridge(createFakeTransport());
    await useSimulatorStore.getState().initSimulator(bridge);

    await useSimulatorStore.getState().updateInput({ netHeadM: 180 }, bridge);
    expect(useSimulatorStore.getState().validationErrors.netHeadM).toContain('150');

    render(<ControlDeck />);
    expect(screen.getByRole('alert')).toHaveTextContent('Net head must be between 0 and 150 m.');
  });

  it('allows switching canonical Scenario Presets (A–F)', async () => {
    const bridge = new SimulationBridge(createFakeTransport());
    await useSimulatorStore.getState().initSimulator(bridge);

    const scenarioB = SCENARIO_PRESETS.find((s) => s.code === 'B');
    expect(scenarioB).toBeDefined();
    await useSimulatorStore.getState().applyScenario(scenarioB!.id, bridge);

    expect(useSimulatorStore.getState().activeScenarioId).toBe(scenarioB!.id);
    expect(useSimulatorStore.getState().input.operatingCondition).toBe('partial_load');
    expect(useSimulatorStore.getState().input.requestedFlowRateM3s).toBe(32);
  });

  it('renders Scenario preset buttons cleanly in ControlDeck', () => {
    render(<ControlDeck />);
    expect(screen.getByText('Operating Controls')).toBeInTheDocument();
    const headInput = screen.getByLabelText('Net Head (H)') as HTMLInputElement;
    expect(headInput.value).toBe('85');
    fireEvent.click(screen.getByRole('button', { name: 'Fixed Manual' }));
    return waitFor(() => {
      expect(useSimulatorStore.getState().input.efficiencyMode).toBe('fixed_manual');
    });
  });
});
