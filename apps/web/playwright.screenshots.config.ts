import { defineConfig, devices } from '@playwright/test';

/**
 * README screenshot gallery (not part of CI).
 *
 *   SHOTS_BASE_URL=https://orls967.github.io/DenRyu/ npm run screenshots
 *
 * Images are written to ../../docs/screenshots/.
 */
export default defineConfig({
  testDir: './screenshots',
  timeout: 400_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: process.env.SHOTS_BASE_URL ?? 'https://orls967.github.io/DenRyu/',
    colorScheme: 'dark',
    actionTimeout: 20_000,
    reducedMotion: 'no-preference',
    launchOptions: { args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] },
  },
  projects: [
    {
      name: 'desktop',
      testMatch: /capture\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    },
  ],
});
