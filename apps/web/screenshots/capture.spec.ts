import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { expect, test, type Locator, type Page } from '@playwright/test';

const OUT_DIR = path.resolve(process.cwd(), '../../docs/screenshots');
mkdirSync(OUT_DIR, { recursive: true });
const file = (name: string) => path.join(OUT_DIR, `${name}.png`);

async function settle(page: Page, ms = 1500) {
  await page.waitForTimeout(ms);
}

async function shot(page: Page, name: string, fullPage = false) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: file(name), fullPage });
}

async function shotOf(locator: Locator, name: string) {
  await locator.scrollIntoViewIfNeeded();
  await locator.screenshot({ path: file(name) });
}

async function waitFor3D(page: Page) {
  const canvas = page.locator('canvas').first();
  await expect.poll(async () => (await canvas.boundingBox())?.width ?? 0).toBeGreaterThan(300);
  await settle(page, 2500);
}

async function nav(page: Page, name: string) {
  await page.getByRole('link', { name }).first().click();
  await settle(page, 800);
}

test('desktop gallery', async ({ page }) => {
  // 01 · Overview
  await page.goto('./#/');
  await waitFor3D(page);
  await shot(page, '01-overview-hero');
  await shot(page, '01-overview-full', true);

  // 02 · Plant Anatomy
  await nav(page, 'Plant Anatomy');
  await expect(page.getByText('Plant Hierarchy (36)')).toBeVisible();
  await waitFor3D(page);
  await shot(page, '02-anatomy-default');

  await page.getByLabel('Search plant components').fill('Spiral');
  await page.getByRole('button', { name: 'Spiral Casing', exact: true }).click();
  await settle(page, 2500);
  await shot(page, '02-anatomy-search-spiral-casing');
  await page.getByLabel('Clear component search').click();

  await page.getByRole('button', { name: /^Runner\s*5M$/i }).click();
  await settle(page, 2500);
  await shot(page, '02-anatomy-runner-selected');
  for (const [label, name] of [
    ['Exploded Assembly', 'exploded'],
    ['Cross-Section', 'cross-section'],
    ['Blade Close-Up', 'blade-closeup'],
    ['Flow Path', 'flow-path'],
  ] as const) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await settle(page, 3000);
    await shot(page, `02-anatomy-runner-${name}`);
  }
  await page.getByRole('button', { name: 'Normal', exact: true }).click();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await settle(page, 2500);

  await page.locator('input[type="range"]').first().fill('70');
  await settle(page, 2500);
  await shot(page, '02-anatomy-plant-exploded');
  await page.locator('input[type="range"]').first().fill('0');

  await page.getByRole('button', { name: 'Section Cut', exact: true }).click();
  await settle(page, 2500);
  await shot(page, '02-anatomy-section-cut');
  await page.getByRole('button', { name: 'Section Cut', exact: true }).click();

  const tabs = page.getByRole('tablist').first();
  await tabs.getByRole('tab', { name: 'Parameters' }).click();
  await settle(page, 600);
  await shotOf(page.locator('[role="tablist"]').first().locator('xpath=..'), '02-anatomy-inspector-parameters');

  // 03 · Energy Journey
  await nav(page, 'Energy Journey');
  await expect(page.getByText('Stage 01 / 09')).toBeVisible();
  await waitFor3D(page);
  await shot(page, '03-journey-stage-01');
  const next = page.getByLabel('Next journey stage');
  for (let s = 2; s <= 9; s++) {
    await next.click();
    await expect(page.getByText(`Stage 0${s} / 09`)).toBeVisible();
    await settle(page, 2800);
    if ([3, 4, 6, 8, 9].includes(s)) await shot(page, `03-journey-stage-0${s}`);
  }

  // 04 · Generation Simulator
  await nav(page, 'Simulator');
  await expect(page.getByText('WASM Worker: ready')).toBeVisible();
  await waitFor3D(page);
  await shot(page, '04-simulator-scenario-a', true);
  await page.getByRole('button', { name: /Run/ }).first().click();
  await settle(page, 6000);
  await page.getByRole('button', { name: /Pause/ }).first().click().catch(() => undefined);
  await shot(page, '04-simulator-running', true);
  await page.getByRole('button', { name: /B: Reduced Flow/i }).click();
  await settle(page, 2500);
  await shot(page, '04-simulator-scenario-b-warning', true);
  await page.getByRole('button', { name: /E: High Load/i }).click();
  await settle(page, 2500);
  await shot(page, '04-simulator-scenario-e');
  await page.getByLabel('Net Head (H)', { exact: true }).fill('180');
  await expect(page.getByRole('alert').first()).toBeVisible();
  await settle(page, 800);
  await shot(page, '04-simulator-validation');

});

test('insights and library', async ({ page }) => {
  // 05 · Engineering Insights
  await page.goto('./#/insights');
  await expect(page.getByText('Canonical Scenario Comparison Matrix (A–E)')).toBeVisible();
  await settle(page, 2500);
  await shot(page, '05-insights-full', true);
  await page.getByRole('button', { name: 'Run Backend Sweep' }).click();
  await expect(page.getByText(/optional FastAPI analytics/i).first()).toBeVisible();
  await settle(page, 800);
  await page.getByText(/optional FastAPI analytics/i).first().scrollIntoViewIfNeeded();
  await settle(page, 400);
  await page.screenshot({ path: file('05-insights-offline') });

  // 06 · Technical Library
  await nav(page, 'Technical Library');
  await expect(page.getByRole('heading', { name: 'Technical Library' })).toBeVisible();
  await settle(page, 1500);
  await shot(page, '06-library-full', true);
  await page.getByRole('button', { name: 'Turbomachinery' }).click();
  await page.getByLabel('Search technical library').fill('Francis');
  await settle(page, 1000);
  await shot(page, '06-library-search');
});

test('mobile gallery', async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
    baseURL: test.info().project.use.baseURL,
  });
  const page = await ctx.newPage();
  for (const [route, name] of [
    ['', 'overview'],
    ['anatomy', 'anatomy'],
    ['journey', 'journey'],
    ['simulator', 'simulator'],
  ] as const) {
    await page.goto(`./#/${route}`);
    await settle(page, 4500);
    await shot(page, `07-mobile-${name}`);
  }
  await ctx.close();
});
