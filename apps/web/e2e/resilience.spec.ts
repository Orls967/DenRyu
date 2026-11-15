import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/anatomy', '/journey', '/simulator', '/insights', '/library'];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
];

test.describe('DENRYU Resilience, Accessibility & Responsive Checks', () => {
  test('AC-17: falls back cleanly to 2D SVG Schematic when WebGL2 is unavailable', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
        if (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl') {
          return null;
        }
        // @ts-expect-error fallback to original signature
        return orig.apply(this, [type, ...args]);
      };
    });

    await page.goto('./#/anatomy');
    await expect(page.getByTestId('webgl-2d-fallback')).toBeVisible();
    await expect(page.getByText(/2D Schematic Mode/i)).toBeVisible();
    await expect(page.getByText('Plant Hierarchy (36)')).toBeVisible();
  });

  test('AC-18: supports Reduced Motion preference and UI toggle without errors', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./#/journey');
    await expect(page.getByText('Stage 01 / 09')).toBeVisible();
    const toggle = page.getByRole('button', { name: /Motion|Reduced/i });
    await expect(toggle).toBeVisible();
  });

  for (const vp of VIEWPORTS) {
    test(`AC-16: zero horizontal page overflow at ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of ROUTES) {
        await page.goto(`./#${route}`);
        await page.waitForTimeout(250);
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth + 2;
        });
        expect(overflow, `Overflow detected on ${route} at ${vp.name}`).toBe(false);
      }
    });
  }
});
