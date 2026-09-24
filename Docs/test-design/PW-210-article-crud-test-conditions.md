# PW-210 — Article CRUD Test Conditions

## Purpose

Define requirement-linked test conditions for the PW-210 Article CRUD automation slice.

Implementation is **API-first** because CRUD, validation, authentication, and cleanup can be exercised directly and efficiently at the service layer. Important UI journeys can be added later within PW-210 after API coverage is stable.

## Test Conditions

| Test Condition | Requirement(s) | Condition | Type | Initial Layer | Expected Result | Priority | Status |
|---|---|---|---|---|---|---|---|
| ARTICLE-TC-01 | REQ-01, REQ-02, REQ-03, REQ-04 | Authenticated user creates an article with title, description, and body | Positive | API | Article is created and returned with the documented Article representation | P0 | Automated — `ARTICLE-API-01` passing |
| ARTICLE-TC-02 | REQ-01, REQ-03, REQ-04, REQ-06 | Authenticated user creates an article with a `tagList` | Positive | API | Article is created and returned with the supplied tags represented in `tagList` | P1 | Planned |
| ARTICLE-TC-03 | REQ-02 | Authenticated user attempts to create an article without title | Negative / Validation | API | Request is rejected according to the API contract | P0 | Planned |
| ARTICLE-TC-04 | REQ-02 | Authenticated user attempts to create an article without description | Negative / Validation | API | Request is rejected according to the API contract | P0 | Planned |
| ARTICLE-TC-05 | REQ-02 | Authenticated user attempts to create an article without body | Negative / Validation | API | Request is rejected according to the API contract | P0 | Planned |
| ARTICLE-TC-06 | REQ-05 | Unauthenticated user attempts to create a valid article | Negative / Authentication | API | Request is rejected and no article is created | P0 | Planned |
| ARTICLE-TC-07 | REQ-07, REQ-08, REQ-04 | Retrieve an existing article by slug without authentication | Positive | API | The requested article is returned with the documented Article representation | P0 | Partially covered — authenticated retrieval passes; anonymous retrieval is blocked by hosted-environment behaviour |
| ARTICLE-TC-08 | REQ-09, REQ-10, REQ-11, REQ-12 | Authenticated user updates article title | Positive | API | Title is updated, returned Article reflects the new title, and slug changes accordingly | P0 | Automated — `ARTICLE-API-03` passing |
| ARTICLE-TC-09 | REQ-09, REQ-10, REQ-12 | Authenticated user updates article description only | Positive | API | Description is updated while the request succeeds without requiring title/body | P1 | Planned |
| ARTICLE-TC-10 | REQ-09, REQ-10, REQ-12 | Authenticated user updates article body only | Positive | API | Body is updated while the request succeeds without requiring title/description | P1 | Planned |
| ARTICLE-TC-11 | REQ-13 | Unauthenticated user attempts to update an existing article | Negative / Authentication | API | Request is rejected and the article remains unchanged | P0 | Planned |
| ARTICLE-TC-12 | REQ-14 | Authenticated user deletes an existing article | Positive | API | Delete request succeeds; post-delete behaviour is verified using the actual contract/observed response | P0 | Next |
| ARTICLE-TC-13 | REQ-15 | Unauthenticated user attempts to delete an existing article | Negative / Authentication | API | Request is rejected and the article remains available | P0 | Planned |

## Current Automated Coverage

### ARTICLE-API-01 — Create article
Covers `ARTICLE-TC-01`.

Verified:
- authenticated `POST /api/articles`
- request title, description, and body are returned correctly
- Article response contains `slug`, `createdAt`, `updatedAt`, `tagList`, `favorited`, `favoritesCount`, and `author`
- returned author username matches the authenticated test user

### ARTICLE-API-02 — Retrieve created article by slug
Provides supporting coverage for Read behaviour.

Verified with authentication:
- created article can be retrieved by slug
- slug, title, description, body, and author match the created article

This does **not** fully satisfy `ARTICLE-TC-07`, because that condition requires unauthenticated retrieval.

### ARTICLE-API-03 — Update article title
Covers `ARTICLE-TC-08`.

Verified:
- authenticated user can update title
- description and body remain unchanged
- slug changes when title changes
- article can be retrieved by the updated slug
- updated state persists

## Environment Observation — Anonymous Article Retrieval

`ARTICLE-TC-07` expects an existing article to be retrievable by slug without authentication.

In the current hosted RealWorld environment, a newly created test article returned:

`404 {"errors":{"article":["not found"]}}`

when retrieved without authentication.

The same article was successfully returned when the creating user's token was supplied.

This behaviour is recorded as an **environment/specification discrepancy**. The requirement is not changed to match the environment.

## Parallel Execution Observation

Running article tests with separate freshly created users exposed intermittent author mismatches during parallel execution.

Observed pattern:
- the retrieved article matched the expected slug/title/description/body
- `author.username` sometimes belonged to another concurrently created test user
- changing user and article identifiers from `Date.now()` to UUIDs did not remove the issue
- the same test was stable when concurrency was removed

A follow-up strategy was introduced:
- one API identity is created once per Playwright run by a setup project
- article resources remain unique per test
- the API identity is treated as shared, stable setup state and is not mutated by article tests
- credentials/token are stored only in `playwright/.auth/api-user.json`, which must remain gitignored

Stress verification after this change:

- setup + 30 repeated article tests
- 4 workers
- **31/31 passed**

This keeps article tests parallel without weakening ownership assertions or serializing the suite.

## Traceability Notes

`ARTICLE-REQ-04` does not need a separate test case for every field. The response contract is asserted inside positive Create, Read, and Update tests where relevant.

Validation tests intentionally omit **one required field at a time**. This isolates the variable under test and makes failures easier to diagnose.

Authentication-negative tests should use otherwise valid article data so authentication remains the primary reason for rejection.

## Test Data Strategy

For Article API tests:

- Create one stable API test identity per Playwright run through the setup project.
- Do not mutate that shared user's profile/account state inside article tests.
- Generate a unique article title/resource for every test using UUID-based data.
- Tests must not depend on article data created by another test.
- Use API creation for setup when article creation itself is not the behaviour under test.
- Use the supported article delete endpoint for cleanup where possible.
- Negative delete tests should clean up afterward using an authenticated request.
- Tests that specifically exercise account isolation, ownership between users, or profile mutation must use separate users rather than the shared Article API identity.

## Updated Automation Order

Completed:
1. `ARTICLE-TC-01` — authenticated create
2. Read supporting coverage — authenticated retrieval by slug
3. `ARTICLE-TC-08` — update title and verify slug change

Next:
4. `ARTICLE-TC-12` — authenticated delete

Then:
5. `ARTICLE-TC-03/04/05` — required-field validation
6. `ARTICLE-TC-06` — unauthenticated create
7. `ARTICLE-TC-11` — unauthenticated update
8. `ARTICLE-TC-13` — unauthenticated delete
9. `ARTICLE-TC-02/09/10` — optional tags and partial-update coverage

`ARTICLE-TC-07` remains open for true unauthenticated retrieval because the hosted environment currently prevents direct verification of the documented behaviour.

## Deferred / Needs Contract Verification

Do not automate these as formal requirement tests yet:

- Non-owner update/delete authorization.
- Missing/non-existent slug behaviour.
- Duplicate-title behaviour.
- Empty-string boundary behaviour.
- Title/description/body length boundaries.
- Empty update body.
- Updating `tagList`.
- Exact error-message assertions where the contract has not yet defined them.

If later contract evidence explicitly defines any of these, promote them into requirement-linked test conditions.
