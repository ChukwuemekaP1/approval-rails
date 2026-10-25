import { test, expect } from '@playwright/test';

test.describe('ApproveRail Core Navigation', () => {
  test('navigates from landing page to app shell dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ApproveRail/);

    const enterButton = page.getByRole('link', { name: /Open App Shell/i });
    await enterButton.click();

    await expect(page).toHaveURL(/\/app/);
    await expect(page.getByRole('heading', { name: /ApproveRail Dashboard/i })).toBeVisible();
  });

  test('navigates to route placeholders and verifies honest placeholder messaging', async ({ page }) => {
    await page.goto('/app/purchases/new');
    await expect(page.getByRole('heading', { name: /Create Purchase Request/i })).toBeVisible();
    await expect(page.getByText(/Honest Greenfield Placeholder/i)).toBeVisible();
    await expect(page.getByText(/Phase 4: Discovery & Research/i)).toBeVisible();

    await page.goto('/app/policies');
    await expect(page.getByRole('heading', { name: /Authentication Required/i })).toBeVisible();
    await expect(page.locator('#main-content').getByRole('link', { name: /Sign In with Passkey/i })).toBeVisible();

    await page.goto('/app/transactions');
    await expect(page.getByRole('heading', { name: /Transaction Activity & History/i })).toBeVisible();

    await page.goto('/auth');
    await expect(page.getByRole('heading', { name: /Approve\s*Rail/i })).toBeVisible();
  });
});
