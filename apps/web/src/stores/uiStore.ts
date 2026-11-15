import { create } from 'zustand';

interface UiState {
  reducedMotion: boolean;
  webglSupported: boolean;
  webglContextLost: boolean;
  mobileNavOpen: boolean;
  setReducedMotion: (val: boolean) => void;
  toggleReducedMotion: () => void;
  setWebglSupported: (val: boolean) => void;
  setWebglContextLost: (val: boolean) => void;
  setMobileNavOpen: (val: boolean) => void;
}

function detectReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function detectWebGL2Support(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    return Boolean(gl);
  } catch {
    return false;
  }
}

export const useUiStore = create<UiState>((set) => ({
  reducedMotion: detectReducedMotion(),
  webglSupported: detectWebGL2Support(),
  webglContextLost: false,
  mobileNavOpen: false,
  setReducedMotion: (val) => set({ reducedMotion: val }),
  toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
  setWebglSupported: (val) => set({ webglSupported: val }),
  setWebglContextLost: (val) => set({ webglContextLost: val }),
  setMobileNavOpen: (val) => set({ mobileNavOpen: val }),
}));
