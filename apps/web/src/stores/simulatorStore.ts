import { create } from 'zustand';
import { SCENARIO_PRESETS } from '@/services/dataLoader';
import {
  SimulationValidationError,
  defaultSimulationBridge,
  type SimulationBridge,
} from '@/services/simulationBridge';
import type {
  EfficiencyCurvePoint,
  SimulationConfiguration,
  SimulationInput,
  SimulationOutput,
} from '@/types/domain';

export interface HistoryPoint {
  simTimeS: number;
  hydraulicMW: number;
  mechMW: number;
  generatedMW: number;
  deliveredMW: number;
  loadMW: number;
  efficiencyPct: number;
}

const MAX_HISTORY_POINTS = 120;
const NOMINAL_INPUT: SimulationInput = { ...SCENARIO_PRESETS[0].input };

function toMW(watts: number): number {
  return Number((watts / 1_000_000).toFixed(3));
}

function appendHistory(prev: HistoryPoint[], output: SimulationOutput): HistoryPoint[] {
  const nextPoint: HistoryPoint = {
    simTimeS: Number(output.timestampSimS.toFixed(1)),
    hydraulicMW: toMW(output.hydraulicPowerW),
    mechMW: toMW(output.turbineMechanicalPowerW),
    generatedMW: toMW(output.electricalGeneratedPowerW),
    deliveredMW: toMW(output.deliveredElectricalPowerW),
    loadMW: toMW(output.requestedLoadW),
    efficiencyPct: Number((output.overallEfficiency * 100).toFixed(2)),
  };
  const combined = [...prev, nextPoint];
  return combined.length > MAX_HISTORY_POINTS
    ? combined.slice(combined.length - MAX_HISTORY_POINTS)
    : combined;
}

interface SimulatorState {
  config: SimulationConfiguration | null;
  input: SimulationInput;
  output: SimulationOutput | null;
  efficiencyCurve: EfficiencyCurvePoint[];
  history: HistoryPoint[];
  activeScenarioId: string;
  isRunning: boolean;
  validationErrors: Record<string, string>;
  workerStatus: 'idle' | 'initializing' | 'ready' | 'error';
  workerError: string | null;

  initSimulator: (bridge?: SimulationBridge) => Promise<void>;
  updateInput: (partial: Partial<SimulationInput>, bridge?: SimulationBridge) => Promise<void>;
  applyScenario: (scenarioId: string, bridge?: SimulationBridge) => Promise<void>;
  stepOnce: (dtSeconds?: number, bridge?: SimulationBridge) => Promise<void>;
  setRunning: (running: boolean) => void;
  toggleRunning: () => void;
  resetSimulator: (bridge?: SimulationBridge) => Promise<void>;
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  config: null,
  input: { ...NOMINAL_INPUT },
  output: null,
  efficiencyCurve: [],
  history: [],
  activeScenarioId: SCENARIO_PRESETS[0].id,
  isRunning: false,
  validationErrors: {},
  workerStatus: 'idle',
  workerError: null,

  initSimulator: async (bridge = defaultSimulationBridge) => {
    const status = get().workerStatus;
    if (status === 'initializing' || status === 'ready') return;

    set({ workerStatus: 'initializing', workerError: null });
    try {
      const config = await bridge.init();
      const input = get().input;
      const [output, efficiencyCurve] = await Promise.all([
        bridge.step(input, 0.5),
        bridge.evaluateEfficiencyCurve(
          input.netHeadM,
          input.turbineEfficiencyRef,
          input.efficiencyMode,
          36,
        ),
      ]);
      set({
        config,
        output,
        efficiencyCurve,
        history: appendHistory([], output),
        validationErrors: {},
        workerStatus: 'ready',
        workerError: null,
      });
    } catch (err) {
      set({
        workerStatus: 'error',
        workerError: err instanceof Error ? err.message : String(err),
      });
    }
  },

  updateInput: async (partial, bridge = defaultSimulationBridge) => {
    const nextInput: SimulationInput = { ...get().input, ...partial };
    set({ input: nextInput, activeScenarioId: 'custom' });

    try {
      const [output, efficiencyCurve] = await Promise.all([
        bridge.evaluateSnapshot(nextInput),
        bridge.evaluateEfficiencyCurve(
          nextInput.netHeadM,
          nextInput.turbineEfficiencyRef,
          nextInput.efficiencyMode,
          36,
        ),
      ]);
      set({
        output,
        efficiencyCurve,
        validationErrors: {},
      });
    } catch (err) {
      if (err instanceof SimulationValidationError) {
        const field = err.field ?? 'general';
        set({ validationErrors: { [field]: err.message } });
      } else {
        set({
          validationErrors: {
            general: err instanceof Error ? err.message : 'Validation failed',
          },
        });
      }
    }
  },

  applyScenario: async (scenarioId, bridge = defaultSimulationBridge) => {
    const preset = SCENARIO_PRESETS.find((s) => s.id === scenarioId);
    if (!preset) return;

    const nextInput: SimulationInput = { ...preset.input };
    set({
      input: nextInput,
      activeScenarioId: preset.id,
      validationErrors: {},
    });

    try {
      await bridge.reset();
      const [output, efficiencyCurve] = await Promise.all([
        bridge.step(nextInput, 0.5),
        bridge.evaluateEfficiencyCurve(
          nextInput.netHeadM,
          nextInput.turbineEfficiencyRef,
          nextInput.efficiencyMode,
          36,
        ),
      ]);
      set({
        output,
        efficiencyCurve,
        history: appendHistory([], output),
        validationErrors: {},
        workerStatus: 'ready',
      });
    } catch (err) {
      set({
        workerError: err instanceof Error ? err.message : String(err),
      });
    }
  },

  stepOnce: async (dtSeconds = 1.0, bridge = defaultSimulationBridge) => {
    const { input, validationErrors } = get();
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const output = await bridge.step(input, dtSeconds);
      set((s) => ({
        output,
        history: appendHistory(s.history, output),
      }));
    } catch (err) {
      if (err instanceof SimulationValidationError) {
        const field = err.field ?? 'general';
        set({ validationErrors: { [field]: err.message }, isRunning: false });
      }
    }
  },

  setRunning: (running) => set({ isRunning: running }),
  toggleRunning: () => set((s) => ({ isRunning: !s.isRunning })),

  resetSimulator: async (bridge = defaultSimulationBridge) => {
    const nominal = { ...SCENARIO_PRESETS[0].input };
    set({
      input: nominal,
      activeScenarioId: SCENARIO_PRESETS[0].id,
      validationErrors: {},
      isRunning: false,
    });
    try {
      await bridge.reset();
      const [output, efficiencyCurve] = await Promise.all([
        bridge.step(nominal, 0.5),
        bridge.evaluateEfficiencyCurve(
          nominal.netHeadM,
          nominal.turbineEfficiencyRef,
          nominal.efficiencyMode,
          36,
        ),
      ]);
      set({
        output,
        efficiencyCurve,
        history: appendHistory([], output),
      });
    } catch (err) {
      set({
        workerStatus: 'error',
        workerError: err instanceof Error ? err.message : String(err),
      });
    }
  },
}));
