import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  CloudOff,
  LineChart as LineChartIcon,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge, Button, LoadingState, Panel, SectionHeader } from '@/components/ui/Primitives';
import {
  NOMINAL_BASELINE,
  generateOperatingInsights,
} from '@/features/insights/insightsEngine';
import {
  requestOutputParityValidation,
  requestSensitivitySweep,
  type SensitivitySweepResult,
  type ValidateOutputResult,
} from '@/services/analyticsClient';
import { COMPONENT_MAP, SCENARIO_PRESETS } from '@/services/dataLoader';
import { formatEfficiencyPct, formatPowerMW, formatTorqueMNm } from '@/services/formatters';
import { defaultSimulationBridge } from '@/services/simulationBridge';
import { useSimulatorStore } from '@/stores/simulatorStore';
import type { SimulationOutput } from '@/types/domain';

interface ScenarioRow {
  code: string;
  id: string;
  name: string;
  output: SimulationOutput;
}

const AXIS_STYLE = { fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' };
const TOOLTIP_STYLE = {
  backgroundColor: '#151E27',
  borderColor: '#2B3B4A',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#F1F5F9',
};

export function EngineeringInsightsPage() {
  const simInput = useSimulatorStore((s) => s.input);
  const simOutput = useSimulatorStore((s) => s.output);
  const workerStatus = useSimulatorStore((s) => s.workerStatus);
  const initSimulator = useSimulatorStore((s) => s.initSimulator);

  const [scenarioRows, setScenarioRows] = useState<ScenarioRow[]>([]);
  const [scenarioLoading, setScenarioLoading] = useState(true);

  const [sweepParam, setSweepParam] = useState<
    'netHeadM' | 'requestedFlowRateM3s' | 'guideVaneOpeningPct'
  >('netHeadM');
  const [sweepResult, setSweepResult] = useState<SensitivitySweepResult | null>(null);
  const [backendNote, setBackendNote] = useState<string | null>(null);
  const [parityResult, setParityResult] = useState<ValidateOutputResult | null>(null);
  const [analyticsBusy, setAnalyticsBusy] = useState(false);

  useEffect(() => {
    void initSimulator();
  }, [initSimulator]);

  useEffect(() => {
    let active = true;
    async function computeMatrix() {
      try {
        const targets = SCENARIO_PRESETS.filter((p) => ['A', 'B', 'C', 'D', 'E'].includes(p.code));
        const results = await Promise.all(
          targets.map(async (preset) => ({
            code: preset.code,
            id: preset.id,
            name: preset.shortLabel,
            output: await defaultSimulationBridge.evaluateSnapshot(preset.input),
          })),
        );
        if (active) {
          setScenarioRows(results);
        }
      } catch {
        // Fallback handled if WASM initialization fails cleanly elsewhere
      } finally {
        if (active) setScenarioLoading(false);
      }
    }
    void computeMatrix();
    return () => {
      active = false;
    };
  }, []);

  const currentOutput = simOutput ?? scenarioRows[0]?.output ?? null;
  const diagnostics = currentOutput ? generateOperatingInsights(simInput, currentOutput) : [];

  const handleRunBackendSweep = async () => {
    setAnalyticsBusy(true);
    setBackendNote(null);
    const bounds =
      sweepParam === 'netHeadM'
        ? { minValue: 25, maxValue: 120 }
        : sweepParam === 'requestedFlowRateM3s'
          ? { minValue: 10, maxValue: 75 }
          : { minValue: 15, maxValue: 100 };

    const res = await requestSensitivitySweep({
      baseInput: simInput,
      sweepParameter: sweepParam,
      ...bounds,
      steps: 21,
    });
    if (res.ok) {
      setSweepResult(res.data);
      if (currentOutput) {
        const parity = await requestOutputParityValidation(simInput, currentOutput);
        if (parity.ok) setParityResult(parity.data);
      }
    } else {
      setSweepResult(null);
      setBackendNote(res.message);
    }
    setAnalyticsBusy(false);
  };

  // True waterfall: each loss bar floats between the power level before and after it.
  const lossBreakdownData = (() => {
    if (!currentOutput) return [];
    const mw = (w: number) => Number((w / 1e6).toFixed(2));
    const pH = mw(currentOutput.hydraulicPowerW);
    const lT = mw(currentOutput.turbineLossW);
    const lG = mw(currentOutput.generatorLossW);
    const pE = mw(currentOutput.electricalGeneratedPowerW);
    return [
      { name: 'Hydraulic In', base: 0, mw: pH, fill: '#2589D8' },
      { name: 'Turbine Loss', base: Number((pH - lT).toFixed(2)), mw: lT, fill: '#F59E0B' },
      { name: 'Gen. Loss', base: pE, mw: lG, fill: '#EF4444' },
      { name: 'Elec. Out', base: 0, mw: pE, fill: '#F5B942' },
    ];
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      <SectionHeader
        eyebrow="Engineering Analytics & Diagnostics"
        title="Plant Efficiency, Losses & Scenario Comparison"
        description="Deterministic operating-point diagnostics and Scenario A–E trade-off benchmarks executed in Rust/WASM, paired with optional Python FastAPI sensitivity sweeps."
        right={
          <div className="flex items-center gap-2">
            <Badge variant="energy">Synthetic Educational Model</Badge>
            <Badge variant={workerStatus === 'ready' ? 'success' : 'neutral'}>
              Client WASM Analytics Ready
            </Badge>
          </div>
        }
      />

      {!currentOutput ? (
        <Panel className="p-10">
          <LoadingState message="Computing plant diagnostics and Scenario A–E matrix in Rust/WASM..." />
        </Panel>
      ) : (
        <>
          {/* Rule-based Diagnostics + Loss Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 min-w-0 space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-text-secondary">
                <Activity className="h-4 w-4 text-cyan-accent" />
                Active Operating-Point Diagnostics
              </h2>
              {diagnostics.map((item) => {
                const borderClass =
                  item.severity === 'error'
                    ? 'border-status-error/50 bg-status-error/5'
                    : item.severity === 'warning'
                      ? 'border-status-warning/50 bg-status-warning/5'
                      : item.severity === 'success'
                        ? 'border-status-success/40 bg-status-success/5'
                        : 'border-subtle bg-surface';
                return (
                  <Panel key={item.id} className={`p-4 space-y-2 ${borderClass}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-base font-semibold text-text-primary">
                        {item.title}
                      </h3>
                      <Badge
                        variant={
                          item.severity === 'error'
                            ? 'error'
                            : item.severity === 'warning'
                              ? 'warning'
                              : item.severity === 'success'
                                ? 'success'
                                : 'cyan'
                        }
                      >
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-text-secondary">{item.summary}</p>
                    <p className="text-xs text-text-primary">{item.recommendation}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.components.map((cid) => (
                        <Link
                          key={cid}
                          to={`/anatomy?component=${cid}`}
                          className="rounded border border-subtle bg-elevated px-2 py-0.5 text-[11px] text-cyan-accent hover:border-cyan-accent"
                        >
                          {COMPONENT_MAP[cid]?.officialName ?? cid}
                        </Link>
                      ))}
                    </div>
                  </Panel>
                );
              })}
            </div>

            <div className="lg:col-span-5 min-w-0 space-y-4">
              <Panel className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-text-primary">
                    Energy Loss Waterfall (Current Operating Point)
                  </h2>
                  <span className="font-mono text-xs text-cyan-accent">
                    η_overall = {formatEfficiencyPct(currentOutput.overallEfficiency)}
                  </span>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={lossBreakdownData}
                      margin={{ top: 8, right: 16, left: 4, bottom: 4 }}
                      barCategoryGap="22%"
                    >
                      <CartesianGrid stroke="#2B3B4A" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={AXIS_STYLE} interval={0} />
                      <YAxis
                        tick={AXIS_STYLE}
                        width={58}
                        tickFormatter={(v: number) => `${v} MW`}
                      />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        cursor={{ fill: 'rgba(54,197,217,0.06)' }}
                        formatter={(value: number, key: string) =>
                          key === 'base' ? [null, null] : [`${value.toFixed(2)} MW`, 'Power']
                        }
                      />
                      <Bar dataKey="base" stackId="w" fillOpacity={0} strokeOpacity={0} isAnimationActive={false} legendType="none">
                        {lossBreakdownData.map((entry) => (
                          <Cell key={`base-${entry.name}`} fill="#000" fillOpacity={0} />
                        ))}
                      </Bar>
                      <Bar dataKey="mw" stackId="w" radius={[4, 4, 0, 0]}>
                        {lossBreakdownData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel className="p-4 space-y-2 text-xs">
                <div className="font-mono uppercase tracking-wider text-text-muted">
                  Comparison Against Nominal Scenario A Baseline
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded border border-subtle bg-canvas/50 p-2.5">
                    <div className="text-text-muted">Electrical Output Δ</div>
                    <div className="mt-0.5 font-mono text-sm font-semibold text-energy-accent">
                      {(
                        (currentOutput.electricalGeneratedPowerW -
                          NOMINAL_BASELINE.electricalGeneratedPowerW) /
                        1e6
                      ).toFixed(2)}{' '}
                      MW
                    </div>
                  </div>
                  <div className="rounded border border-subtle bg-canvas/50 p-2.5">
                    <div className="text-text-muted">Overall η Δ</div>
                    <div className="mt-0.5 font-mono text-sm font-semibold text-cyan-accent">
                      {(
                        (currentOutput.overallEfficiency - NOMINAL_BASELINE.overallEfficiency) *
                        100
                      ).toFixed(2)}{' '}
                      pp
                    </div>
                  </div>
                </div>
                <div className="pt-1 flex justify-end">
                  <Link to="/simulator">
                    <Button size="sm" variant="secondary">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Adjust Inputs in Simulator
                    </Button>
                  </Link>
                </div>
              </Panel>
            </div>
          </div>

          {/* Scenario A-E Comparison Matrix */}
          <Panel className="p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Canonical Scenario Comparison Matrix (A–E)
                </h2>
                <p className="text-xs text-text-secondary">
                  All five canonical operating regimes evaluated deterministically against Nominal Scenario A.
                </p>
              </div>
              <Badge variant="neutral">Computed via Rust/WASM</Badge>
            </div>

            {scenarioLoading ? (
              <LoadingState message="Evaluating Scenarios A–E..." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-subtle bg-elevated/60 font-mono text-[10px] uppercase text-text-muted">
                    <tr>
                      <th className="px-3 py-2.5">Scenario</th>
                      <th className="px-3 py-2.5">Hydraulic In</th>
                      <th className="px-3 py-2.5">Shaft Mech.</th>
                      <th className="px-3 py-2.5">Elec. Gen</th>
                      <th className="px-3 py-2.5">Overall η</th>
                      <th className="px-3 py-2.5">Shaft Torque</th>
                      <th className="px-3 py-2.5">Δ Gen vs. A</th>
                      <th className="px-3 py-2.5">Warnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle/60">
                    {scenarioRows.map((row) => {
                      const baseGen = scenarioRows[0]?.output.electricalGeneratedPowerW ?? 0;
                      const deltaMw = (row.output.electricalGeneratedPowerW - baseGen) / 1e6;
                      return (
                        <tr key={row.id} className="hover:bg-elevated/30">
                          <td className="px-3 py-2.5 font-medium text-text-primary">
                            <span className="font-mono text-cyan-accent mr-1.5">{row.code}</span>
                            {row.name}
                          </td>
                          <td className="px-3 py-2.5 font-mono">
                            {formatPowerMW(row.output.hydraulicPowerW)}
                          </td>
                          <td className="px-3 py-2.5 font-mono">
                            {formatPowerMW(row.output.turbineMechanicalPowerW)}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-energy-accent">
                            {formatPowerMW(row.output.electricalGeneratedPowerW)}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-cyan-accent">
                            {formatEfficiencyPct(row.output.overallEfficiency)}
                          </td>
                          <td className="px-3 py-2.5 font-mono">
                            {formatTorqueMNm(row.output.turbineTorqueNm)}
                          </td>
                          <td className="px-3 py-2.5 font-mono">
                            {row.code === 'A'
                              ? '0.00 MW'
                              : `${deltaMw >= 0 ? '+' : ''}${deltaMw.toFixed(2)} MW`}
                          </td>
                          <td className="px-3 py-2.5 font-mono">
                            {row.output.warnings.length > 0 ? (
                              <Badge variant="warning">{row.output.warnings.length}</Badge>
                            ) : (
                              <Badge variant="success">0</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {/* Optional Python FastAPI Sensitivity Sweep */}
          <Panel className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-display text-base font-semibold text-text-primary">
                  <LineChartIcon className="h-4 w-4 text-cyan-accent" />
                  Optional FastAPI Sensitivity Sweep & Cross-Language Parity Check
                </h2>
                <p className="text-xs text-text-secondary">
                  Gracefully degrades in standalone static deployments while powering multi-point parameter sweeps &lt;1e-5 parity verification when `VITE_API_BASE_URL` is connected.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Sweep parameter"
                  value={sweepParam}
                  onChange={(e) =>
                    setSweepParam(
                      e.target.value as 'netHeadM' | 'requestedFlowRateM3s' | 'guideVaneOpeningPct',
                    )
                  }
                  className="rounded border border-subtle bg-canvas px-2.5 py-1.5 text-xs text-text-primary"
                >
                  <option value="netHeadM">Net Head (25–120 m)</option>
                  <option value="requestedFlowRateM3s">Flow Rate (10–75 m³/s)</option>
                  <option value="guideVaneOpeningPct">Guide Vane (15–100%)</option>
                </select>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={analyticsBusy}
                  onClick={() => void handleRunBackendSweep()}
                >
                  {analyticsBusy ? 'Running Sweep...' : 'Run Backend Sweep'}
                </Button>
              </div>
            </div>

            {backendNote ? (
              <div className="flex items-center gap-2 rounded border border-subtle bg-elevated/40 px-3 py-2 text-xs text-text-secondary">
                <CloudOff className="h-4 w-4 shrink-0 text-text-muted" />
                <span>{backendNote}</span>
              </div>
            ) : null}

            {sweepResult ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-cyan-accent">
                    Local Derivative: {(sweepResult.sensitivityAtBasePoint.localDerivativeElecPowerPerUnit / 1e6).toFixed(3)} MW / unit ({sweepResult.sensitivityAtBasePoint.unit})
                  </span>
                  {parityResult ? (
                    <Badge variant={parityResult.passed ? 'success' : 'error'}>
                      <CheckCircle2 className="h-3 w-3" />
                      WASM/Python Parity {parityResult.passed ? 'PASS' : 'FAIL'} (max err{' '}
                      {parityResult.maxRelativeError.toExponential(2)})
                    </Badge>
                  ) : null}
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sweepResult.points.map((pt) => ({
                        param: Number(pt.parameterValue.toFixed(1)),
                        elecMW: Number((pt.electricalGeneratedPowerW / 1e6).toFixed(2)),
                      }))}
                    >
                      <CartesianGrid stroke="#2B3B4A" strokeDasharray="3 3" />
                      <XAxis dataKey="param" tick={AXIS_STYLE} />
                      <YAxis tick={AXIS_STYLE} unit=" MW" width={54} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Line
                        type="monotone"
                        dataKey="elecMW"
                        name="Generated MW"
                        stroke="#F5B942"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}
          </Panel>
        </>
      )}
    </div>
  );
}
