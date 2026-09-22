# ARCH-203 — Minimal Automation Decisions

## Goal

Capture the architecture decisions that emerged from the first implemented RealWorld automation slices without introducing unnecessary framework complexity.

## Decisions

### 1. UI vs API Boundary

UI tests are used when user interaction and visible application behaviour are important.

API tests are used to:

* Validate backend and data flow directly.
* Prepare test data when setup is not the behaviour under test.
* Avoid unnecessary UI steps during test setup.

This keeps UI tests focused on actual user behaviour.

### 2. Test Data Strategy

Test-data creation depends on the behaviour under test.

If user creation is not part of the behaviour being tested, the test user is created through the API instead of the UI.

Fresh and unique test data is created for each test to reduce:

* Data collisions.
* Dependencies between tests.
* Failures caused by previously modified test data.

### 3. Cleanup Limitation

The current SUT does not provide a supported user-deletion operation.

Because deterministic cleanup is not available, tests avoid shared reusable accounts and create fresh data for each execution.

This keeps tests independent even when created users remain in the environment.

### 4. Current Helper Responsibilities

Responsibilities are separated between small helpers:

* `test-user.ts` manages test-user setup. It generates unique credentials, delegates user creation to the API layer, validates successful setup, and returns the data required by tests.
* `users-api.ts` contains user-related API operations, endpoint usage, and request details.
* `navigation.ts` contains reusable page-navigation actions such as opening the login page.

This separation reduces duplication and keeps changes localized without introducing a large framework.

### 5. Abstractions Intentionally Deferred

The following abstractions have not been introduced yet:

* Page Object Model
* Base API client
* Generic request wrappers
* Custom fixtures
* Authentication-state reuse
* Large class hierarchies

The current suite is still small, so these abstractions would add complexity without solving a real maintenance problem.

They should be introduced when repeated patterns or duplication appear in the implemented tests.

### 6. Environment and Configuration

The UI base URL is configured in `playwright.config.ts`.

The API base URL is stored separately in:

`tests/config/environment.ts`

The API URL can be overridden through an environment variable.

UI and API configuration are kept separate because they use different hosts and serve different purposes.

This also makes future CI and multi-environment execution easier.

### 7. Next Automation and Refactoring Direction

The next priority is to grow the test suite with Article CRUD automation.

After repeated authentication and setup patterns appear, the next likely refactoring steps are:

1. Introduce fixtures where they remove real setup duplication.
2. Introduce authentication-state reuse where repeated login becomes expensive or repetitive.
3. Expand framework abstractions only when the growing suite creates a clear need.

CI/CD, broader Page Object structure, API-client expansion, and suite tagging should follow when the project has enough complexity to justify them.

## Architecture Principle

The framework should evolve from implemented tests and observed maintenance needs.

Abstractions should be introduced when they solve real duplication, readability, or maintainability problems rather than being designed in advance.
