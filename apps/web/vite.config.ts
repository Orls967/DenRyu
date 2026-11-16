import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'node:path';

export default defineConfig(() => {
  const base = process.env.VITE_BASE_PATH ?? '/';

  return {
    base,
    plugins: [react(), wasm(), topLevelAwait()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@data': path.resolve(__dirname, '../../data'),
      },
    },
    worker: {
      format: 'es',
      plugins: () => [wasm(), topLevelAwait()],
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom', 'zustand'],
            'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
            'vendor-charts': ['recharts'],
            'vendor-katex': ['katex'],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      exclude: ['node_modules', 'dist', 'e2e', 'screenshots'],
    },
  };
});
