import { test, expect } from '@playwright/test';

test.describe('Proposal Review & Mandate E2E Journey', () => {
  test('verifies unauthenticated barrier and redirect prompt on /app/proposals', async ({ page }) => {
    await page.goto('/app/proposals/00000000-0000-0000-0000-000000000000');

    await expect(page.getByRole('heading', { name: /Authentication Required/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.locator('#main-content').getByRole('link', { name: /Sign In with Passkey/i })
    ).toBeVisible();
  });

  test('verifies proposal review interface responsiveness without horizontal overflow at 360px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/app/proposals/00000000-0000-0000-0000-000000000000');

    await expect(page.getByRole('heading', { name: /Authentication Required/i })).toBeVisible({
      timeout: 15000,
    });

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });
});
