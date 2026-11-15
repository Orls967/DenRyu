import { create } from 'zustand';
import { JOURNEY_STAGES, STAGE_MAP } from '@/services/dataLoader';
import type { EnergyJourneyStageId } from '@/types/domain';

interface JourneyState {
  currentStageId: EnergyJourneyStageId;
  currentStageIndex: number;
  stageStatus: 'idle' | 'entering' | 'active' | 'completed';
  playbackStatus: 'paused' | 'playing' | 'completed';
  transitionStatus: 'settled' | 'camera_transitioning';
  userCameraOverride: boolean;
  recenterTick: number;

  goToStage: (stageId: EnergyJourneyStageId) => void;
  goToIndex: (index: number) => void;
  nextStage: () => void;
  prevStage: () => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  replay: () => void;
  completeJourney: () => void;
  setUserCameraOverride: (override: boolean) => void;
  recenterCamera: () => void;
  setTransitionStatus: (status: 'settled' | 'camera_transitioning') => void;
}

export const useJourneyStore = create<JourneyState>((set, get) => ({
  currentStageId: JOURNEY_STAGES[0].id,
  currentStageIndex: 0,
  stageStatus: 'active',
  playbackStatus: 'paused',
  transitionStatus: 'settled',
  userCameraOverride: false,
  recenterTick: 0,

  goToStage: (stageId) => {
    const stage = STAGE_MAP[stageId];
    if (!stage) return;
    set((s) => ({
      currentStageId: stage.id,
      currentStageIndex: stage.order - 1,
      stageStatus: 'active',
      playbackStatus: s.playbackStatus === 'completed' ? 'paused' : s.playbackStatus,
      transitionStatus: 'camera_transitioning',
      userCameraOverride: false,
      recenterTick: s.recenterTick + 1,
    }));
  },

  goToIndex: (index) => {
    const clamped = Math.max(0, Math.min(JOURNEY_STAGES.length - 1, index));
    get().goToStage(JOURNEY_STAGES[clamped].id);
  },

  nextStage: () => {
    const { currentStageIndex, playbackStatus } = get();
    if (currentStageIndex < JOURNEY_STAGES.length - 1) {
      get().goToIndex(currentStageIndex + 1);
    } else if (playbackStatus === 'playing') {
      set({ playbackStatus: 'completed', stageStatus: 'completed' });
    }
  },

  prevStage: () => {
    const { currentStageIndex } = get();
    if (currentStageIndex > 0) {
      get().goToIndex(currentStageIndex - 1);
    }
  },

  play: () =>
    set((s) => {
      if (s.playbackStatus === 'completed' || s.currentStageIndex >= JOURNEY_STAGES.length - 1) {
        return {
          currentStageId: JOURNEY_STAGES[0].id,
          currentStageIndex: 0,
          stageStatus: 'active',
          playbackStatus: 'playing',
          transitionStatus: 'camera_transitioning',
          userCameraOverride: false,
          recenterTick: s.recenterTick + 1,
        };
      }
      return { playbackStatus: 'playing', stageStatus: 'active' };
    }),

  pause: () => set({ playbackStatus: 'paused' }),

  togglePlay: () => {
    const { playbackStatus, play, pause } = get();
    if (playbackStatus === 'playing') {
      pause();
    } else {
      play();
    }
  },

  replay: () =>
    set((s) => ({
      currentStageId: JOURNEY_STAGES[0].id,
      currentStageIndex: 0,
      stageStatus: 'active',
      playbackStatus: 'playing',
      transitionStatus: 'camera_transitioning',
      userCameraOverride: false,
      recenterTick: s.recenterTick + 1,
    })),

  completeJourney: () =>
    set({
      playbackStatus: 'completed',
      stageStatus: 'completed',
      transitionStatus: 'settled',
    }),

  setUserCameraOverride: (override) => set({ userCameraOverride: override }),

  recenterCamera: () =>
    set((s) => ({
      userCameraOverride: false,
      transitionStatus: 'camera_transitioning',
      recenterTick: s.recenterTick + 1,
    })),

  setTransitionStatus: (status) => set({ transitionStatus: status }),
}));
