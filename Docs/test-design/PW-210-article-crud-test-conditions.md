# PW-210 — Article CRUD Test Conditions

## Purpose

Define requirement-linked test conditions, automated coverage, test data strategy, and execution observations for the PW-210 Article CRUD automation slice.

The implementation follows an **API-first approach**. CRUD operations, validation, authentication, and persistence are primarily verified at the API layer. The most important user journeys are also covered through UI automation.

The scope includes:

* Article creation, retrieval, updating, and deletion.
* Required-field validation and authentication-negative scenarios.
* Optional tags and partial updates.
* UI-based article creation, editing, and deletion.
* API-based verification of persisted changes.
* Test data isolation and execution reliability.

## Test Conditions

| Test Condition | Requirement(s)                 | Condition                                                               | Type                      | Initial Layer | Expected Result                                                                         | Priority | Status                                                                                              |
| -------------- | ------------------------------ | ----------------------------------------------------------------------- | ------------------------- | ------------- | --------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| ARTICLE-TC-01  | REQ-01, REQ-02, REQ-03, REQ-04 | Authenticated user creates an article with title, description, and body | Positive                  | API           | Article is created and returned with the documented Article representation              | P0       | Automated — ARTICLE-API-01, ARTICLE-UI-01                                                           |
| ARTICLE-TC-02  | REQ-01, REQ-03, REQ-04, REQ-06 | Authenticated user creates an article with a `tagList`                  | Positive                  | API           | Article is created and returned with the supplied tags represented in `tagList`         | P1       | Automated — API                                                                                     |
| ARTICLE-TC-03  | REQ-02                         | Authenticated user attempts to create an article without title          | Negative / Validation     | API           | Request is rejected according to the API contract                                       | P0       | Automated — API                                                                                     |
| ARTICLE-TC-04  | REQ-02                         | Authenticated user attempts to create an article without description    | Negative / Validation     | API           | Request is rejected according to the API contract                                       | P0       | Automated — API                                                                                     |
| ARTICLE-TC-05  | REQ-02                         | Authenticated user attempts to create an article without body           | Negative / Validation     | API           | Request is rejected according to the API contract                                       | P0       | Automated — API                                                                                     |
| ARTICLE-TC-06  | REQ-05                         | Unauthenticated user attempts to create a valid article                 | Negative / Authentication | API           | Request is rejected and no article is created                                           | P0       | Automated — API                                                                                     |
| ARTICLE-TC-07  | REQ-07, REQ-08, REQ-04         | Retrieve an existing article by slug without authentication             | Positive                  | API           | The requested article is returned with the documented Article representation            | P0       | Partially covered — authenticated GET passes; anonymous GET blocked by hosted-environment behaviour |
| ARTICLE-TC-08  | REQ-09, REQ-10, REQ-11, REQ-12 | Authenticated user updates article title                                | Positive                  | API           | Title is updated, returned Article reflects the new title, and slug changes accordingly | P0       | Automated — ARTICLE-API-03, ARTICLE-UI-02                                                           |
| ARTICLE-TC-09  | REQ-09, REQ-10, REQ-12         | Authenticated user updates article description only                     | Positive                  | API           | Description is updated while the request succeeds without requiring title/body          | P1       | Automated — API                                                                                     |
| ARTICLE-TC-10  | REQ-09, REQ-10, REQ-12         | Authenticated user updates article body only                            | Positive                  | API           | Body is updated while the request succeeds without requiring title/description          | P1       | Automated — API                                                                                     |
| ARTICLE-TC-11  | REQ-13                         | Unauthenticated user attempts to update an existing article             | Negative / Authentication | API           | Request is rejected and the article remains unchanged                                   | P0       | Automated — API                                                                                     |
| ARTICLE-TC-12  | REQ-14                         | Authenticated user deletes an existing article                          | Positive                  | API           | Delete succeeds and the article is no longer retrievable                                | P0       | Automated — ARTICLE-API-04, ARTICLE-UI-03                                                           |
| ARTICLE-TC-13  | REQ-15                         | Unauthenticated user attempts to delete an existing article             | Negative / Authentication | API           | Request is rejected and the article remains available                                   | P0       | Automated — API                                                                                     |

**Coverage summary:** 12 of 13 test conditions are automated. ARTICLE-TC-07 remains partially covered because the hosted environment does not exhibit the expected anonymous retrieval behaviour.

## Current Automated Coverage

### ARTICLE-API-01 — Create Article

Covers `ARTICLE-TC-01`.

Verified:

* Authenticated `POST /api/articles` succeeds.
* The request's title, description, and body are returned correctly.
* The Article response contains `slug`, `createdAt`, `updatedAt`, `tagList`, `favorited`, `favoritesCount`, and `author`.
* The returned author username matches the authenticated test user.

### ARTICLE-API-02 — Retrieve Created Article by Slug

Provides supporting coverage for Read behaviour and partial coverage for `ARTICLE-TC-07`.

Verified with authentication:

* A created article can be retrieved by slug.
* Slug, title, description, body, and author match the created article.

This does **not** fully satisfy `ARTICLE-TC-07`, because that condition requires unauthenticated retrieval.

### ARTICLE-API-03 — Update Article Title

Covers `ARTICLE-TC-08`.

Verified:

* An authenticated user can update an article's title.
* Description and body remain unchanged.
* The slug changes when the title changes.
* The article can be retrieved using the updated slug.
* The updated state persists.

### ARTICLE-API-04 — Delete Article

Covers `ARTICLE-TC-12`.

Verified:

* An authenticated user can delete an existing article.
* The deleted article is no longer retrievable.
* A subsequent authenticated GET returns HTTP 404 with the observed not-found response.

### Additional API Coverage

The following conditions are implemented in `tests/api/articles.spec.ts`:

**Optional tags — ARTICLE-TC-02**

* Creates an article with a `tagList`.
* Verifies that the supplied tags are returned and persist when the article is retrieved.

**Required-field validation — ARTICLE-TC-03, 04, 05**

* Omits title, description, or body individually.
* Verifies HTTP 422 and the corresponding field-validation error.

**Unauthenticated creation — ARTICLE-TC-06**

* Attempts to create an otherwise valid article without authentication.
* Verifies that the request is rejected with HTTP 401.

**Partial updates — ARTICLE-TC-09, 10**

* Updates the description without supplying title or body.
* Updates the body without supplying title or description.
* Verifies that the requested changes persist and unrelated fields remain unchanged.

**Unauthenticated update — ARTICLE-TC-11**

* Attempts to update an existing article without authentication.
* Verifies HTTP 401.
* Confirms that the original article remains unchanged.

**Unauthenticated deletion — ARTICLE-TC-13**

* Attempts to delete an existing article without authentication.
* Verifies HTTP 401.
* Confirms that the article remains available afterward.

### ARTICLE-UI-01 — Create Article Through UI

Covers `ARTICLE-TC-01`.

Verified:

* An authenticated user can open the article editor.
* The user can enter a title, description, and body.
* Publishing sends the article creation request and returns HTTP 201.
* The user is redirected to the article detail page.
* The published title and body are displayed correctly.

### ARTICLE-UI-02 — Edit Article Through UI

Covers `ARTICLE-TC-08` and provides additional UI coverage for updating the description.

Verified:

* An existing article is created through the API as test setup.
* The created article belongs to the expected test user.
* The authenticated owner can access the Edit Article option.
* The existing title, description, and body are loaded into the editor.
* The user can modify the title and description.
* The updated title is displayed after publishing.
* The article's body remains unchanged.
* The slug changes when the title changes.
* An authenticated API GET confirms that the updated title, description, body, and slug are persisted correctly.

### ARTICLE-UI-03 — Delete Article Through UI

Covers `ARTICLE-TC-12`.

Verified:

* An existing article is created through the API as test setup.
* The created article belongs to the expected test user.
* The authenticated owner can access the Delete Article button.
* Deleting the article redirects the user to the home page.
* An authenticated API GET returns HTTP 404 after deletion.
* The response contains the observed not-found error.

## Environment Observation — Anonymous Article Retrieval

`ARTICLE-TC-07` expects an existing article to be retrievable by slug without authentication.

In the current hosted RealWorld environment, a newly created test article returned:

`404 {"errors":{"article":["not found"]}}`

when retrieved without authentication.

The same article was successfully returned when the creating user's token was supplied.

This behaviour is recorded as an **environment/specification discrepancy**. The requirement has not been changed to match the environment.

`ARTICLE-TC-07` remains partially covered until the expected anonymous retrieval behaviour can be verified.

## Parallel Execution and Reliability Observations

### Author Mismatch During Parallel Execution

Running article API tests with separate, freshly created users exposed intermittent author mismatches.

Observed pattern:

* The retrieved article matched the expected slug, title, description, and body.
* `author.username` sometimes belonged to another concurrently created test user.
* Changing user and article identifiers from `Date.now()` to UUIDs did not eliminate the issue.
* The same test was stable when concurrency was removed.

A revised test-data strategy was introduced:

* One API identity is created once per Playwright run by a setup project.
* Article resources remain unique per test.
* The shared API identity is not modified by article tests.
* The generated username and token are stored in `playwright/.auth/api-user.json`, which remains gitignored.

Verification after this change:

* Setup and 30 repeated article tests.
* Four workers.
* **31/31 passed.**

This approach allows the Article API tests to execute in parallel without weakening ownership assertions or making the suite serial.

### Public Environment Capacity

A larger repeated execution with approximately 60 article scenarios produced multiple HTTP 503 responses.

The observed failures included HTML responses from nginx rather than the expected API responses.

This indicates that the public environment may not reliably support aggressive concurrent test execution.

Stress testing against the shared hosted service is therefore not part of the normal verification approach.

### Intermittent UI Failures

During combined API and UI execution, intermittent UI failures were observed.

Examples:

* The article detail page displayed navigation and footer elements, but the expected article content was missing.
* The Edit Article link was not available within the expected timeout.
* The same UI tests passed when executed separately.

Additional checks were introduced:

* Verify that an API-created article belongs to the expected user.
* Verify that the correct article title is displayed before interacting with the article.
* Verify that the expected author is displayed before checking owner-specific controls.
* Verify the article creation response in ARTICLE-UI-01.

The combined Article API and UI suite subsequently passed with two workers and all assertions enabled.

However, the underlying cause of the earlier intermittent failures has **not been conclusively established**. The successful execution does not, by itself, prove that the issue has been resolved.

No broad retry mechanism, arbitrary fixed waits, or weakened assertions were introduced to conceal these failures.

## Traceability Notes

`ARTICLE-REQ-04` does not require a separate test case for every response field. The Article response contract is asserted within the relevant positive Create, Read, and Update tests.

Validation tests intentionally omit **one required field at a time**. This isolates the variable under test and makes failures easier to diagnose.

Authentication-negative tests use otherwise valid article data so that authentication remains the primary reason for rejection.

The three UI tests cover the main user-facing CRUD journeys. Additional API coverage provides more detailed validation, authentication, and persistence checks without duplicating every API scenario through the UI.

## Test Data Strategy

### Article API Tests

* Create one stable API test identity per Playwright run through the setup project.
* Do not modify the shared user's profile or account state inside Article API tests.
* Generate unique article titles and resources using UUID-based test data.
* Keep test scenarios independent of articles created by other tests.
* Use API creation for setup when article creation itself is not the behaviour under test.
* Use authenticated deletion for cleanup where implemented and appropriate.
* Tests involving account isolation, ownership between different users, or profile mutation must use separate users instead of the shared Article API identity.

### Article UI Tests

* Create a separate test user for each UI test.
* Perform login through the UI to exercise the authenticated user journey.
* Generate unique article data for each test.
* Create articles through the API when the behaviour under test is editing or deletion.
* Create articles through the UI when article creation itself is the behaviour under test.
* Use API requests to verify persisted state where appropriate.
* Keep the UI tests independent so they can execute in any order.

### Cleanup and Lifecycle Limitations

Automatic cleanup is not yet consistently implemented for every created test resource.

In particular:

* ARTICLE-UI-01 creates an article that is not automatically deleted at the end of the test.
* ARTICLE-UI-02 creates an article that remains after the update scenario.
* ARTICLE-UI-03 deletes its article as part of the behaviour under test.
* API tests may leave resources behind where cleanup has not yet been implemented.

Test-data lifecycle improvements are deferred to **ARCH-214 — Fixtures and Test Data Lifecycle**.

The planned improvements include reliable teardown, cleanup after failed tests, and consistent management of resources created during test setup.

## Implementation Status

**Implemented:**

* Article API create, read, update, and delete coverage.
* Required-field validation.
* Authentication-negative scenarios.
* Optional tags and partial updates.
* ARTICLE-UI-01 — Create Article.
* ARTICLE-UI-02 — Edit Article.
* ARTICLE-UI-03 — Delete Article.
* API-based verification of persisted UI changes.
* UUID-based resource isolation.
* Shared test identity for Article API tests.
* Separate test identities for Article UI tests.

**Verification:**

The combined Article API and UI suite passed with:

* Browser: Chromium.
* Workers: 2.
* All assertions enabled.

**Remaining limitations and follow-up work:**

* ARTICLE-TC-07 remains partially covered due to the hosted environment's anonymous retrieval behaviour.
* Earlier intermittent parallel-execution failures remain documented, with their root cause unconfirmed.
* Consistent automatic test-data cleanup is deferred to ARCH-214.

## Deferred / Needs Contract Verification

Do not introduce these as formal requirement-linked tests until the expected behaviour is confirmed:

* Non-owner update/delete authorization.
* Missing or non-existent slug behaviour beyond the observed post-deletion response.
* Duplicate-title behaviour.
* Empty-string boundary behaviour.
* Title, description, and body length boundaries.
* Empty update body.
* Updating `tagList`.
* Exact error-message assertions where the contract does not define the expected message.

If later contract evidence explicitly defines any of these behaviours, they can be promoted into requirement-linked test conditions and added to the automation backlog.
