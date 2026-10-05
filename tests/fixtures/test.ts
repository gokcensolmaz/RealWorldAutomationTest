
import { test as base, expect } from '@playwright/test';

import {
    createTestUser,
    type TestUser
} from '../helpers/test-user';

import { deleteArticle } from '../api/articles-api';

type ArticleCleanup = {
    track: (slug: string) => void;
    replace: (oldSlug: string, newSlug: string) => void;
    untrack: (slug: string) => void;
    setToken: (token: string) => void;
};

type TestFixtures = {
    testUser: TestUser;
    articleCleanup: ArticleCleanup;
};

export const test = base.extend<TestFixtures>({

    // Create a unique user for each test
    testUser: async ({ request }, use) => {
        const user = await createTestUser(request);

        await use(user);
    },

    // Track and clean up articles created during the test
    articleCleanup: async ({ request }, use) => {
        const slugs = new Set<string>();

        let cleanupToken = '';

        const cleanup: ArticleCleanup = {

            track: (slug) => {
                slugs.add(slug);
            },

            replace: (oldSlug, newSlug) => {
                slugs.add(newSlug);
                slugs.delete(oldSlug);
            },

            untrack: (slug) => {
                slugs.delete(slug);
            },

            setToken: (token) => {
                cleanupToken = token;
            }
        };


        // Execute the test
        await use(cleanup);

        if (slugs.size > 0 && !cleanupToken) {
            throw new Error(
                'Article cleanup cannot run: no authentication token was provided.'
            );
        }

        // Teardown — runs even if the test fails
        const errors: string[] = [];

        for (const slug of slugs) {
            try {
                const response = await deleteArticle(
                    request,
                    cleanupToken,
                    slug
                );

                // 404 means the article is already absent
                if (!response.ok() && response.status() !== 404) {
                    errors.push(
                        `${slug}: HTTP ${response.status()}`
                    );
                }

            } catch (error) {
                errors.push(
                    `${slug}: ${String(error)}`
                );
            }
        }

        if (errors.length > 0) {
            throw new Error(
                `Article cleanup failed:\n${errors.join('\n')}`
            );
        }
    }
});

export { expect };