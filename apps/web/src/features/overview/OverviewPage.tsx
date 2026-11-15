import { Suspense, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Gauge, Layers, Play } from 'lucide-react';
import {
  COMPONENT_MAP,
  PLANT_CONFIG,
  SUBSYSTEMS,
} from '@/services/dataLoader';
import { formatFlowM3s, formatHeadM, formatPowerMW, formatRpm } from '@/services/formatters';
import { PlantScene } from '@/components-3d/PlantScene';
import { WebGLBoundary } from '@/components/WebGLBoundary';
import { Badge, Button, LoadingState, Panel } from '@/components/ui/Primitives';
import { useAnatomyStore } from '@/stores/anatomyStore';
import type { ComponentId } from '@/types/domain';

const CONVERSION_CHAIN = [
  { step: '01', label: 'Water Source', detail: 'Reservoir headwater elevation', compId: 'comp-reservoir' as ComponentId },
  { step: '02', label: 'Water Intake', detail: 'Trash rack & bellmouth', compId: 'comp-water-intake' as ComponentId },
  { step: '03', label: 'Conveyance', detail: 'Tunnel, surge tank & penstock', compId: 'comp-penstock' as ComponentId },
  { step: '04', label: 'Francis Turbine', detail: 'Spiral casing, vanes & runner', compId: 'comp-runner' as ComponentId },
  { step: '05', label: 'Generator', detail: '24-pole synchronous AC', compId: 'comp-rotor' as ComponentId },
  { step: '06', label: 'Electrical Output', detail: 'Step-up transformer & grid', compId: 'comp-step-up-transformer' as ComponentId },
  { step: '07', label: 'Water Discharge', detail: 'Draft tube & tailrace return', compId: 'comp-tailrace' as ComponentId },
];

export function OverviewPage() {
  const navigate = useNavigate();
  const selectComponent = useAnatomyStore((s) => s.selectComponent);
  const setCameraPreset = useAnatomyStore((s) => s.setCameraPreset);
  const [hoveredId, setHoveredId] = useState<ComponentId | null>(null);

  const hoveredMeta = hoveredId ? COMPONENT_MAP[hoveredId] : null;

  const handle3DSelect = (id: ComponentId) => {
    selectComponent(id, { focusCamera: true });
    navigate(`/anatomy?component=${id}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero 3D Viewport */}
      <section className="relative h-[68vh] min-h-[460px] w-full overflow-hidden border-b border-subtle bg-canvas">
        <WebGLBoundary onSelectComponent={handle3DSelect}>
          <Suspense fallback={<LoadingState message="Loading 3D hydroelectric facility..." />}>
            <PlantScene
              cameraPresetKey="cam-preset-full-plant"
              autoOrbit
              flowMode="ambient"
              hoveredId={hoveredId}
              onHoverComponent={setHoveredId}
              onSelectComponent={handle3DSelect}
            />
          </Suspense>
        </WebGLBoundary>

        {/* Left-aligned restrained editorial overlay */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex max-w-xl flex-col justify-between p-5 sm:p-8">
          <div className="pointer-events-auto space-y-3 rounded-md border border-subtle/80 bg-canvas/85 p-5 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cyan">Conventional Hydro · Francis Turbine</Badge>
              <Badge variant="neutral">Single Unit · Educational Digital Twin</Badge>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              DENRYU
            </h1>
            <p className="text-sm font-medium text-cyan-accent">
              Understand. Explore. Deconstruct. Generate.
            </p>
            <p className="text-xs leading-relaxed text-text-secondary sm:text-sm">
              Inspect all 36 mechanical, civil, and electrical components of a conventional
              storage hydroelectric power plant, follow the 9-stage energy conversion chain,
              and test real-time power generation physics.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <Button variant="primary" onClick={() => navigate('/anatomy')}>
                <Layers className="h-4 w-4" />
                <span>Explore Plant Anatomy</span>
              </Button>
              <Button variant="secondary" onClick={() => navigate('/journey')}>
                <Play className="h-4 w-4" />
                <span>Start Energy Journey</span>
              </Button>
              <Button variant="ghost" onClick={() => navigate('/simulator')}>
                <Gauge className="h-4 w-4" />
                <span>Open Simulator</span>
              </Button>
            </div>
          </div>

          <div className="pointer-events-auto hidden sm:inline-flex w-fit items-center gap-2 rounded border border-subtle bg-surface/85 px-3 py-1.5 text-[11px] font-mono text-text-secondary">
            <Compass className="h-3.5 w-3.5 text-cyan-accent" />
            <span>Drag to orbit · Scroll to zoom · Click any 3D structure to inspect</span>
          </div>
        </div>

        {/* Hover component HUD tooltip */}
        {hoveredMeta ? (
          <div className="pointer-events-none absolute right-5 top-5 rounded border border-cyan-accent/50 bg-surface/95 px-3 py-2 shadow-lg">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-accent">
              {hoveredMeta.id}
            </div>
            <div className="text-sm font-semibold text-text-primary">
              {hoveredMeta.officialName}
            </div>
            <div className="text-[11px] text-text-secondary">Click to open in Plant Anatomy</div>
          </div>
        ) : null}
      </section>

      {/* Reference Configuration Strip */}
      <section className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 space-y-8">
        <Panel className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle pb-3 mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Reference Unit Specification — {PLANT_CONFIG.name}
              </h2>
              <p className="text-xs text-text-secondary">{PLANT_CONFIG.disclaimer}</p>
            </div>
            <Badge variant="warning">Illustrative Synthetic Baseline</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded border border-subtle bg-elevated/50 p-3">
              <div className="text-[11px] font-mono uppercase text-text-muted">Rated Net Head</div>
              <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-water-accent">
                {formatHeadM(PLANT_CONFIG.nominalSpecs.ratedNetHeadM)}
              </div>
            </div>
            <div className="rounded border border-subtle bg-elevated/50 p-3">
              <div className="text-[11px] font-mono uppercase text-text-muted">Nominal Flow</div>
              <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-water-accent">
                {formatFlowM3s(PLANT_CONFIG.nominalSpecs.ratedFlowRateM3s)}
              </div>
            </div>
            <div className="rounded border border-subtle bg-elevated/50 p-3">
              <div className="text-[11px] font-mono uppercase text-text-muted">Scenario A Output</div>
              <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-energy-accent">
                {formatPowerMW(PLANT_CONFIG.nominalSpecs.nominalElectricalOutputW)}
              </div>
            </div>
            <div className="rounded border border-subtle bg-elevated/50 p-3">
              <div className="text-[11px] font-mono uppercase text-text-muted">Sync Speed</div>
              <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-cyan-accent">
                {formatRpm(PLANT_CONFIG.nominalSpecs.synchronousSpeedRpm)}
              </div>
            </div>
            <div className="rounded border border-subtle bg-elevated/50 p-3">
              <div className="text-[11px] font-mono uppercase text-text-muted">Grid Frequency</div>
              <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-text-primary">
                {PLANT_CONFIG.nominalSpecs.gridFrequencyHz} Hz
              </div>
            </div>
            <div className="rounded border border-subtle bg-elevated/50 p-3">
              <div className="text-[11px] font-mono uppercase text-text-muted">Salient Poles</div>
              <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-text-primary">
                {PLANT_CONFIG.nominalSpecs.poleCount} poles
              </div>
            </div>
          </div>
        </Panel>

        {/* Complete Generation Process Strip */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Water-to-Grid Energy Conversion Chain
              </h2>
              <p className="text-xs text-text-secondary">
                Select any physical milestone to jump directly to that component in 3D Plant Anatomy.
              </p>
            </div>
            <Link
              to="/journey"
              className="inline-flex items-center gap-1 text-xs font-medium text-cyan-accent hover:underline"
            >
              <span>Follow 9-Stage Guided Journey</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
            {CONVERSION_CHAIN.map((item) => (
              <button
                key={item.step}
                type="button"
                onClick={() => handle3DSelect(item.compId)}
                className="flex flex-col justify-between rounded-md border border-subtle bg-surface p-3 text-left transition-colors hover:border-cyan-accent/60 hover:bg-elevated/70"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-accent">
                  Stage {item.step}
                </span>
                <span className="mt-1 text-sm font-semibold text-text-primary">{item.label}</span>
                <span className="mt-0.5 text-[11px] text-text-secondary">{item.detail}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 6 Subsystem Portal Cards */}
        <div className="space-y-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Six Plant Subsystems (36 Canonical Components)
            </h2>
            <p className="text-xs text-text-secondary">
              Enter any subsystem directly with pre-framed 3D camera inspection.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SUBSYSTEMS.map((sub) => (
              <Panel
                key={sub.id}
                className="flex flex-col justify-between p-4 transition-colors hover:border-cyan-accent/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="cyan">Subsystem {sub.code}</Badge>
                    <span className="font-mono text-xs text-text-muted">
                      {sub.componentIds.length} components
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-base font-semibold text-text-primary">
                    {sub.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">{sub.summary}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-subtle pt-3">
                  <span className="font-mono text-[11px] text-text-muted">{sub.id}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const firstComp = sub.componentIds[0];
                      selectComponent(firstComp);
                      setCameraPreset(sub.cameraPresetKey);
                      navigate(`/anatomy?component=${firstComp}`);
                    }}
                  >
                    <span>Inspect Subsystem</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
