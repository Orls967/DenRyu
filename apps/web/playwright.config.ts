import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: {
    timeout: 12_000,
  },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173/DenRyu/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
    },
  },
  webServer: {
    command: 'VITE_BASE_PATH=/DenRyu/ npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/DenRyu/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
