import { test, expect } from '@playwright/test';

test.describe('Phase 2 Authentication and Workspace Navigation', () => {
  test('navigates to /auth and verifies passkey registration and sign-in tabs', async ({ page }) => {
    await page.goto('/auth');

    await expect(page.getByRole('heading', { name: /Approve\s*Rail/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Authenticate with Passkey/i })).toBeVisible();

    // Click Register Passkey tab
    await page.getByRole('tab', { name: /Register Passkey/i }).click();

    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByLabel(/Display Name/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Create & Bind Passkey/i })).toBeVisible();
  });

  test('verifies unauthenticated protection on /app/workspaces', async ({ page }) => {
    await page.goto('/app/workspaces');

    // Unauthenticated user sees protected authentication required prompt after session resolves
    await expect(
      page.getByRole('heading', { name: /Authentication Required/i })
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('main').getByRole('link', { name: /Sign In with Passkey/i })
    ).toBeVisible();
  });
});
