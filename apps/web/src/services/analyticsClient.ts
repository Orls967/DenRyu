import type { SimulationInput, SimulationOutput } from '@/types/domain';

export interface SensitivitySweepPoint {
  parameterValue: number;
  actualFlowRateM3s: number;
  hydraulicPowerW: number;
  turbineMechanicalPowerW: number;
  electricalGeneratedPowerW: number;
  deliveredElectricalPowerW: number;
  turbineEfficiency: number;
  generatorEfficiency: number;
  overallEfficiency: number;
  turbineTorqueNm: number;
  warningCount: number;
}

export interface SensitivitySweepResult {
  plantId: string;
  sweepParameter: 'netHeadM' | 'requestedFlowRateM3s' | 'guideVaneOpeningPct' | 'requestedLoadW';
  isSyntheticEducationalModel: true;
  points: SensitivitySweepPoint[];
  sensitivityAtBasePoint: {
    localDerivativeElecPowerPerUnit: number;
    unit: string;
  };
}

export interface ValidateOutputResult {
  passed: boolean;
  tolerance: number;
  maxRelativeError: number;
  metrics: {
    metric: string;
    clientValue: number;
    referenceValue: number;
    relativeError: number;
    passed: boolean;
  }[];
}

export type AnalyticsResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'BACKEND_UNAVAILABLE' | 'TIMEOUT' | 'HTTP_ERROR'; message: string };

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';

async function postAnalytics<T>(path: string, body: unknown): Promise<AnalyticsResult<T>> {
  if (!API_BASE) {
    return {
      ok: false,
      reason: 'BACKEND_UNAVAILABLE',
      message: 'Standalone offline mode — optional FastAPI analytics backend is not configured.',
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_BASE.replace(/\/+$/, '')}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    window.clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        ok: false,
        reason: 'HTTP_ERROR',
        message: `Analytics API returned HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    window.clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        ok: false,
        reason: 'TIMEOUT',
        message: 'Analytics API request timed out after 5 seconds.',
      };
    }
    return {
      ok: false,
      reason: 'BACKEND_UNAVAILABLE',
      message: 'Optional FastAPI analytics service unreachable; client-side WASM analytics remain active.',
    };
  }
}

export function requestSensitivitySweep(params: {
  baseInput: SimulationInput;
  sweepParameter: 'netHeadM' | 'requestedFlowRateM3s' | 'guideVaneOpeningPct' | 'requestedLoadW';
  minValue: number;
  maxValue: number;
  steps?: number;
}): Promise<AnalyticsResult<SensitivitySweepResult>> {
  return postAnalytics<SensitivitySweepResult>('/api/v1/analytics/sensitivity', {
    ...params,
    steps: params.steps ?? 21,
  });
}

export function requestOutputParityValidation(
  input: SimulationInput,
  clientOutput: SimulationOutput,
): Promise<AnalyticsResult<ValidateOutputResult>> {
  return postAnalytics<ValidateOutputResult>('/api/v1/analytics/validate-output', {
    input,
    clientOutput,
  });
}
