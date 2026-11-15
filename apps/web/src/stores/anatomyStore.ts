import { create } from 'zustand';
import { COMPONENT_MAP, SUBSYSTEM_MAP } from '@/services/dataLoader';
import type { ComponentId, RunnerInspectionMode, SubsystemId } from '@/types/domain';

export interface SectionCutState {
  enabled: boolean;
  axis: 'x' | 'y' | 'z';
  positionPct: number;
}

interface AnatomyState {
  selectedComponentId: ComponentId | null;
  hoveredComponentId: ComponentId | null;
  expandedSubsystems: Record<SubsystemId, boolean>;
  hiddenComponentIds: Record<string, boolean>;
  isolatedComponentId: ComponentId | null;
  explodeFactor: number;
  sectionCut: SectionCutState;
  showLabels: boolean;
  autoFocusOnSelect: boolean;
  activeCameraPreset: string;
  cameraResetTick: number;
  runnerMode: RunnerInspectionMode;
  searchQuery: string;

  selectComponent: (id: ComponentId | null, opts?: { focusCamera?: boolean }) => void;
  setHoveredComponent: (id: ComponentId | null) => void;
  toggleSubsystemExpanded: (id: SubsystemId) => void;
  toggleComponentVisibility: (id: ComponentId) => void;
  toggleSubsystemVisibility: (id: SubsystemId) => void;
  setIsolateComponent: (id: ComponentId | null) => void;
  toggleIsolateSelected: () => void;
  setExplodeFactor: (val: number) => void;
  setSectionCut: (partial: Partial<SectionCutState>) => void;
  setShowLabels: (val: boolean) => void;
  setAutoFocusOnSelect: (val: boolean) => void;
  setCameraPreset: (presetKey: string) => void;
  triggerCameraReset: () => void;
  setRunnerMode: (mode: RunnerInspectionMode) => void;
  setSearchQuery: (q: string) => void;
  resetAnatomyView: () => void;
}

const DEFAULT_EXPANDED: Record<SubsystemId, boolean> = {
  'sub-reservoir-dam': true,
  'sub-water-conveyance': true,
  'sub-turbine': true,
  'sub-generator': true,
  'sub-electrical-transmission': true,
  'sub-discharge': true,
};

export const useAnatomyStore = create<AnatomyState>((set, get) => ({
  selectedComponentId: 'comp-runner',
  hoveredComponentId: null,
  expandedSubsystems: { ...DEFAULT_EXPANDED },
  hiddenComponentIds: {},
  isolatedComponentId: null,
  explodeFactor: 0,
  sectionCut: {
    enabled: false,
    axis: 'z',
    positionPct: 50,
  },
  showLabels: false,
  autoFocusOnSelect: true,
  activeCameraPreset: 'cam-preset-full-plant',
  cameraResetTick: 0,
  runnerMode: 'normal',
  searchQuery: '',

  selectComponent: (id, opts) => {
    set((s) => {
      const nextExpanded = { ...s.expandedSubsystems };
      if (id && COMPONENT_MAP[id]) {
        nextExpanded[COMPONENT_MAP[id].subsystemId] = true;
      }
      const nextRunnerMode =
        id && COMPONENT_MAP[id]?.supportsRunnerModes ? s.runnerMode : 'normal';
      return {
        selectedComponentId: id,
        expandedSubsystems: nextExpanded,
        runnerMode: nextRunnerMode,
        cameraResetTick: opts?.focusCamera ? s.cameraResetTick + 1 : s.cameraResetTick,
      };
    });
  },

  setHoveredComponent: (id) => set({ hoveredComponentId: id }),

  toggleSubsystemExpanded: (id) =>
    set((s) => ({
      expandedSubsystems: {
        ...s.expandedSubsystems,
        [id]: !s.expandedSubsystems[id],
      },
    })),

  toggleComponentVisibility: (id) =>
    set((s) => ({
      hiddenComponentIds: {
        ...s.hiddenComponentIds,
        [id]: !s.hiddenComponentIds[id],
      },
    })),

  toggleSubsystemVisibility: (id) =>
    set((s) => {
      const sub = SUBSYSTEM_MAP[id];
      if (!sub) return s;
      const allHidden = sub.componentIds.every((cid) => s.hiddenComponentIds[cid]);
      const nextHidden = { ...s.hiddenComponentIds };
      for (const cid of sub.componentIds) {
        nextHidden[cid] = !allHidden;
      }
      return { hiddenComponentIds: nextHidden };
    }),

  setIsolateComponent: (id) => set({ isolatedComponentId: id }),

  toggleIsolateSelected: () => {
    const { selectedComponentId, isolatedComponentId } = get();
    if (!selectedComponentId) {
      set({ isolatedComponentId: null });
      return;
    }
    set({
      isolatedComponentId:
        isolatedComponentId === selectedComponentId ? null : selectedComponentId,
    });
  },

  setExplodeFactor: (val) =>
    set({ explodeFactor: Math.max(0, Math.min(1, Number.isFinite(val) ? val : 0)) }),

  setSectionCut: (partial) =>
    set((s) => ({
      sectionCut: {
        ...s.sectionCut,
        ...partial,
      },
    })),

  setShowLabels: (val) => set({ showLabels: val }),
  setAutoFocusOnSelect: (val) => set({ autoFocusOnSelect: val }),

  setCameraPreset: (presetKey) =>
    set((s) => ({
      activeCameraPreset: presetKey,
      cameraResetTick: s.cameraResetTick + 1,
    })),

  triggerCameraReset: () =>
    set((s) => ({
      activeCameraPreset: 'cam-preset-full-plant',
      cameraResetTick: s.cameraResetTick + 1,
    })),

  setRunnerMode: (mode) =>
    set((s) => {
      const next: Partial<AnatomyState> = { runnerMode: mode };
      if (mode === 'normal') {
        next.explodeFactor = 0;
        next.isolatedComponentId = null;
        next.sectionCut = { ...s.sectionCut, enabled: false };
      } else if (mode === 'exploded') {
        next.explodeFactor = 0.85;
        next.isolatedComponentId = null;
        next.sectionCut = { ...s.sectionCut, enabled: false };
      } else if (mode === 'cross_section') {
        next.explodeFactor = 0;
        next.isolatedComponentId = null;
        next.sectionCut = { enabled: true, axis: 'z', positionPct: 50 };
      } else if (mode === 'blade_inspection') {
        next.explodeFactor = 0;
        next.isolatedComponentId = 'comp-runner-blades';
        next.sectionCut = { ...s.sectionCut, enabled: false };
      } else if (mode === 'water_flow') {
        next.explodeFactor = 0;
        next.isolatedComponentId = null;
        next.sectionCut = { ...s.sectionCut, enabled: false };
      }
      return { ...s, ...next };
    }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  resetAnatomyView: () =>
    set((s) => ({
      hiddenComponentIds: {},
      isolatedComponentId: null,
      explodeFactor: 0,
      sectionCut: { enabled: false, axis: 'z', positionPct: 50 },
      runnerMode: 'normal',
      activeCameraPreset: 'cam-preset-full-plant',
      cameraResetTick: s.cameraResetTick + 1,
    })),
}));
