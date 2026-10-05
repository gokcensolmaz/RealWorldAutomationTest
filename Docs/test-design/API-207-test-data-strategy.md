# API-207 — Test Data Strategy

## User Creation

Tests create unique users through the API instead of the UI when registration is not the behavior under test.

Each test generates unique credentials to reduce collisions between parallel and repeated executions.

## User Cleanup

The current RealWorld API used by this project does not provide a supported user-deletion operation for test cleanup.

Therefore:

- Test users are created with unique identities.
- Tests do not depend on previously created users.
- Tests must remain independent and repeatable.
- User-data accumulation is treated as an environment limitation.

A resettable/local test environment should be preferred in a production-grade automation system where deterministic user cleanup is required.

## Configuration

The API base URL is environment-configurable through `API_BASE_URL`.

A default public RealWorld API URL is used for local development.

## PW-210 Article API Strategy — Shared Stable Identity, Unique Resources

The default strategy remains to create fresh, independent test data where practical.

During PW-210 Article CRUD implementation, the hosted RealWorld environment showed unstable article-author association when parallel workers created separate users concurrently. UUID-based user and article identifiers did not eliminate the issue.

For Article API tests, the strategy is therefore narrowed as follows:

- A Playwright setup project creates **one API test identity per test run**.
- The identity's username and token are written to `playwright/.auth/api-user.json`.
- `playwright/.auth/` must remain gitignored because it contains authentication material.
- Article tests may share this identity only while they do **not mutate the shared user's profile/account state**.
- Every article remains a unique mutable resource owned by a single test.
- Article titles and other generated identifiers use UUID-based data.
- No test may depend on an article created or modified by another test.
- Tests that verify multi-user ownership, account isolation, profile mutation, or user-specific authorization must create separate users and must not reuse the shared identity.

### Evidence

Before the strategy change:

- Repeated parallel executions produced intermittent `author.username` mismatches.
- UUID-based test users did not resolve the issue.

After the strategy change:

- Playwright setup + 30 repeated article tests ran with 4 workers.
- **31/31 tests passed.**

This is an environment-specific test-data decision, not a general rule that all tests should share one account.

## ARCH-214 — Reusable Fixtures and Resource Lifecycle

Repeated user setup and article cleanup are implemented through reusable Playwright fixtures in `tests/fixtures/test.ts`.

The fixtures are intended to remove real duplication while keeping test ownership and lifecycle behavior visible.

### `testUser` Fixture

The `testUser` fixture creates a fresh unique user for tests that require an independent identity.

It uses the existing API-based user creation helper instead of registering through the UI when registration itself is not under test.

This preserves:

- unique credentials per test
- independence between UI tests
- UUID-based test data
- readable test setup

The fixture does not attempt to delete users after execution because the hosted RealWorld API does not expose a supported user-deletion operation.

## Article Cleanup Fixture

The `articleCleanup` fixture manages mutable article resources created during a test.

The fixture:

- stores the authentication token used for cleanup
- tracks article slugs created by the test
- updates tracked state when an article slug changes
- removes resources during fixture teardown
- accepts HTTP `404` during teardown because the article may already have been deleted by the behavior under test
- reports cleanup failures instead of silently ignoring them

A test must provide a valid cleanup token when it tracks one or more articles.

If tracked resources exist but no cleanup token has been provided, teardown fails explicitly.

## Article Lifecycle Rules

Tests follow these lifecycle rules:

### Article creation

After a successful article creation response, the created slug is registered with:

```ts
articleCleanup.track(slug);
```

The resource remains tracked until the test finishes or explicitly removes it from cleanup ownership.

### Article title update

Updating an article title changes its slug in the current RealWorld implementation.

When this occurs, cleanup ownership is moved from the old slug to the new slug:

```ts
articleCleanup.replace(originalSlug, updatedSlug);
```

This prevents teardown from attempting to delete a stale slug while leaving the updated article behind.

### Article deletion under test

When the behavior under test successfully deletes an article, the article is removed from cleanup tracking:

```ts
articleCleanup.untrack(slug);
```

If a failure occurs after the application has already deleted the article but before `untrack()` executes, teardown may attempt another DELETE.

HTTP `404` is therefore accepted by the cleanup fixture as an already-absent resource rather than a cleanup failure.

### Negative authorization tests

Tests that verify an unauthenticated update or delete keep the article tracked.

The unauthorized operation is expected to fail, so the article should still exist after the assertion.

The cleanup fixture then removes it using the authenticated cleanup token during teardown.

## UI Authentication and Cleanup Token

UI article tests create their user through the `testUser` fixture and then authenticate through the application UI.

The cleanup fixture initially may receive the token created during API registration.

For flows that perform UI login, the token returned by the successful `/api/users/login` response is captured and used as the latest cleanup token.

This approach was adopted after observing that a registration-time token returned `401` during cleanup in a UI-login flow, while the token returned by the UI login request successfully performed cleanup.

This observation is treated as hosted-environment behavior. It does **not** establish that UI login universally invalidates the earlier token.

## Failure-Path Cleanup

Cleanup runs as fixture teardown after the test body finishes.

This means tracked resources can still be removed when a test assertion fails after successful resource creation.

Cleanup is registered as soon as the resource identifier is known.

There is one unavoidable limitation:

- if resource creation succeeds but the test fails before the response can be parsed and its slug registered, the fixture does not know which resource to delete

This is considered an acceptable limitation for the current public test environment.

## Parallel Execution Strategy

Parallel safety is based on resource ownership rather than shared mutable test data.

Current strategy:

- Article API tests share one stable identity per test run.
- Each Article API test creates its own unique article.
- UI article tests create separate users through the `testUser` fixture.
- Tests do not share mutable articles.
- Slugs are tracked independently by each test's cleanup fixture.

The hosted RealWorld environment has also shown intermittent instability under parallel multi-user UI execution and aggressive load.

For this reason, current Article UI verification is run with one worker while preserving strict ownership assertions rather than hiding instability with broad retries or weakened assertions.

## Verification

After the ARCH-214 fixture and cleanup migration:

- the Article API run passed with **14 tests including setup** (**13 Article API tests**)
- the Article UI run passed with **4 tests including setup** (**3 Article UI tests**)
- the combined Article API + UI regression passed with **17 tests including setup** using one worker

This verifies the fixture and lifecycle strategy across:

- article creation
- article retrieval
- authenticated article deletion
- title updates with slug replacement
- description-only updates
- body-only updates
- tagged article creation
- rejected unauthenticated updates
- rejected unauthenticated deletes
- UI create
- UI edit
- UI delete