import { test, expect } from '@playwright/test';
import { createArticle, getArticle, updateArticle } from './articles-api';
import { randomUUID } from 'crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

type ApiTestUser = {
    username: string;
    token: string;
};

let apiUser: ApiTestUser;

test.beforeAll(async () => {
    const file = await readFile(
        path.resolve('playwright/.auth/api-user.json'),
        'utf-8'
    );

    apiUser = JSON.parse(file);
});

test('ARTICLE-API-01 — Authenticated user can create an article', async ({ request }) => {
    // ARRANGE
    const user = apiUser;
    const unique = randomUUID();

    const article = {
        title: `Test Article ${unique}`,
        description: 'Article created by Playwright API test',
        body: 'This is the article body.'
    };

    // ACT
    const response = await createArticle(
        request,
        user.token,
        article
    );

    // ASSERT
    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    expect(body.article.title).toBe(article.title);
    expect(body.article.description).toBe(article.description);
    expect(body.article.body).toBe(article.body);

    expect(typeof body.article.slug).toBe('string');
    expect(typeof body.article.createdAt).toBe('string');
    expect(typeof body.article.updatedAt).toBe('string');

    expect(Array.isArray(body.article.tagList)).toBeTruthy();
    expect(typeof body.article.favorited).toBe('boolean');
    expect(typeof body.article.favoritesCount).toBe('number');

    expect(body.article.author).toBeTruthy();
    expect(body.article.author.username).toBe(user.username);
});

test('ARTICLE-API-02 — Authenticated user can retrieve created article by slug', async ({ request }) => {

    const user = apiUser;
    const unique = randomUUID();

    const article = {
        title: `Test Article ${unique}`,
        description: 'Article created for GET test',
        body: 'This is the article body.'
    };

    const createResponse = await createArticle(
        request,
        user.token,
        article
    );

    expect(createResponse.ok()).toBeTruthy();

    const createBody = await createResponse.json();
    const slug = createBody.article.slug;

    // ACT
    const getResponse = await getArticle(
        request,
        slug,
        user.token
    );

    expect(
        getResponse.status(),
        await getResponse.text()
    ).toBe(200);

    // ASSERT
    expect(getResponse.ok()).toBeTruthy();

    const getBody = await getResponse.json();

    expect(getBody.article.slug).toBe(slug);
    expect(getBody.article.title).toBe(article.title);
    expect(getBody.article.description).toBe(article.description);
    expect(getBody.article.body).toBe(article.body);

    expect(getBody.article.author.username).toBe(user.username);
});

test('ARTICLE-API-03 — Authenticated user can update article title', async ({ request }) => {
    // ARRANGE
    const user = apiUser;
    const unique = randomUUID();

    const article = {
        title: `Original Article ${unique}`,
        description: 'Original description',
        body: 'Original body'
    };

    const createResponse = await createArticle(
        request,
        user.token,
        article
    );

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    const originalSlug = createBody.article.slug;

    const newTitle = `Updated Article ${unique}`;

    // ACT
    const updateResponse = await updateArticle(
        request,
        user.token,
        originalSlug,
        {
            title: newTitle
        }
    );

    // ASSERT — update response
    expect(updateResponse.ok()).toBeTruthy();

    const updateBody = await updateResponse.json();

    expect(updateBody.article.title).toBe(newTitle);
    expect(updateBody.article.description).toBe(article.description);
    expect(updateBody.article.body).toBe(article.body);

    expect(updateBody.article.slug).not.toBe(originalSlug);

    const updatedSlug = updateBody.article.slug;

    // ASSERT — persisted state
    const getResponse = await getArticle(
        request,
        updatedSlug,
        user.token
    );

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();

    expect(getBody.article.title).toBe(newTitle);
    expect(getBody.article.slug).toBe(updatedSlug);
});