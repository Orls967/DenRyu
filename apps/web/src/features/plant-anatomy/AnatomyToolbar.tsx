import { Boxes, Eye, Focus, Layers, RotateCcw, Scissors, Tag } from 'lucide-react';
import { ANATOMY_CAMERA_MENU } from '@/components-3d/presets';
import { COMPONENT_MAP } from '@/services/dataLoader';
import { useAnatomyStore } from '@/stores/anatomyStore';
import type { RunnerInspectionMode } from '@/types/domain';
import { Button } from '@/components/ui/Primitives';

const RUNNER_MODES: { id: RunnerInspectionMode; label: string; shortHint: string }[] = [
  { id: 'normal', label: 'Normal', shortHint: 'Assembled Francis runner & volute' },
  { id: 'exploded', label: 'Exploded Assembly', shortHint: 'Axial separation of crown, blades, band & cone' },
  { id: 'cross_section', label: 'Cross-Section', shortHint: 'Transparent spiral shell revealing internal vane geometry' },
  { id: 'blade_inspection', label: 'Blade Close-Up', shortHint: 'Highlight radial inlet-to-axial outlet double curvature' },
  { id: 'water_flow', label: 'Flow Path', shortHint: 'Animated tangential-to-axial hydraulic streamlines' },
];

export function AnatomyToolbar() {
  const selectedComponentId = useAnatomyStore((s) => s.selectedComponentId);
  const isolatedComponentId = useAnatomyStore((s) => s.isolatedComponentId);
  const explodeFactor = useAnatomyStore((s) => s.explodeFactor);
  const sectionCut = useAnatomyStore((s) => s.sectionCut);
  const showLabels = useAnatomyStore((s) => s.showLabels);
  const activeCameraPreset = useAnatomyStore((s) => s.activeCameraPreset);
  const runnerMode = useAnatomyStore((s) => s.runnerMode);

  const setCameraPreset = useAnatomyStore((s) => s.setCameraPreset);
  const setExplodeFactor = useAnatomyStore((s) => s.setExplodeFactor);
  const setSectionCut = useAnatomyStore((s) => s.setSectionCut);
  const toggleIsolateSelected = useAnatomyStore((s) => s.toggleIsolateSelected);
  const setShowLabels = useAnatomyStore((s) => s.setShowLabels);
  const setRunnerMode = useAnatomyStore((s) => s.setRunnerMode);
  const resetAnatomyView = useAnatomyStore((s) => s.resetAnatomyView);

  const selectedComp = selectedComponentId ? COMPONENT_MAP[selectedComponentId] : null;
  const showRunnerBar = Boolean(selectedComp?.supportsRunnerModes);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-subtle bg-surface/95 px-3 py-2 backdrop-blur">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-cyan-accent" />
          <label htmlFor="anatomy-camera-preset" className="sr-only">
            Camera preset
          </label>
          <select
            id="anatomy-camera-preset"
            value={activeCameraPreset}
            onChange={(e) => setCameraPreset(e.target.value)}
            className="rounded border border-subtle bg-canvas px-2 py-1 text-xs text-text-primary focus:border-cyan-accent focus:outline-none"
          >
            {ANATOMY_CAMERA_MENU.map((preset) => (
              <option key={preset.key} value={preset.key}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 border-l border-subtle pl-2">
          <Boxes className="h-3.5 w-3.5 text-text-muted" />
          <label htmlFor="anatomy-explode-slider" className="text-[11px] font-mono text-text-secondary">
            Explode {Math.round(explodeFactor * 100)}%
          </label>
          <input
            id="anatomy-explode-slider"
            type="range"
            min={0}
            max={100}
            value={Math.round(explodeFactor * 100)}
            onChange={(e) => setExplodeFactor(Number(e.target.value) / 100)}
            className="h-1.5 w-20 accent-[#36C5D9]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-l border-subtle pl-2">
          <Button
            size="sm"
            variant={sectionCut.enabled ? 'primary' : 'secondary'}
            aria-pressed={sectionCut.enabled}
            onClick={() => setSectionCut({ enabled: !sectionCut.enabled })}
          >
            <Scissors className="h-3.5 w-3.5" />
            Section Cut
          </Button>
          {sectionCut.enabled ? (
            <>
              {(['x', 'y', 'z'] as const).map((axis) => (
                <button
                  key={axis}
                  type="button"
                  onClick={() => setSectionCut({ axis })}
                  className={`rounded px-1.5 py-0.5 text-[11px] font-mono uppercase border ${
                    sectionCut.axis === axis
                      ? 'border-cyan-accent bg-cyan-accent/15 text-cyan-accent'
                      : 'border-subtle bg-canvas text-text-secondary'
                  }`}
                >
                  {axis}
                </button>
              ))}
              <input
                aria-label="Section cut offset"
                type="range"
                min={0}
                max={100}
                value={sectionCut.positionPct}
                onChange={(e) => setSectionCut({ positionPct: Number(e.target.value) })}
                className="h-1.5 w-20 accent-[#36C5D9]"
              />
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 border-l border-subtle pl-2">
          <Button
            size="sm"
            variant={isolatedComponentId ? 'primary' : 'secondary'}
            aria-pressed={Boolean(isolatedComponentId)}
            disabled={!selectedComponentId && !isolatedComponentId}
            onClick={toggleIsolateSelected}
          >
            {isolatedComponentId ? <Eye className="h-3.5 w-3.5" /> : <Focus className="h-3.5 w-3.5" />}
            {isolatedComponentId ? 'Show All' : 'Isolate'}
          </Button>

          <Button
            size="sm"
            variant={showLabels ? 'primary' : 'secondary'}
            aria-pressed={showLabels}
            onClick={() => setShowLabels(!showLabels)}
          >
            <Tag className="h-3.5 w-3.5" />
            Labels
          </Button>

          <Button size="sm" variant="ghost" onClick={resetAnatomyView} title="Reset anatomy view">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {showRunnerBar ? (
        <div
          role="region"
          aria-label="Francis Runner Inspection Modes"
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-energy-accent/40 bg-surface/95 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-energy-accent">
              Francis Runner Inspection
            </span>
            <span className="hidden text-xs text-text-muted sm:inline">
              {RUNNER_MODES.find((m) => m.id === runnerMode)?.shortHint}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {RUNNER_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                aria-pressed={runnerMode === mode.id}
                onClick={() => setRunnerMode(mode.id)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors border ${
                  runnerMode === mode.id
                    ? 'border-energy-accent bg-energy-accent/20 text-energy-accent'
                    : 'border-subtle bg-elevated/70 text-text-secondary hover:text-text-primary'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
