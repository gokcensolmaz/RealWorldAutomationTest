import {
    test,
    expect
} from '@playwright/test';
import { createTestUser } from '../helpers/test-user';

import { openLoginPage } from '../helpers/navigation';


test('AUTH-UI-01 — Registered user can log in with valid credentials', async ({ page, request }) => {

    // ARRANGE
    const user = await createTestUser(request);

    // ACT
    await openLoginPage(page);

    await page
        .getByPlaceholder('Email')
        .fill(user.email);

    await page
        .getByPlaceholder('Password')
        .fill(user.password);

    await page
        .getByRole('button', { name: 'Sign in' })
        .click();

    // ASSERT
    await expect(
        page.getByRole('link', { name: user.username })
    ).toBeVisible();

    await expect(page).not.toHaveURL(/\/login/);
});
test('AUTH-UI-02 — Registered user cannot log in with incorrect password', async ({ page, request }) => {
    // ARRANGE
    const user = await createTestUser(request);

    // ACT
    await openLoginPage(page);

    await page
        .getByPlaceholder('Email')
        .fill(user.email);

    await page
        .getByPlaceholder('Password')
        .fill('wrongPassword');

    await page
        .getByRole('button', { name: 'Sign in' })
        .click();

    // ASSERT
    await expect(
        page.getByText(/credentials invalid/i)
    ).toBeVisible();

    await expect(page).toHaveURL(/\/login/);

    await expect(
        page.getByRole('link', { name: user.username })
    ).not.toBeVisible();
});

test('AUTH-UI-03 — Unregistered user cannot log in', async ({ page }) => {
    // ARRANGE
    const unique = Date.now();
    
    const user = {
        username: `gokcen_${unique}`,
        email: `gokcen_${unique}@example.com`,
        password: 'Test1234!'
    }

    // ACT
    await openLoginPage(page);

    await page
        .getByPlaceholder('Email')
        .fill(user.email);

    await page
        .getByPlaceholder('Password')
        .fill(user.password);

    await page
        .getByRole('button', { name: 'Sign in' })
        .click();

    // ASSERT
    await expect(
        page.getByText(/credentials invalid/i)
    ).toBeVisible();

    await expect(page).toHaveURL(/\/login/);

    await expect(
        page.getByRole('link', { name: user.username })
    ).not.toBeVisible();
});