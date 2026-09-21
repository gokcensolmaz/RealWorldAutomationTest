import { Page, expect } from '@playwright/test';

export async function openLoginPage(page: Page): Promise<void> {
    await page.goto('/login');

    await expect(page).toHaveTitle(/Conduit|RealWorld/i);
}