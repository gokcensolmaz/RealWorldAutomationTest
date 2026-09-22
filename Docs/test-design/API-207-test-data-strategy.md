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