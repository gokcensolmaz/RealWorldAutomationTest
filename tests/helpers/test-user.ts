import { APIRequestContext, expect } from '@playwright/test';

export type TestUser = {
    username: string;
    email: string;
    password: string;
};

export async function createTestUser(
    request: APIRequestContext
): Promise<TestUser> {

    const unique = Date.now();

    const user: TestUser = {
        username: `gokcen_${unique}`,
        email: `gokcen_${unique}@example.com`,
        password: 'Test1234!'
    };

    const response = await request.post(
        'https://api.realworld.show/api/users',
        {
            data: {
                user: {
                    username: user.username,
                    email: user.email,
                    password: user.password
                }
            }
        }
    );

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    expect(body.user.username).toBe(user.username);
    expect(body.user.email).toBe(user.email);
    expect(body.user.token).toBeTruthy();

    return user;
}