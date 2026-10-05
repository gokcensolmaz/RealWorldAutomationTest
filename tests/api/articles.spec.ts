import { test, expect } from '../fixtures/test';
import {
    createArticle,
    getArticle,
    updateArticle,
    deleteArticle,
    createArticleWithInvalidPayload,
    createArticleWithoutAuth,
    updateArticleWithoutAuth,
    deleteArticleWithoutAuth
} from './articles-api';
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

test('ARTICLE-API-01 — Authenticated user can create an article', async ({ request, articleCleanup }) => {
    // ARRANGE
    const user = apiUser;
    articleCleanup.setToken(user.token);

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
    articleCleanup.track(body.article.slug);


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

test('ARTICLE-API-02 — Authenticated user can retrieve created article by slug', async ({ request, articleCleanup }) => {

    const user = apiUser;
    articleCleanup.setToken(user.token);


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

    articleCleanup.track(slug);

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

test('ARTICLE-API-03 — Authenticated user can update article title', async ({ request, articleCleanup }) => {
    // ARRANGE
    const user = apiUser;
    articleCleanup.setToken(user.token);

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

    articleCleanup.track(originalSlug);
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
    const updatedSlug = updateBody.article.slug;

    // Update tracked resource for cleanup
    articleCleanup.replace(
        originalSlug,
        updatedSlug
    );

    expect(updateBody.article.title).toBe(newTitle);
    expect(updateBody.article.description).toBe(article.description);
    expect(updateBody.article.body).toBe(article.body);

    expect(updateBody.article.slug).not.toBe(originalSlug);


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

const requiredFieldCases = [
    {
        name: 'ARTICLE-TC-03 — article creation without title is rejected',
        missingField: 'title',
        article: {
            description: 'Missing title test',
            body: 'Test body'
        }
    },
    {
        name: 'ARTICLE-TC-04 — article creation without description is rejected',
        missingField: 'description',
        article: {
            title: `Missing Description ${randomUUID()}`,
            body: 'Test body'
        }
    },
    {
        name: 'ARTICLE-TC-05 — article creation without body is rejected',
        missingField: 'body',
        article: {
            title: `Missing Body ${randomUUID()}`,
            description: 'Missing body test'
        }
    }
] as const;

for (const testCase of requiredFieldCases) {
    test(testCase.name, async ({ request }) => {
        const response = await createArticleWithInvalidPayload(
            request,
            apiUser.token,
            testCase.article
        );

        expect(response.status()).toBe(422);

        const body = await response.json();

        expect(body.errors[testCase.missingField]).toContain("can't be blank");
    });
}
test(
    'ARTICLE-API-04 — Authenticated user can delete an article',
    async ({ request, articleCleanup }) => {

        // ARRANGE
        const user = apiUser;
        const unique = randomUUID();

        articleCleanup.setToken(user.token);

        const article = {
            title: `Delete Article ${unique}`,
            description: 'Article created for DELETE test',
            body: 'This article will be deleted.'
        };

        const createResponse = await createArticle(
            request,
            user.token,
            article
        );

        expect(createResponse.status()).toBe(201);

        const createBody = await createResponse.json();
        const slug = createBody.article.slug;

        articleCleanup.track(slug);

        expect(createBody.article.author.username).toBe(user.username);

        // ACT
        const deleteResponse = await deleteArticle(
            request,
            user.token,
            slug
        );

        // ASSERT — delete succeeded
        expect(deleteResponse.ok()).toBeTruthy();

        // ASSERT — article no longer exists
        const getResponse = await getArticle(
            request,
            slug,
            user.token
        );

        expect(getResponse.status()).toBe(404);

        const getBody = await getResponse.json();

        expect(getBody.errors.article).toContain('not found');

        // Resource is already deleted
        articleCleanup.untrack(slug);
    }
);
test('ARTICLE-TC-06 — unauthenticated user cannot create an article', async ({ request }) => {
    const unique = randomUUID();

    const article = {
        title: `Unauthenticated Article ${unique}`,
        description: 'Unauthenticated create test',
        body: 'This article should not be created.'
    };

    const response = await createArticleWithoutAuth(
        request,
        article
    );

    expect(response.status()).toBe(401);

    const body = await response.json();

    expect(body.errors.token).toContain('is missing');
});

test('ARTICLE-TC-11 — unauthenticated user cannot update an article', async ({ request, articleCleanup }) => {
    // ARRANGE
    const unique = randomUUID();
    articleCleanup.setToken(apiUser.token);

    const article = {
        title: `Protected Article ${unique}`,
        description: 'Original description',
        body: 'Original body'
    };

    const createResponse = await createArticle(
        request,
        apiUser.token,
        article
    );

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    const slug = createBody.article.slug;

    articleCleanup.track(slug);

    // ACT
    const updateResponse = await updateArticleWithoutAuth(
        request,
        slug,
        {
            title: `Unauthorized Update ${unique}`
        }
    );

    expect(updateResponse.status()).toBe(401);

    const updateBody = await updateResponse.json();

    expect(updateBody.errors.token).toContain('is missing');

    // ASSERT — article remains unchanged
    const getResponse = await getArticle(
        request,
        slug,
        apiUser.token
    );

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();

    expect(getBody.article.title).toBe(article.title);
    expect(getBody.article.description).toBe(article.description);
    expect(getBody.article.body).toBe(article.body);
});

test('ARTICLE-TC-13 — unauthenticated user cannot delete an article', async ({ request, articleCleanup }) => {
    // ARRANGE
    const unique = randomUUID();
    articleCleanup.setToken(apiUser.token);

    const article = {
        title: `Protected Delete Article ${unique}`,
        description: 'Unauthenticated delete test',
        body: 'This article should remain available.'
    };

    const createResponse = await createArticle(
        request,
        apiUser.token,
        article
    );

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    const slug = createBody.article.slug;

    articleCleanup.track(slug);

    // ACT
    const deleteResponse = await deleteArticleWithoutAuth(
        request,
        slug
    );

    expect(deleteResponse.status()).toBe(401);

    const deleteBody = await deleteResponse.json();

    expect(deleteBody.errors.token).toContain('is missing');

    // ASSERT — article still exists
    const getResponse = await getArticle(
        request,
        slug,
        apiUser.token
    );

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();

    expect(getBody.article.slug).toBe(slug);
    expect(getBody.article.title).toBe(article.title);
});

test('ARTICLE-TC-02 — authenticated user can create an article with tags', async ({ request, articleCleanup }) => {
    // ARRANGE
    const unique = randomUUID();
    articleCleanup.setToken(apiUser.token);

    const tags = [
        'playwright',
        'api-testing'
    ];

    const article = {
        title: `Tagged Article ${unique}`,
        description: 'Article created with tags',
        body: 'This article verifies tagList support.',
        tagList: tags
    };

    // ACT
    const createResponse = await createArticle(
        request,
        apiUser.token,
        article
    );

    // ASSERT — create response
    expect(
        createResponse.status(),
        await createResponse.text()
    ).toBe(201);

    const createBody = await createResponse.json();
    const slug = createBody.article.slug;
    articleCleanup.track(slug);


    expect(createBody.article.title).toBe(article.title);

    expect(createBody.article.tagList).toHaveLength(tags.length);
    expect(createBody.article.tagList).toEqual(
        expect.arrayContaining(tags)
    );


    // ASSERT — persisted state
    const getResponse = await getArticle(
        request,
        slug,
        apiUser.token
    );

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();

    expect(getBody.article.tagList).toHaveLength(tags.length);
    expect(getBody.article.tagList).toEqual(
        expect.arrayContaining(tags)
    );
});

test('ARTICLE-TC-09 — authenticated user can update article description only', async ({ request, articleCleanup }) => {
    // ARRANGE
    const unique = randomUUID();
    articleCleanup.setToken(apiUser.token);

    const article = {
        title: `Description Update Article ${unique}`,
        description: 'Original description',
        body: 'Original body'
    };

    const createResponse = await createArticle(
        request,
        apiUser.token,
        article
    );

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    const slug = createBody.article.slug;

    articleCleanup.track(slug);

    const updatedDescription = 'Updated description';

    // ACT
    const updateResponse = await updateArticle(
        request,
        apiUser.token,
        slug,
        {
            description: updatedDescription
        }
    );

    // ASSERT — update response
    expect(updateResponse.status()).toBe(200);

    const updateBody = await updateResponse.json();

    expect(updateBody.article.title).toBe(article.title);
    expect(updateBody.article.description).toBe(updatedDescription);
    expect(updateBody.article.body).toBe(article.body);
    expect(updateBody.article.slug).toBe(slug);

    // ASSERT — persisted state
    const getResponse = await getArticle(
        request,
        slug,
        apiUser.token
    );

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();

    expect(getBody.article.title).toBe(article.title);
    expect(getBody.article.description).toBe(updatedDescription);
    expect(getBody.article.body).toBe(article.body);
});

test('ARTICLE-TC-10 — authenticated user can update article body only', async ({ request, articleCleanup }) => {
    // ARRANGE
    const unique = randomUUID();
    articleCleanup.setToken(apiUser.token);

    const article = {
        title: `Body Update Article ${unique}`,
        description: 'Original description',
        body: 'Original body'
    };

    const createResponse = await createArticle(
        request,
        apiUser.token,
        article
    );

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    const slug = createBody.article.slug;

    articleCleanup.track(slug);

    const updatedBody = 'Updated article body';

    // ACT
    const updateResponse = await updateArticle(
        request,
        apiUser.token,
        slug,
        {
            body: updatedBody
        }
    );

    // ASSERT — update response
    expect(updateResponse.status()).toBe(200);

    const updateBody = await updateResponse.json();

    expect(updateBody.article.title).toBe(article.title);
    expect(updateBody.article.description).toBe(article.description);
    expect(updateBody.article.body).toBe(updatedBody);
    expect(updateBody.article.slug).toBe(slug);

    // ASSERT — persisted state
    const getResponse = await getArticle(
        request,
        slug,
        apiUser.token
    );

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();

    expect(getBody.article.title).toBe(article.title);
    expect(getBody.article.description).toBe(article.description);
    expect(getBody.article.body).toBe(updatedBody);
});
