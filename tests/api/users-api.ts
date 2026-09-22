import { APIRequestContext } from '@playwright/test';
import { environment } from '../config/environment';


export type CreateUserRequest = {
    username: string;
    email: string;
    password: string;
};


export async function createUser(
    request: APIRequestContext,
    user: CreateUserRequest
) {
    return request.post(`${environment.apiBaseUrl}/users`, {
        data: {
            user
        }
    });
}

export async function getCurrentUser(
    request: APIRequestContext,
    token: String
) {
    return request.get(`${environment.apiBaseUrl}/user`, {
        headers: {
            Authorization: `Token ${token}`
        }
    });
}