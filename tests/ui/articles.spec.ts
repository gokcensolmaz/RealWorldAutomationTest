
import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

import { createTestUser } from '../helpers/test-user';
import { openLoginPage } from '../helpers/navigation';
import { createArticle, getArticle } from '../api/articles-api';

// ============================================================
// ARTICLE-UI-01 — Create Article
// ============================================================

test('ARTICLE-UI-01 — Authenticated user can create an article', async ({ page, request }) => {

    // ARRANGE — Create test user
    const user = await createTestUser(request);

    const article = {
        title: `UI Test Article ${randomUUID()}`,
        description: 'Article created through the UI',
        body: 'This article was created using Playwright.'
    };

    // ACT — Login
    await openLoginPage(page);

    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);

    await page.getByRole('button', { name: 'Sign in' }).click();

    // ASSERT — User is logged in
    await expect(
        page
            .locator('app-layout-header')
            .getByRole('link', { name: user.username })
    ).toBeVisible();

    // ACT — Open Article Editor
    await page.getByRole('link', { name: 'New Article' }).click();

    await expect(page).toHaveURL(/\/editor/);

    // ACT — Fill article form
    await page
        .getByPlaceholder('Article Title')
        .fill(article.title);

    await page
        .getByPlaceholder("What's this article about?")
        .fill(article.description);

    await page
        .getByPlaceholder('Write your article (in markdown)')
        .fill(article.body);

    // Arrange response listener before publishing
    const createResponsePromise = page.waitForResponse(
        response =>
            new URL(response.url()).pathname === '/api/articles' &&
            response.request().method() === 'POST'
    );

    // ACT — Publish article
    await page
        .getByRole('button', { name: 'Publish Article' })
        .click();

    const createResponse = await createResponsePromise;

    // ASSERT — API returned Created
    expect(createResponse.status()).toBe(201);

    // ASSERT — User is redirected to the article page
    await expect(page).toHaveURL(/\/article\/[^/]+$/);

    // ASSERT — Published article is displayed
    await expect(
        page.getByRole('heading', { name: article.title })
    ).toBeVisible();

    await expect(
        page.getByText(article.body)
    ).toBeVisible();
});

// ============================================================
// ARTICLE-UI-02 — Edit Article
// ============================================================

test('ARTICLE-UI-02 — Authenticated user can edit an article', async ({ page, request }) => {

    // ARRANGE — Create test user
    const user = await createTestUser(request);

    const article = {
        title: `Original Article ${randomUUID()}`,
        description: 'Original description',
        body: 'Original body'
    };

    // ARRANGE — Create article through API
    const response = await createArticle(
        request,
        user.token,
        article
    );

    expect(response.status()).toBe(201);

    const responseBody = await response.json();

    // ASSERT — Article belongs to the correct user
    expect(responseBody.article.author.username).toBe(user.username);

    const slug = responseBody.article.slug;

    // ACT — Login
    await openLoginPage(page);

    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);

    await page.getByRole('button', { name: 'Sign in' }).click();

    // ASSERT — User is logged in
    await expect(
        page
            .locator('app-layout-header')
            .getByRole('link', { name: user.username })
    ).toBeVisible();

    // ACT — Open the existing article
    await page.goto(`/article/${slug}`);

    // ASSERT — Correct article is displayed
    await expect(
        page.getByRole('heading', { name: article.title })
    ).toBeVisible();

    // ASSERT — Correct author is displayed
    await expect(
        page
            .locator('.banner')
            .getByRole('link', { name: user.username })
    ).toBeVisible();

    // ASSERT — Edit option is available
    const editLink = page
        .locator('.banner')
        .getByRole('link', { name: /edit article/i });

    await expect(editLink).toBeVisible();

    // ACT — Open Article Editor
    await editLink.click();

    await expect(page).toHaveURL(/\/editor\//);

    // ASSERT — Existing values are loaded
    await expect(
        page.getByPlaceholder('Article Title')
    ).toHaveValue(article.title);

    await expect(
        page.getByPlaceholder("What's this article about?")
    ).toHaveValue(article.description);

    await expect(
        page.getByPlaceholder('Write your article (in markdown)')
    ).toHaveValue(article.body);

    // ARRANGE — Updated values
    const updatedTitle = `Updated UI Article ${randomUUID()}`;
    const updatedDescription = 'Updated through the UI';

    // ACT — Update article
    await page
        .getByPlaceholder('Article Title')
        .fill(updatedTitle);

    await page
        .getByPlaceholder("What's this article about?")
        .fill(updatedDescription);

    await page
        .getByRole('button', { name: 'Publish Article' })
        .click();

    // ASSERT — Updated article is displayed
    await expect(
        page.getByRole('heading', { name: updatedTitle })
    ).toBeVisible();

    // ASSERT — Body remains unchanged
    await expect(
        page.getByText(article.body)
    ).toBeVisible();

    // ASSERT — User is redirected to the updated article
    await expect(page).toHaveURL(/\/article\/[^/]+$/);

    const updatedSlug = new URL(page.url())
        .pathname.split('/')
        .pop()!;

    expect(updatedSlug).not.toBe(slug);

    // ASSERT — Verify persisted state through API
    const getResponse = await getArticle(
        request,
        updatedSlug,
        user.token
    );

    expect(
        getResponse.status(),
        await getResponse.text()
    ).toBe(200);

    const getBody = await getResponse.json();

    expect(getBody.article.title).toBe(updatedTitle);
    expect(getBody.article.description).toBe(updatedDescription);
    expect(getBody.article.body).toBe(article.body);
    expect(getBody.article.slug).toBe(updatedSlug);
});

// ============================================================
// ARTICLE-UI-03 — Delete Article
// ============================================================

test('ARTICLE-UI-03 — Authenticated user can delete an article', async ({ page, request }) => {

    // ARRANGE — Create test user
    const user = await createTestUser(request);

    const article = {
        title: `Delete UI Article ${randomUUID()}`,
        description: 'Article created for UI deletion',
        body: 'This article will be deleted.'
    };

    // ARRANGE — Create article through API
    const createResponse = await createArticle(
        request,
        user.token,
        article
    );

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();

    expect(createBody.article.author.username).toBe(user.username);

    const slug = createBody.article.slug;

    // ACT — Login
    await openLoginPage(page);

    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);

    await page.getByRole('button', { name: 'Sign in' }).click();

    // ASSERT — User is logged in
    await expect(
        page
            .locator('app-layout-header')
            .getByRole('link', { name: user.username })
    ).toBeVisible();

    // ACT — Open article
    await page.goto(`/article/${slug}`);

    // ASSERT — Article is displayed
    await expect(
        page.getByRole('heading', { name: article.title })
    ).toBeVisible();

    // ASSERT — Correct author is displayed
    await expect(
        page
            .locator('.banner')
            .getByRole('link', { name: user.username })
    ).toBeVisible();

    // ASSERT — Delete option is available
    const deleteButton = page
        .locator('.banner')
        .getByRole('button', { name: /delete article/i });

    await expect(deleteButton).toBeVisible();

    // ACT — Delete article
    await deleteButton.click();

    // ASSERT — User is redirected to the home page
    await expect(page).toHaveURL('https://demo.realworld.show/');

    // ASSERT — Article no longer exists
    const getResponse = await getArticle(
        request,
        slug,
        user.token
    );

    expect(getResponse.status()).toBe(404);

    const getBody = await getResponse.json();

    expect(getBody.errors.article).toContain('not found');
});