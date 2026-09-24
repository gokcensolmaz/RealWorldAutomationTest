# API-207 — Test Data Strategy

## User Creation

Tests create unique users through the API instead of the UI when registration is not the behavior under test.

Each test generates unique credentials to reduce collisions between parallel and repeated executions.

## Cleanup

The current RealWorld API used by this project does not provide a supported user-deletion operation for test cleanup.

Therefore:

- Test users are created with unique identities.
- Tests do not depend on previously created users.
- Tests must remain independent and repeatable.
- User-data accumulation is treated as an environment limitation.

A resettable/local test environment should be preferred in a production-grade automation system where deterministic cleanup is required.

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
- repeated parallel executions produced intermittent `author.username` mismatches
- UUID-based test users did not resolve the issue

After the strategy change:
- Playwright setup + 30 repeated article tests ran with 4 workers
- **31/31 tests passed**

This is an environment-specific test-data decision, not a general rule that all tests should share one account.
