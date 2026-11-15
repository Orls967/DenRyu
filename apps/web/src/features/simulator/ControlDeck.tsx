import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import { SCENARIO_PRESETS } from '@/services/dataLoader';
import { useSimulatorStore } from '@/stores/simulatorStore';
import type { EfficiencyMode, OperatingCondition } from '@/types/domain';
import { Badge, Button, Panel } from '@/components/ui/Primitives';

interface SliderControlProps {
  id: string;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  error?: string;
  onChange: (value: number) => void;
}

function ParameterSliderInput({
  id,
  label,
  unit,
  value,
  min,
  max,
  step,
  error,
  onChange,
}: SliderControlProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <label htmlFor={id} className="font-medium text-text-primary">
          {label}
        </label>
        <div className="flex items-center gap-1">
          <input
            id={id}
            type="number"
            value={Number.isFinite(value) ? value : 0}
            step={step}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              if (Number.isFinite(parsed)) onChange(parsed);
            }}
            className={`w-20 rounded border bg-canvas px-1.5 py-0.5 text-right font-mono text-xs text-text-primary focus:outline-none ${
              error ? 'border-status-error text-status-error' : 'border-subtle focus:border-cyan-accent'
            }`}
          />
          <span className="w-9 font-mono text-[11px] text-text-muted">{unit}</span>
        </div>
      </div>
      <input
        aria-label={`${label} slider`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.max(min, Math.min(max, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full accent-[#36C5D9]"
      />
      {error ? (
        <p role="alert" className="text-[11px] text-status-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const OPERATING_CONDITIONS: { value: OperatingCondition; label: string }[] = [
  { value: 'normal', label: 'Normal Grid-Tied' },
  { value: 'partial_load', label: 'Partial Load' },
  { value: 'high_load', label: 'High Load Dispatch' },
  { value: 'startup', label: 'Startup (Speed-No-Load)' },
  { value: 'shutdown', label: 'Controlled Shutdown' },
];

export function ControlDeck() {
  const input = useSimulatorStore((s) => s.input);
  const activeScenarioId = useSimulatorStore((s) => s.activeScenarioId);
  const isRunning = useSimulatorStore((s) => s.isRunning);
  const validationErrors = useSimulatorStore((s) => s.validationErrors);
  const workerStatus = useSimulatorStore((s) => s.workerStatus);

  const updateInput = useSimulatorStore((s) => s.updateInput);
  const applyScenario = useSimulatorStore((s) => s.applyScenario);
  const toggleRunning = useSimulatorStore((s) => s.toggleRunning);
  const stepOnce = useSimulatorStore((s) => s.stepOnce);
  const resetSimulator = useSimulatorStore((s) => s.resetSimulator);

  const readinessDisabled = workerStatus !== 'ready';

  return (
    <Panel className="p-4 space-y-5">
      <div className="flex items-center justify-between border-b border-subtle pb-3">
        <div>
          <h2 className="font-display text-sm font-semibold text-text-primary">
            Operating Controls
          </h2>
          <p className="text-[11px] text-text-muted">Executed in Rust/WASM Web Worker</p>
        </div>
        <Badge variant={activeScenarioId === 'custom' ? 'energy' : 'cyan'}>
          {activeScenarioId === 'custom'
            ? 'Custom'
            : SCENARIO_PRESETS.find((s) => s.id === activeScenarioId)?.code ?? 'Preset'}
        </Badge>
      </div>

      {/* Time-stepped Execution Controls */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          size="sm"
          variant={isRunning ? 'secondary' : 'primary'}
          disabled={readinessDisabled}
          onClick={toggleRunning}
        >
          {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isRunning ? 'Pause' : 'Run'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={readinessDisabled}
          onClick={() => void stepOnce(1.0)}
        >
          <StepForward className="h-3.5 w-3.5" />
          Step +1s
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={readinessDisabled}
          onClick={() => void resetSimulator()}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Scenario Presets A-F */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
          Canonical Scenarios (A–F)
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {SCENARIO_PRESETS.map((preset) => {
            const active = activeScenarioId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => void applyScenario(preset.id)}
                className={`rounded border px-2 py-1.5 text-left text-xs transition-colors ${
                  active
                    ? 'border-cyan-accent bg-cyan-accent/15 text-cyan-accent font-medium'
                    : 'border-subtle bg-elevated/50 text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="font-mono text-[10px] mr-1">{preset.code}</span>
                <span className="truncate">{preset.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders & Inputs */}
      <div className="space-y-3.5 border-t border-subtle pt-3">
        <ParameterSliderInput
          id="sim-net-head"
          label="Net Head (H)"
          unit="m"
          value={input.netHeadM}
          min={0}
          max={150}
          step={0.5}
          error={validationErrors.netHeadM}
          onChange={(v) => void updateInput({ netHeadM: v })}
        />

        <ParameterSliderInput
          id="sim-flow-rate"
          label="Requested Flow (Q)"
          unit="m³/s"
          value={input.requestedFlowRateM3s}
          min={0}
          max={80}
          step={0.5}
          error={validationErrors.requestedFlowRateM3s}
          onChange={(v) => void updateInput({ requestedFlowRateM3s: v })}
        />

        <ParameterSliderInput
          id="sim-guide-vane"
          label="Guide Vane Opening"
          unit="%"
          value={input.guideVaneOpeningPct}
          min={0}
          max={100}
          step={1}
          error={validationErrors.guideVaneOpeningPct}
          onChange={(v) => void updateInput({ guideVaneOpeningPct: v })}
        />

        <ParameterSliderInput
          id="sim-requested-load"
          label="Requested Grid Load"
          unit="MW"
          value={Number((input.requestedLoadW / 1_000_000).toFixed(2))}
          min={0}
          max={60}
          step={0.5}
          error={validationErrors.requestedLoadW}
          onChange={(mw) => void updateInput({ requestedLoadW: mw * 1_000_000 })}
        />

        <ParameterSliderInput
          id="sim-turbine-eff"
          label="Turbine Peak Ref η"
          unit="—"
          value={input.turbineEfficiencyRef}
          min={0.5}
          max={0.98}
          step={0.01}
          error={validationErrors.turbineEfficiencyRef}
          onChange={(v) => void updateInput({ turbineEfficiencyRef: v })}
        />

        <ParameterSliderInput
          id="sim-generator-eff"
          label="Generator Peak Ref η"
          unit="—"
          value={input.generatorEfficiencyRef}
          min={0.8}
          max={0.99}
          step={0.005}
          error={validationErrors.generatorEfficiencyRef}
          onChange={(v) => void updateInput({ generatorEfficiencyRef: v })}
        />
      </div>

      {/* Mode & Condition Selectors */}
      <div className="space-y-3 border-t border-subtle pt-3 text-xs">
        <div className="space-y-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Efficiency Model
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: 'operating_curve', label: 'Operating Curve' },
                { id: 'fixed_manual', label: 'Fixed Manual' },
              ] as { id: EfficiencyMode; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={input.efficiencyMode === opt.id}
                onClick={() => void updateInput({ efficiencyMode: opt.id })}
                className={`rounded border px-2 py-1.5 font-medium ${
                  input.efficiencyMode === opt.id
                    ? 'border-cyan-accent bg-cyan-accent/15 text-cyan-accent'
                    : 'border-subtle bg-canvas text-text-secondary hover:text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="sim-operating-condition"
            className="font-mono text-[11px] uppercase tracking-wider text-text-muted"
          >
            Operating Condition
          </label>
          <select
            id="sim-operating-condition"
            value={input.operatingCondition}
            onChange={(e) =>
              void updateInput({ operatingCondition: e.target.value as OperatingCondition })
            }
            className="w-full rounded border border-subtle bg-canvas px-2.5 py-1.5 text-xs text-text-primary focus:border-cyan-accent focus:outline-none"
          >
            {OPERATING_CONDITIONS.map((cond) => (
              <option key={cond.value} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {validationErrors.general ? (
        <p role="alert" className="rounded border border-status-error/40 bg-status-error/10 p-2 text-xs text-status-error">
          {validationErrors.general}
        </p>
      ) : null}
    </Panel>
  );
}
