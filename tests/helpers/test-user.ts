import { APIRequestContext, expect } from '@playwright/test';
import { createUser } from '../api/users-api';
import { randomUUID } from 'crypto';

export type TestUser = {
    username: string;
    email: string;
    password: string;
    token: string
};

export async function createTestUser(
    request: APIRequestContext
): Promise<TestUser> {

    const unique = randomUUID();

    const user: TestUser = {
        username: `gokcen_${unique}`,
        email: `gokcen_${unique}@example.com`,
        password: 'Test1234!',
        token: ''
    };

    const response = await createUser(request, user);

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    expect(body.user.username).toBe(user.username);
    expect(body.user.email).toBe(user.email);
    expect(body.user.token).toBeTruthy();

    return {
        ...user,
        token: body.user.token
    };
}