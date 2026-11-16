import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Cpu,
  LocateFixed,
  Pause,
  Play,
  RotateCcw,
  Wrench,
} from 'lucide-react';
import { PlantScene } from '@/components-3d/PlantScene';
import { WebGLBoundary } from '@/components/WebGLBoundary';
import { KaTeXFormula } from '@/components/ui/KaTeXFormula';
import { Badge, Button } from '@/components/ui/Primitives';
import { COMPONENT_MAP, JOURNEY_STAGES, STAGE_MAP } from '@/services/dataLoader';
import { useJourneyStore } from '@/stores/journeyStore';
import type { EnergyJourneyStageId } from '@/types/domain';

export function EnergyJourneyPage() {
  const [searchParams] = useSearchParams();

  const currentStageId = useJourneyStore((s) => s.currentStageId);
  const currentStageIndex = useJourneyStore((s) => s.currentStageIndex);
  const playbackStatus = useJourneyStore((s) => s.playbackStatus);
  const userCameraOverride = useJourneyStore((s) => s.userCameraOverride);
  const recenterTick = useJourneyStore((s) => s.recenterTick);

  const goToStage = useJourneyStore((s) => s.goToStage);
  const goToIndex = useJourneyStore((s) => s.goToIndex);
  const nextStage = useJourneyStore((s) => s.nextStage);
  const prevStage = useJourneyStore((s) => s.prevStage);
  const togglePlay = useJourneyStore((s) => s.togglePlay);
  const replay = useJourneyStore((s) => s.replay);
  const setUserCameraOverride = useJourneyStore((s) => s.setUserCameraOverride);
  const recenterCamera = useJourneyStore((s) => s.recenterCamera);
  const setTransitionStatus = useJourneyStore((s) => s.setTransitionStatus);

  const stage = STAGE_MAP[currentStageId] ?? JOURNEY_STAGES[0];

  useEffect(() => {
    const stageParam = searchParams.get('stage');
    if (stageParam && stageParam in STAGE_MAP) {
      goToStage(stageParam as EnergyJourneyStageId);
    }
  }, [searchParams, goToStage]);

  useEffect(() => {
    if (playbackStatus !== 'playing') return;
    const ms = Math.max(2500, (stage.defaultDwellSeconds || 7) * 1000);
    const id = window.setTimeout(() => {
      nextStage();
    }, ms);
    return () => window.clearTimeout(id);
  }, [playbackStatus, stage.id, stage.defaultDwellSeconds, nextStage]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.key === 'ArrowRight') nextStage();
      if (e.key === 'ArrowLeft') prevStage();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [nextStage, prevStage]);

  const isFirst = currentStageIndex === 0;
  const isLast = currentStageIndex === JOURNEY_STAGES.length - 1;

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.5rem)]">
      {/* Main Split: 3D Choreography Stage + Docked Stage Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_410px] overflow-hidden">
        {/* Left 3D Stage */}
        <section className="relative min-h-[340px] lg:min-h-0 bg-canvas overflow-hidden">
          <div className="pointer-events-none absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2">
            <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-md border border-subtle bg-surface/90 px-3 py-1.5 backdrop-blur">
              <Badge variant="cyan">
                Stage 0{stage.order} / 0{JOURNEY_STAGES.length}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-water-accent font-medium">{stage.energyFormFrom}</span>
                <ArrowRight className="h-3.5 w-3.5 text-text-muted" />
                <span className="text-energy-accent font-medium">{stage.energyFormTo}</span>
              </div>
            </div>

            {userCameraOverride ? (
              <div className="pointer-events-auto">
                <Button size="sm" variant="primary" onClick={recenterCamera}>
                  <LocateFixed className="h-3.5 w-3.5" />
                  Re-center Stage Camera
                </Button>
              </div>
            ) : null}
          </div>

          <WebGLBoundary
            selectedComponentId={stage.activeComponentIds[0] ?? null}
            highlightedComponentIds={stage.highlightedComponentIds}
          >
            <PlantScene
              cameraPresetKey={stage.cameraPresetKey}
              cameraResetTick={recenterTick}
              highlightedIds={stage.highlightedComponentIds}
              transparentIds={stage.transparentShellIds}
              flowMode={stage.animationMode}
              onUserOrbitStart={() => setUserCameraOverride(true)}
              onTransitionSettled={() => setTransitionStatus('settled')}
            />
          </WebGLBoundary>
        </section>

        {/* Right Stage Explanation Panel */}
        <aside className="flex flex-col border-t lg:border-t-0 lg:border-l border-subtle bg-surface overflow-y-auto p-4 sm:p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-accent">
                {stage.shortLabel}
              </span>
              <Badge variant={playbackStatus === 'playing' ? 'success' : 'neutral'}>
                {playbackStatus === 'playing'
                  ? 'Auto-Touring'
                  : playbackStatus === 'completed'
                    ? 'Journey Complete'
                    : 'Guided Step'}
              </Badge>
            </div>
            <h1 className="font-display text-xl font-semibold text-text-primary">
              0{stage.order}. {stage.title}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-text-primary">{stage.narrationText}</p>
          </div>

          <div className="rounded-md border border-subtle bg-elevated/50 p-3 space-y-2 text-xs leading-relaxed text-text-secondary">
            <div>
              <span className="font-mono uppercase tracking-wider text-text-muted">
                Physical Process:{' '}
              </span>
              <span className="text-text-primary">{stage.physicalProcess}</span>
            </div>
            <p>{stage.engineeringExplanation}</p>
          </div>

          <div className="rounded-md border border-status-warning/35 bg-status-warning/10 p-3 text-xs">
            <div className="font-mono uppercase tracking-wider text-status-warning mb-1">
              Energy Losses at This Stage
            </div>
            <p className="text-text-secondary leading-relaxed">{stage.lossMechanismSummary}</p>
          </div>

          {stage.equationsLatex.length > 0 ? (
            <div className="space-y-2">
              <h2 className="text-xs font-mono uppercase tracking-wider text-text-muted">
                Governing Relationships
              </h2>
              <div className="space-y-1.5 rounded-md border border-subtle bg-canvas/70 p-3">
                {stage.equationsLatex.map((eq) => (
                  <KaTeXFormula key={eq} latex={eq} displayMode />
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded border border-subtle bg-canvas/40 p-2.5">
              <div className="font-mono text-[10px] uppercase text-text-muted mb-1">Inputs</div>
              <div className="flex flex-wrap gap-1">
                {stage.inputVariables.map((v) => (
                  <span key={v} className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[11px] text-cyan-accent">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded border border-subtle bg-canvas/40 p-2.5">
              <div className="font-mono text-[10px] uppercase text-text-muted mb-1">Outputs</div>
              <div className="flex flex-wrap gap-1">
                {stage.outputVariables.map((v) => (
                  <span key={v} className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[11px] text-energy-accent">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
              Active Plant Components
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {stage.activeComponentIds.map((compId) => {
                const comp = COMPONENT_MAP[compId];
                return (
                  <Link
                    key={compId}
                    to={`/anatomy?component=${compId}`}
                    className="inline-flex items-center gap-1 rounded border border-subtle bg-elevated/70 px-2.5 py-1 text-xs text-text-primary hover:border-cyan-accent hover:text-cyan-accent"
                  >
                    <Wrench className="h-3 w-3 text-cyan-accent" />
                    {comp?.officialName ?? compId}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Stage-specific Context CTAs */}
          {stage.id === 'stage-04-turbine-conversion' ? (
            <Link
              to="/anatomy?component=comp-runner&mode=blade_inspection"
              className="flex items-center justify-between rounded-md border border-energy-accent/40 bg-energy-accent/10 p-3 text-xs font-medium text-energy-accent hover:bg-energy-accent/20"
            >
              <span>Inspect Francis Runner in 5 Interactive Modes</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}

          {stage.id === 'stage-08-power-transmission' ? (
            <Link
              to="/simulator"
              className="flex items-center justify-between rounded-md border border-cyan-accent/40 bg-cyan-accent/10 p-3 text-xs font-medium text-cyan-accent hover:bg-cyan-accent/20"
            >
              <span>Test Load & Dispatch Variations in Simulator</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}

          {isLast ? (
            <div className="rounded-md border border-status-success/40 bg-status-success/10 p-3 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-status-success">
                <Compass className="h-3.5 w-3.5" />
                Complete 9-Stage Energy Loop Reached
              </div>
              <p className="text-xs text-text-secondary">
                Potential head in the reservoir has completed conversion into grid electrical energy and low-velocity tailrace return.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={replay}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Replay Journey
                </Button>
                <Link to="/simulator">
                  <Button size="sm" variant="primary">
                    <Cpu className="h-3.5 w-3.5" />
                    Launch Simulator
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {/* Bottom 9-Stage Timeline & Playback Controls */}
      <footer className="border-t border-subtle bg-surface px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              disabled={isFirst}
              onClick={prevStage}
              aria-label="Previous journey stage"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={togglePlay}
              aria-label={playbackStatus === 'playing' ? 'Pause tour' : 'Play tour'}
            >
              {playbackStatus === 'playing' ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  {playbackStatus === 'completed' ? 'Replay' : 'Play'}
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              disabled={isLast}
              onClick={nextStage}
              aria-label="Next journey stage"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <nav
            aria-label="Energy Journey 9 stages"
            className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 max-w-full"
          >
            {JOURNEY_STAGES.map((st, idx) => {
              const active = st.id === stage.id;
              const visited = idx < currentStageIndex;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => goToIndex(idx)}
                  aria-current={active ? 'step' : undefined}
                  title={`0${st.order}. ${st.title}`}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs whitespace-nowrap border transition-colors ${
                    active
                      ? 'border-cyan-accent bg-cyan-accent/15 text-cyan-accent font-semibold'
                      : visited
                        ? 'border-subtle/80 bg-elevated/60 text-text-primary hover:border-cyan-accent/50'
                        : 'border-subtle/50 bg-canvas/60 text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span className="font-mono text-[10px]">0{st.order}</span>
                  <span className="hidden xl:inline">{st.shortLabel.replace(/^\d+\s*/, '')}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </footer>
    </div>
  );
}
