import { APIRequestContext } from '@playwright/test';
import { environment } from '../config/environment';

export type CreateArticleRequest = {
    title: string;
    description: string;
    body: string;
    tagList?: Array<string>
}

export async function createArticle(
    request: APIRequestContext,
    token: string,
    article: CreateArticleRequest) {
    return request.post(`${environment.apiBaseUrl}/articles`, {
        headers: {
            Authorization: `Token ${token}`
        },
        data: {
            article
        }
    });

}

export async function getArticle(
    request: APIRequestContext,
    slug: string,
    token?: string
) {
    return request.get(
        `${environment.apiBaseUrl}/articles/${encodeURIComponent(slug)}`,
        {
            headers: token
                ? { Authorization: `Token ${token}` }
                : undefined
        }
    );
}

export type UpdateArticleRequest = {
    title?: string;
    description?: string;
    body?: string;
};

export async function updateArticle(
    request: APIRequestContext,
    token: string,
    slug: string,
    article: UpdateArticleRequest
) {
    return request.put(
        `${environment.apiBaseUrl}/articles/${encodeURIComponent(slug)}`,
        {
            headers: {
                Authorization: `Token ${token}`
            },
            data: {
                article
            }
        }
    );
}