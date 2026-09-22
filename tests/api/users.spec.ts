import { test, expect } from '@playwright/test';
import { createUser, getCurrentUser } from './users-api';

test('API-AUTH-01 — Create user and retrieve current user', async ({ request }) => {
    // ARRANGE
    const unique = Date.now();

    const user = {
        username: `gokcen_api_${unique}`,
        email: `gokcen_api_${unique}@example.com`,
        password: 'Test1234!'
    };

    // ACT — POST
    const createResponse = await createUser(request, user);

    // ASSERT — POST
    expect(createResponse.ok()).toBeTruthy();

    const createBody = await createResponse.json();

    expect(createBody.user.username).toBe(user.username);
    expect(createBody.user.email).toBe(user.email);
    expect(createBody.user.token).toBeTruthy();

    // ACT — GET
    const getResponse = await getCurrentUser(
        request,
        createBody.user.token
    );

    // ASSERT — GET
    expect(getResponse.ok()).toBeTruthy();

    const getBody = await getResponse.json();

    expect(getBody.user.username).toBe(user.username);
    expect(getBody.user.email).toBe(user.email);
});