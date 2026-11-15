import { expect, test } from '@playwright/test';

test.describe('DENRYU Core End-to-End Educational Journeys', () => {
  test('navigates all 6 routes under /DenRyu/ subpath with zero console or page errors', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`console.error: ${msg.text()}`);
      }
    });

    await page.goto('./#/');
    await expect(page.getByText('DENRYU').first()).toBeVisible();
    await expect(page.getByText(/44\.55 MW|45 MW|89\.1%/).first()).toBeVisible();

    // /anatomy
    await page.getByRole('link', { name: 'Plant Anatomy' }).first().click();
    await expect(page.getByText('Plant Hierarchy (36)')).toBeVisible();
    const search = page.getByLabel('Search plant components');
    await search.fill('Spiral');
    await page.getByRole('button', { name: 'Spiral Casing', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Spiral Casing' })).toBeVisible();
    await page.getByLabel('Clear component search').click();

    // Select Runner and inspect 5-mode toolbar + Section Cut + Explode
    await page.getByRole('button', { name: /^Runner\s*5M$/i }).click();
    await expect(page.getByRole('region', { name: 'Francis Runner Inspection Modes' })).toBeVisible();
    await page.getByRole('button', { name: 'Blade Close-Up', exact: true }).click();
    await page.getByRole('button', { name: 'Section Cut', exact: true }).click();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();

    // /journey — all 9 stages
    await page.getByRole('link', { name: 'Energy Journey' }).first().click();
    await expect(page.getByText('Stage 01 / 09')).toBeVisible();
    const nextStageBtn = page.getByLabel('Next journey stage');
    for (let s = 2; s <= 9; s++) {
      await nextStageBtn.click();
      await expect(page.getByText(`Stage 0${s} / 09`)).toBeVisible();
      if (s === 4) {
        await expect(page.getByText('Inspect Francis Runner in 5 Interactive Modes')).toBeVisible();
      }
    }
    await expect(page.getByText('Complete 9-Stage Energy Loop Reached')).toBeVisible();

    // /simulator — real WASM inside Web Worker
    await page.getByRole('link', { name: 'Simulator' }).first().click();
    await expect(page.getByText('WASM Worker: ready')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('44.55 MW').first()).toBeVisible();
    await expect(page.getByText('250.0 rpm').first()).toBeVisible();

    // Scenario switching
    await page.getByRole('button', { name: /B: Reduced Flow/i }).click();
    await expect(page.getByText(/DEEP_PART_LOAD_CAVITATION_RISK|INSUFFICIENT/).first()).toBeVisible();

    // Out-of-range validation error (Net Head = 180 m) without crashing
    const headInput = page.getByLabel('Net Head (H)', { exact: true });
    await headInput.fill('180');
    await expect(page.getByRole('alert')).toContainText('130');

    // /insights — WASM scenario comparison + graceful offline fallback
    await page.getByRole('link', { name: 'Insights' }).first().click();
    await expect(page.getByText('Canonical Scenario Comparison Matrix (A–E)')).toBeVisible();
    await expect(page.getByText('44.55 MW').first()).toBeVisible();
    await page.getByRole('button', { name: 'Run Backend Sweep' }).click();
    await expect(page.getByText(/optional FastAPI analytics/i)).toBeVisible();

    // /library
    await page.getByRole('link', { name: 'Technical Library' }).first().click();
    await expect(page.getByRole('heading', { name: 'Technical Library' })).toBeVisible();
    await page.getByRole('button', { name: 'Turbomachinery' }).click();
    await page.getByLabel('Search technical library').fill('Francis');
    await expect(page.getByText(/Domain Glossary/)).toBeVisible();

    expect(errors).toEqual([]);
  });
});
