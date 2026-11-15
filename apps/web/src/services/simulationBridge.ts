import type {
  EfficiencyCurvePoint,
  EfficiencyMode,
  SimulationConfiguration,
  SimulationInput,
  SimulationOutput,
} from '@/types/domain';
import type { WorkerCommand, WorkerRequest, WorkerResponse } from '@/workers/simulation.worker';

export class SimulationValidationError extends Error {
  code?: string;
  field?: string;

  constructor(payload: { code?: string; field?: string; message: string }) {
    super(payload.message);
    this.name = 'SimulationValidationError';
    this.code = payload.code;
    this.field = payload.field;
  }
}

export interface SimulationTransport {
  send: (request: WorkerCommand) => Promise<unknown>;
  dispose?: () => void;
}

function createWorkerTransport(): SimulationTransport {
  const worker = new Worker(new URL('../workers/simulation.worker.ts', import.meta.url), {
    type: 'module',
  });

  let nextId = 1;
  const pending = new Map<
    number,
    { resolve: (val: unknown) => void; reject: (err: Error) => void }
  >();

  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const msg = event.data;
    const entry = pending.get(msg.id);
    if (!entry) return;
    pending.delete(msg.id);
    if (msg.ok) {
      entry.resolve(msg.result);
    } else {
      entry.reject(new SimulationValidationError(msg.error));
    }
  };

  worker.onerror = (event) => {
    const err = new Error(event.message || 'Simulation Web Worker failed unexpectedly.');
    for (const entry of pending.values()) {
      entry.reject(err);
    }
    pending.clear();
  };

  return {
    send: (request) =>
      new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        worker.postMessage({ ...request, id } as WorkerRequest);
      }),
    dispose: () => {
      for (const entry of pending.values()) {
        entry.reject(new Error('Simulation worker terminated'));
      }
      pending.clear();
      worker.terminate();
    },
  };
}

export class SimulationBridge {
  private transport: SimulationTransport | null = null;
  private initPromise: Promise<SimulationConfiguration> | null = null;

  constructor(customTransport?: SimulationTransport) {
    if (customTransport) {
      this.transport = customTransport;
    }
  }

  private getTransport(): SimulationTransport {
    if (!this.transport) {
      this.transport = createWorkerTransport();
    }
    return this.transport;
  }

  async init(): Promise<SimulationConfiguration> {
    if (!this.initPromise) {
      this.initPromise = this.getTransport()
        .send({ type: 'INIT' })
        .then((cfg) => cfg as SimulationConfiguration)
        .catch((err) => {
          this.initPromise = null;
          throw err;
        });
    }
    return this.initPromise;
  }

  async getConfig(): Promise<SimulationConfiguration> {
    await this.init();
    return (await this.getTransport().send({ type: 'GET_CONFIG' })) as SimulationConfiguration;
  }

  async setConfig(config: SimulationConfiguration): Promise<void> {
    await this.init();
    await this.getTransport().send({ type: 'SET_CONFIG', config });
  }

  async reset(): Promise<void> {
    await this.init();
    await this.getTransport().send({ type: 'RESET' });
  }

  async validateInput(input: SimulationInput): Promise<boolean> {
    await this.init();
    return (await this.getTransport().send({ type: 'VALIDATE', input })) as boolean;
  }

  async evaluateSnapshot(input: SimulationInput): Promise<SimulationOutput> {
    await this.init();
    return (await this.getTransport().send({ type: 'EVALUATE_SNAPSHOT', input })) as SimulationOutput;
  }

  async step(input: SimulationInput, dtSeconds: number): Promise<SimulationOutput> {
    await this.init();
    return (await this.getTransport().send({
      type: 'STEP',
      input,
      dtSeconds,
    })) as SimulationOutput;
  }

  async evaluateEfficiencyCurve(
    netHeadM: number,
    turbineEfficiencyRef: number,
    efficiencyMode: EfficiencyMode,
    points = 36,
  ): Promise<EfficiencyCurvePoint[]> {
    await this.init();
    return (await this.getTransport().send({
      type: 'EFFICIENCY_CURVE',
      netHeadM,
      turbineEfficiencyRef,
      efficiencyMode,
      points,
    })) as EfficiencyCurvePoint[];
  }

  dispose(): void {
    this.transport?.dispose?.();
    this.transport = null;
    this.initPromise = null;
  }
}

export const defaultSimulationBridge = new SimulationBridge();
