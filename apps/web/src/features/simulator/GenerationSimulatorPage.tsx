import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Cpu, Info } from 'lucide-react';
import { PlantScene } from '@/components-3d/PlantScene';
import { WebGLBoundary } from '@/components/WebGLBoundary';
import { Badge, LoadingState, Panel, SectionHeader } from '@/components/ui/Primitives';
import { ControlDeck } from '@/features/simulator/ControlDeck';
import { SimulationCharts } from '@/features/simulator/SimulationCharts';
import { COMPONENT_MAP } from '@/services/dataLoader';
import {
  formatEfficiencyPct,
  formatEnergyMWh,
  formatFlowM3s,
  formatPowerMW,
  formatRpm,
  formatTorqueMNm,
} from '@/services/formatters';
import { useSimulatorStore } from '@/stores/simulatorStore';

export function GenerationSimulatorPage() {
  const input = useSimulatorStore((s) => s.input);
  const output = useSimulatorStore((s) => s.output);
  const efficiencyCurve = useSimulatorStore((s) => s.efficiencyCurve);
  const history = useSimulatorStore((s) => s.history);
  const isRunning = useSimulatorStore((s) => s.isRunning);
  const workerStatus = useSimulatorStore((s) => s.workerStatus);
  const workerError = useSimulatorStore((s) => s.workerError);

  const initSimulator = useSimulatorStore((s) => s.initSimulator);
  const stepOnce = useSimulatorStore((s) => s.stepOnce);

  useEffect(() => {
    void initSimulator();
  }, [initSimulator]);

  useEffect(() => {
    if (!isRunning || workerStatus !== 'ready') return;
    const timer = window.setInterval(() => {
      void stepOnce(0.5);
    }, 500);
    return () => window.clearInterval(timer);
  }, [isRunning, workerStatus, stepOnce]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 space-y-5">
      <SectionHeader
        eyebrow="Rust/WASM Deterministic Physics Engine"
        title="Hydroelectric Power Generation Simulator"
        description="Explore how net hydraulic head, wicket gate opening, flow rate, Francis efficiency curves, and grid load dispatch interact across energy conversion stages."
        right={
          <div className="flex items-center gap-2">
            <Badge variant="energy">Synthetic Educational Model</Badge>
            <Badge variant={workerStatus === 'ready' ? 'success' : workerStatus === 'error' ? 'error' : 'neutral'}>
              WASM Worker: {workerStatus}
            </Badge>
          </div>
        }
      />

      <div className="rounded-md border border-energy-accent/35 bg-energy-accent/10 px-4 py-2.5 text-xs text-text-secondary flex items-start gap-2.5">
        <Info className="h-4 w-4 shrink-0 text-energy-accent mt-0.5" />
        <span>
          <strong className="text-energy-accent font-mono uppercase mr-1.5">
            Synthetic Educational Model:
          </strong>
          Outputs reflect smooth steady-state and quasi-static Francis unit equations computed client-side in Rust/WASM (`denryu-engine`). Not SCADA plant telemetry or CFD analysis.
        </span>
      </div>

      {workerStatus === 'error' ? (
        <Panel className="p-6 border-status-error/50 bg-status-error/10 text-sm text-status-error">
          WASM Simulation Engine failed to initialize: {workerError}
        </Panel>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)] gap-5 items-start">
        {/* Left Control Deck */}
        <ControlDeck />

        {/* Right Telemetry + Paired 3D Cutaway + Charts */}
        <div className="space-y-5">
          {!output ? (
            <Panel className="p-10">
              <LoadingState message="Initializing Rust/WASM Hydroelectric Simulation Worker..." />
            </Panel>
          ) : (
            <>
              {/* Live KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                <Panel className="p-3">
                  <div className="text-[11px] font-mono uppercase text-text-muted">Hydraulic Input</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-water-accent">
                    {formatPowerMW(output.hydraulicPowerW)}
                  </div>
                  <div className="text-[11px] font-mono text-text-secondary">
                    Q = {formatFlowM3s(output.actualFlowRateM3s)}
                  </div>
                </Panel>

                <Panel className="p-3">
                  <div className="text-[11px] font-mono uppercase text-text-muted">Shaft Mech.</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-cyan-accent">
                    {formatPowerMW(output.turbineMechanicalPowerW)}
                  </div>
                  <div className="text-[11px] font-mono text-text-secondary">
                    η_t = {formatEfficiencyPct(output.turbineEfficiency)}
                  </div>
                </Panel>

                <Panel className="p-3">
                  <div className="text-[11px] font-mono uppercase text-text-muted">Elec. Generated</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-energy-accent">
                    {formatPowerMW(output.electricalGeneratedPowerW)}
                  </div>
                  <div className="text-[11px] font-mono text-text-secondary">
                    η_g = {formatEfficiencyPct(output.generatorEfficiency)}
                  </div>
                </Panel>

                <Panel className="p-3">
                  <div className="text-[11px] font-mono uppercase text-text-muted">Grid Delivered</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-status-success">
                    {formatPowerMW(output.deliveredElectricalPowerW)}
                  </div>
                  <div className="text-[11px] font-mono text-text-secondary">
                    Overall {formatEfficiencyPct(output.overallEfficiency)}
                  </div>
                </Panel>

                <Panel className="p-3">
                  <div className="text-[11px] font-mono uppercase text-text-muted">Torque & Speed</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-text-primary">
                    {formatTorqueMNm(output.turbineTorqueNm)}
                  </div>
                  <div className="text-[11px] font-mono text-text-secondary">
                    {formatRpm(output.rotationalSpeedRpm)}
                  </div>
                </Panel>

                <Panel className="p-3">
                  <div className="text-[11px] font-mono uppercase text-text-muted">Cum. Delivered</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-text-primary">
                    {formatEnergyMWh(output.cumulativeDeliveredEnergyJ)}
                  </div>
                  <div className="text-[11px] font-mono text-text-secondary">
                    t = {output.timestampSimS.toFixed(1)} s
                  </div>
                </Panel>
              </div>

              {/* Warnings Strip */}
              {output.warnings.length > 0 ? (
                <div className="space-y-2" aria-label="Operating warnings">
                  {output.warnings.map((w) => {
                    const color =
                      w.severity === 'error'
                        ? 'border-status-error/50 bg-status-error/10 text-status-error'
                        : w.severity === 'warning'
                          ? 'border-status-warning/50 bg-status-warning/10 text-status-warning'
                          : 'border-cyan-accent/40 bg-cyan-accent/10 text-cyan-accent';
                    return (
                      <div
                        key={w.code}
                        className={`rounded-md border px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 ${color}`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-mono font-semibold mr-1.5">[{w.code}]</span>
                            <span className="text-text-primary">{w.message}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {w.affectedComponents.slice(0, 3).map((cid) => (
                            <Link
                              key={cid}
                              to={`/anatomy?component=${cid}`}
                              className="rounded border border-subtle bg-surface px-2 py-0.5 text-[11px] text-text-primary hover:border-cyan-accent"
                            >
                              {COMPONENT_MAP[cid]?.officialName ?? cid}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {/* Paired 3D Turbine-Generator Cutaway */}
              <Panel className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-subtle px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-2 font-medium text-text-primary">
                    <Cpu className="h-4 w-4 text-cyan-accent" />
                    Synchronized 3D Cutaway (Live Gate Angle, Flow & Rotor Speed)
                  </div>
                  <Link to="/insights" className="text-cyan-accent hover:underline font-medium">
                    Analyze Operating Point in Insights →
                  </Link>
                </div>
                <div className="h-[300px] sm:h-[340px] w-full bg-canvas">
                  <WebGLBoundary selectedComponentId="comp-runner">
                    <PlantScene
                      cameraPresetKey="cam-preset-turbine-cutaway"
                      transparentIds={['comp-spiral-casing']}
                      highlightedIds={['comp-guide-vanes', 'comp-runner', 'comp-rotor']}
                      flowMode="turbine"
                      guideVaneOpeningPct={input.guideVaneOpeningPct}
                      flowRateM3s={output.actualFlowRateM3s}
                      angularSpeedRadS={output.angularSpeedRadS}
                      electricalPowerW={output.electricalGeneratedPowerW}
                    />
                  </WebGLBoundary>
                </div>
              </Panel>

              {/* 2x2 Recharts Grid */}
              <SimulationCharts
                output={output}
                efficiencyCurve={efficiencyCurve}
                history={history}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
