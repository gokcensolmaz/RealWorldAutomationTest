import { test as setup } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { createTestUser } from '../helpers/test-user';

const apiUserFile = path.resolve(
    'playwright/.auth/api-user.json'
);

setup('create shared API test user', async ({ request }) => {
    const user = await createTestUser(request);

    await mkdir(path.dirname(apiUserFile), {
        recursive: true
    });

    await writeFile(
        apiUserFile,
        JSON.stringify(
            {
                username: user.username,
                token: user.token
            },
            null,
            2
        ),
        'utf-8'
    );
});