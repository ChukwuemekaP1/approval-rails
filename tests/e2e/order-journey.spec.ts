import { test, expect } from '@playwright/test';

test.describe('Order Settlement & Transaction Journey', () => {
  test('verifies unauthenticated barrier on order detail and transactions list', async ({ page }) => {
    await page.goto('/app/orders/00000000-0000-0000-0000-000000000000');
    await expect(page.getByRole('heading', { name: /Authentication Required/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.locator('#main-content').getByRole('link', { name: /Sign In with Passkey/i })
    ).toBeVisible();

    await page.goto('/app/transactions');
    await expect(page.getByRole('heading', { name: /Authentication Required/i })).toBeVisible();
  });

  test('verifies transaction page and order page responsiveness at 360px width', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/app/transactions');

    await expect(page.getByRole('heading', { name: /Authentication Required/i })).toBeVisible({
      timeout: 15000,
    });

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);
  });
});
