import initWasm, { WasmSimulationEngine } from '../wasm/pkg/denryu_engine.js';
import type {
  EfficiencyCurvePoint,
  EfficiencyMode,
  SimulationConfiguration,
  SimulationInput,
  SimulationOutput,
} from '../types/domain';

export type WorkerCommand =
  | { type: 'INIT' }
  | { type: 'GET_CONFIG' }
  | { type: 'SET_CONFIG'; config: SimulationConfiguration }
  | { type: 'RESET' }
  | { type: 'VALIDATE'; input: SimulationInput }
  | { type: 'EVALUATE_SNAPSHOT'; input: SimulationInput }
  | { type: 'STEP'; input: SimulationInput; dtSeconds: number }
  | {
      type: 'EFFICIENCY_CURVE';
      netHeadM: number;
      turbineEfficiencyRef: number;
      efficiencyMode: EfficiencyMode;
      points: number;
    };

export type WorkerRequest = WorkerCommand & { id: number };

export type WorkerResponse =
  | { id: number; ok: true; result: unknown }
  | { id: number; ok: false; error: { code?: string; field?: string; message: string } };

let engine: WasmSimulationEngine | null = null;

async function ensureEngine(): Promise<WasmSimulationEngine> {
  if (!engine) {
    await initWasm();
    engine = new WasmSimulationEngine();
  }
  return engine;
}

function normalizeError(err: unknown): { code?: string; field?: string; message: string } {
  if (err && typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === 'string') {
      return {
        code: typeof obj.code === 'string' ? obj.code : undefined,
        field: typeof obj.field === 'string' ? obj.field : undefined,
        message: obj.message,
      };
    }
    if (err instanceof Error) {
      return { message: err.message };
    }
  }
  return { message: String(err ?? 'Unknown WASM simulation error') };
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;
  try {
    const sim = await ensureEngine();
    let result: unknown = null;

    switch (req.type) {
      case 'INIT':
        result = sim.getConfig() as SimulationConfiguration;
        break;
      case 'GET_CONFIG':
        result = sim.getConfig() as SimulationConfiguration;
        break;
      case 'SET_CONFIG':
        sim.setConfig(req.config);
        result = true;
        break;
      case 'RESET':
        sim.reset();
        result = true;
        break;
      case 'VALIDATE':
        result = sim.validateInput(req.input) as boolean;
        break;
      case 'EVALUATE_SNAPSHOT':
        result = sim.evaluateSnapshot(req.input) as SimulationOutput;
        break;
      case 'STEP':
        result = sim.step(req.input, req.dtSeconds) as SimulationOutput;
        break;
      case 'EFFICIENCY_CURVE':
        result = sim.evaluateEfficiencyCurve(
          req.netHeadM,
          req.turbineEfficiencyRef,
          req.efficiencyMode,
          req.points,
        ) as EfficiencyCurvePoint[];
        break;
      default:
        throw new Error(`Unsupported worker command`);
    }

    const res: WorkerResponse = { id: req.id, ok: true, result };
    self.postMessage(res);
  } catch (err) {
    const res: WorkerResponse = { id: req.id, ok: false, error: normalizeError(err) };
    self.postMessage(res);
  }
};
