import { test, expect } from '@playwright/test';

test('RealWorld application is reachable', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Conduit|RealWorld/i);
});