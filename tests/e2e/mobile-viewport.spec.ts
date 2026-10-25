import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport Smoke & Responsive Layout', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('ensures no horizontal overflow at 360px width on dashboard and placeholders', async ({ page }) => {
    await page.goto('/app');

    // Verify 5-destination bottom navigation is visible
    const mobileNav = page.getByRole('navigation', { name: /Mobile Bottom Navigation/i });
    await expect(mobileNav).toBeVisible();

    await expect(mobileNav.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Buy', exact: true })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Activity', exact: true })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Policies', exact: true })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'More', exact: true })).toBeVisible();

    // Verify no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Click on 'Buy' in bottom navigation
    await mobileNav.getByRole('link', { name: 'Buy', exact: true }).click();
    await expect(page).toHaveURL(/\/app\/purchases\/new/);
    await expect(page.getByRole('heading', { name: /Create Purchase Request/i })).toBeVisible();

    // Check again for no overflow on route placeholder
    const placeholderOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(placeholderOverflow).toBe(false);
  });
});
