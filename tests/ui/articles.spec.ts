
import { test, expect } from '../fixtures/test';
import { randomUUID } from 'node:crypto';
import { openLoginPage } from '../helpers/navigation';
import { createArticle, getArticle } from '../api/articles-api';
import { getCurrentUser } from '../api/users-api';

// ============================================================
// ARTICLE-UI-01 — Create Article
// ============================================================

test('ARTICLE-UI-01 — Authenticated user can create an article',
    async ({ page, testUser, articleCleanup }) => {

        // ARRANGE — Test user and article data
        const user = testUser;

        const article = {
            title: `UI Test Article ${randomUUID()}`,
            description: 'Article created through the UI',
            body: 'This article was created using Playwright.'
        };

        // ACT — Open login page
        await openLoginPage(page);

        await page
            .getByPlaceholder('Email')
            .fill(user.email);

        await page
            .getByPlaceholder('Password')
            .fill(user.password);

        // Capture the UI login response
        const loginResponsePromise = page.waitForResponse(
            response =>
                new URL(response.url()).pathname === '/api/users/login' &&
                response.request().method() === 'POST'
        );

        // ACT — Login
        await page
            .getByRole('button', { name: 'Sign in' })
            .click();

        const loginResponse = await loginResponsePromise;

        // ASSERT — Login succeeded
        expect(loginResponse.status()).toBe(200);

        const loginBody = await loginResponse.json();

        expect(loginBody.user.username).toBe(user.username);
        expect(loginBody.user.token).toBeTruthy();

        // Update the token used for article cleanup
        articleCleanup.setToken(loginBody.user.token);

        // ASSERT — User is logged in
        await expect(
            page
                .locator('app-layout-header')
                .getByRole('link', { name: user.username })
        ).toBeVisible();

        // ACT — Open Article Editor
        await page
            .getByRole('link', { name: 'New Article' })
            .click();

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

        // Capture the article creation response
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

        // ASSERT — Article was created
        expect(createResponse.status()).toBe(201);

        const createBody = await createResponse.json();

        // Register the article for automatic cleanup
        articleCleanup.track(createBody.article.slug);

        // ASSERT — Article belongs to the correct user
        expect(createBody.article.author.username).toBe(user.username);

        // ASSERT — User is redirected to the article page
        await expect(page).toHaveURL(/\/article\/[^/]+$/);

        // ASSERT — Published article is displayed
        await expect(
            page.getByRole('heading', { name: article.title })
        ).toBeVisible();

        await expect(
            page.getByText(article.body)
        ).toBeVisible();
    }
);

// ============================================================
// ARTICLE-UI-02 — Edit Article
// ============================================================


test('ARTICLE-UI-02 — Authenticated user can edit an article', async ({ page, request, testUser, articleCleanup }) => {

    // ARRANGE — Test user and article data
    const user = testUser;

    const article = {
        title: `Original Article ${randomUUID()}`,
        description: 'Original description',
        body: 'Original body'
    };

    // ASSERT — Token belongs to the expected user
    const currentUserResponse = await getCurrentUser(
        request,
        user.token
    );

    expect(currentUserResponse.status()).toBe(200);

    const currentUserBody = await currentUserResponse.json();

    expect(currentUserBody.user.username).toBe(user.username);

    articleCleanup.setToken(user.token);

    // ARRANGE — Create article through API
    const response = await createArticle(
        request,
        user.token,
        article
    );

    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    const slug = responseBody.article.slug;

    // Register the article for automatic cleanup
    articleCleanup.track(slug);

    // ASSERT — Article belongs to the correct user
    expect(responseBody.article.author.username).toBe(user.username);

    // ACT — Open login page
    await openLoginPage(page);

    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);

    // Capture the UI login response
    const loginResponsePromise = page.waitForResponse(
        response =>
            new URL(response.url()).pathname === '/api/users/login' &&
            response.request().method() === 'POST'
    );

    // ACT — Login
    await page.getByRole('button', { name: 'Sign in' }).click();

    const loginResponse = await loginResponsePromise;

    // ASSERT — Login succeeded
    expect(loginResponse.status()).toBe(200);

    const loginBody = await loginResponse.json();

    expect(loginBody.user.username).toBe(user.username);
    expect(loginBody.user.token).toBeTruthy();

    // Update the token used for cleanup
    articleCleanup.setToken(loginBody.user.token);

    // ASSERT — User is logged in
    await expect(
        page
            .locator('app-layout-header')
            .getByRole('link', { name: user.username })
    ).toBeVisible();

    // ACT — Open the existing article
    const articleResponsePromise = page.waitForResponse(
        response =>
            new URL(response.url()).pathname ===
            `/api/articles/${encodeURIComponent(slug)}` &&
            response.request().method() === 'GET'
    );

    await page.goto(`/article/${slug}`);

    const articleResponse = await articleResponsePromise;

    expect(articleResponse.status()).toBe(200);

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

    // Capture the update response
    const updateResponsePromise = page.waitForResponse(
        response =>
            new URL(response.url()).pathname ===
            `/api/articles/${encodeURIComponent(slug)}` &&
            response.request().method() === 'PUT'
    );

    await page
        .getByRole('button', { name: 'Publish Article' })
        .click();

    const updateResponse = await updateResponsePromise;

    // ASSERT — Update succeeded
    expect(updateResponse.status()).toBe(200);

    const updateBody = await updateResponse.json();
    const updatedSlug = updateBody.article.slug;

    // Update the tracked slug for cleanup
    articleCleanup.replace(slug, updatedSlug);

    // ASSERT — Slug changed
    expect(updatedSlug).not.toBe(slug);

    // ASSERT — User is redirected to the updated article
    await expect(page).toHaveURL(
        `/article/${updatedSlug}`
    );

    // ASSERT — Updated title is displayed
    await expect(
        page.getByRole('heading', { name: updatedTitle })
    ).toBeVisible();

    // ASSERT — Body remains unchanged
    await expect(
        page.getByText(article.body)
    ).toBeVisible();

    // ASSERT — Verify persisted state through API
    const getResponse = await getArticle(
        request,
        updatedSlug,
        loginBody.user.token
    );

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();

    expect(getBody.article.title).toBe(updatedTitle);
    expect(getBody.article.description).toBe(updatedDescription);
    expect(getBody.article.body).toBe(article.body);
    expect(getBody.article.slug).toBe(updatedSlug);
}
);
// ============================================================
// ARTICLE-UI-03 — Delete Article
// ============================================================


test('ARTICLE-UI-03 — Authenticated user can delete an article', async ({ page, request, testUser, articleCleanup }) => {

    // ARRANGE — Test user and article data
    const user = testUser;

    const article = {
        title: `Delete UI Article ${randomUUID()}`,
        description: 'Article created for UI deletion',
        body: 'This article will be deleted.'
    };

    articleCleanup.setToken(user.token);

    // ARRANGE — Create article through API
    const createResponse = await createArticle(
        request,
        user.token,
        article
    );

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    const slug = createBody.article.slug;

    // Register the article for automatic cleanup
    articleCleanup.track(slug);

    // ASSERT — Article belongs to the correct user
    expect(createBody.article.author.username).toBe(user.username);

    // ACT — Open login page
    await openLoginPage(page);

    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);

    // Capture the UI login response
    const loginResponsePromise = page.waitForResponse(
        response =>
            new URL(response.url()).pathname === '/api/users/login' &&
            response.request().method() === 'POST'
    );

    // ACT — Login
    await page
        .getByRole('button', { name: 'Sign in' })
        .click();

    const loginResponse = await loginResponsePromise;

    // ASSERT — Login succeeded
    expect(loginResponse.status()).toBe(200);

    const loginBody = await loginResponse.json();

    expect(loginBody.user.username).toBe(user.username);
    expect(loginBody.user.token).toBeTruthy();

    // Update the token used for cleanup
    articleCleanup.setToken(loginBody.user.token);

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

    // ASSERT — Delete option is available
    const deleteButton = page
        .locator('.banner')
        .getByRole('button', { name: /delete article/i });

    await expect(deleteButton).toBeVisible();

    // Capture the DELETE response
    const deleteResponsePromise = page.waitForResponse(
        response =>
            new URL(response.url()).pathname ===
            `/api/articles/${encodeURIComponent(slug)}` &&
            response.request().method() === 'DELETE'
    );

    // ACT — Delete article through UI
    await deleteButton.click();

    const deleteResponse = await deleteResponsePromise;

    // ASSERT — Delete request succeeded
    expect(deleteResponse.ok()).toBeTruthy();

    // ASSERT — User is redirected to the home page
    await expect(page).toHaveURL('https://demo.realworld.show/');

    // ASSERT — Article no longer exists
    const getResponse = await getArticle(
        request,
        slug,
        loginBody.user.token
    );

    expect(getResponse.status()).toBe(404);

    const getBody = await getResponse.json();

    expect(getBody.errors.article).toContain('not found');

    // Article is already deleted — no teardown required
    articleCleanup.untrack(slug);
}
);
