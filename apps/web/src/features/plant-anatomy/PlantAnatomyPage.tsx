import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlantScene } from '@/components-3d/PlantScene';
import { WebGLBoundary } from '@/components/WebGLBoundary';
import { COMPONENT_MAP } from '@/services/dataLoader';
import { useAnatomyStore } from '@/stores/anatomyStore';
import type { ComponentId, RunnerInspectionMode } from '@/types/domain';
import { AnatomyToolbar } from '@/features/plant-anatomy/AnatomyToolbar';
import { ComponentInspector } from '@/features/plant-anatomy/ComponentInspector';
import { HierarchyTree } from '@/features/plant-anatomy/HierarchyTree';

type MobilePane = 'tree' | 'viewport' | 'inspector';

const VALID_RUNNER_MODES = new Set<RunnerInspectionMode>([
  'normal',
  'exploded',
  'cross_section',
  'blade_inspection',
  'water_flow',
]);

export function PlantAnatomyPage() {
  const [searchParams] = useSearchParams();
  const [mobilePane, setMobilePane] = useState<MobilePane>('viewport');

  const selectedComponentId = useAnatomyStore((s) => s.selectedComponentId);
  const hoveredComponentId = useAnatomyStore((s) => s.hoveredComponentId);
  const hiddenComponentIds = useAnatomyStore((s) => s.hiddenComponentIds);
  const isolatedComponentId = useAnatomyStore((s) => s.isolatedComponentId);
  const explodeFactor = useAnatomyStore((s) => s.explodeFactor);
  const sectionCut = useAnatomyStore((s) => s.sectionCut);
  const showLabels = useAnatomyStore((s) => s.showLabels);
  const activeCameraPreset = useAnatomyStore((s) => s.activeCameraPreset);
  const cameraResetTick = useAnatomyStore((s) => s.cameraResetTick);
  const runnerMode = useAnatomyStore((s) => s.runnerMode);

  const selectComponent = useAnatomyStore((s) => s.selectComponent);
  const setHoveredComponent = useAnatomyStore((s) => s.setHoveredComponent);
  const setRunnerMode = useAnatomyStore((s) => s.setRunnerMode);

  useEffect(() => {
    const compParam = searchParams.get('component');
    if (compParam && compParam in COMPONENT_MAP) {
      selectComponent(compParam as ComponentId, { focusCamera: true });
    }
    const modeParam = searchParams.get('mode') as RunnerInspectionMode | null;
    if (modeParam && VALID_RUNNER_MODES.has(modeParam)) {
      setRunnerMode(modeParam);
    }
  }, [searchParams, selectComponent, setRunnerMode]);

  const highlightedIds = useMemo(
    () => (selectedComponentId ? [selectedComponentId] : []),
    [selectedComponentId],
  );

  const flowMode =
    runnerMode === 'water_flow'
      ? 'water_flow_runner'
      : runnerMode === 'blade_inspection' || runnerMode === 'cross_section'
        ? 'none'
        : 'ambient';

  const handle3DSelect = (id: ComponentId) => {
    selectComponent(id, { focusCamera: false });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] min-h-[600px]">
      {/* Mobile / Tablet Pane Switcher (< lg) */}
      <div className="flex items-center border-b border-subtle bg-surface px-3 py-1.5 lg:hidden">
        {(
          [
            { id: 'tree', label: 'Hierarchy (36)' },
            { id: 'viewport', label: '3D Plant' },
            { id: 'inspector', label: 'Inspector' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMobilePane(tab.id)}
            className={`flex-1 rounded px-2 py-1.5 text-xs font-medium ${
              mobilePane === tab.id
                ? 'bg-cyan-accent/15 text-cyan-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop 3-Pane / Responsive Single-Pane Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)_380px] overflow-hidden">
        <aside
          className={`${mobilePane === 'tree' ? 'block' : 'hidden'} lg:block h-full overflow-hidden`}
        >
          <HierarchyTree />
        </aside>

        <section
          className={`${
            mobilePane === 'viewport' ? 'flex' : 'hidden'
          } lg:flex relative flex-col h-full bg-canvas overflow-hidden`}
        >
          <div className="p-2.5 z-10">
            <AnatomyToolbar />
          </div>
          <div className="relative flex-1 min-h-[340px]">
            <WebGLBoundary
              selectedComponentId={selectedComponentId}
              highlightedComponentIds={highlightedIds}
              onSelectComponent={handle3DSelect}
            >
              <PlantScene
                cameraPresetKey={activeCameraPreset}
                cameraResetTick={cameraResetTick}
                explodeFactor={explodeFactor}
                sectionCut={sectionCut}
                hiddenIds={hiddenComponentIds}
                isolatedId={isolatedComponentId}
                selectedId={selectedComponentId}
                hoveredId={hoveredComponentId}
                highlightedIds={highlightedIds}
                showLabels={showLabels}
                runnerMode={runnerMode}
                flowMode={flowMode}
                onSelectComponent={handle3DSelect}
                onHoverComponent={setHoveredComponent}
              />
            </WebGLBoundary>
          </div>
        </section>

        <aside
          className={`${
            mobilePane === 'inspector' ? 'block' : 'hidden'
          } lg:block h-full overflow-hidden`}
        >
          <ComponentInspector />
        </aside>
      </div>
    </div>
  );
}
