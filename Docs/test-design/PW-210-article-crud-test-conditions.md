# PW-210 — Article CRUD Test Conditions

## Purpose

Define requirement-linked test conditions for the PW-210 Article CRUD automation slice.

Initial implementation should be **API-first** because CRUD, validation, authentication, and cleanup can be exercised directly and efficiently at the service layer. Important UI journeys can be added later within PW-210 after API coverage is stable.

## Test Conditions

| Test Condition | Requirement(s) | Condition | Type | Initial Layer | Expected Result | Priority |
|---|---|---|---|---|---|---|
| ARTICLE-TC-01 | REQ-01, REQ-02, REQ-03, REQ-04 | Authenticated user creates an article with title, description, and body | Positive | API | Article is created and returned with the documented Article representation | P0 |
| ARTICLE-TC-02 | REQ-01, REQ-03, REQ-04, REQ-06 | Authenticated user creates an article with a tagList | Positive | API | Article is created and returned with the supplied tags represented in `tagList` | P1 |
| ARTICLE-TC-03 | REQ-02 | Authenticated user attempts to create an article without title | Negative / Validation | API | Request is rejected according to the API contract | P0 |
| ARTICLE-TC-04 | REQ-02 | Authenticated user attempts to create an article without description | Negative / Validation | API | Request is rejected according to the API contract | P0 |
| ARTICLE-TC-05 | REQ-02 | Authenticated user attempts to create an article without body | Negative / Validation | API | Request is rejected according to the API contract | P0 |
| ARTICLE-TC-06 | REQ-05 | Unauthenticated user attempts to create a valid article | Negative / Authentication | API | Request is rejected and no article is created | P0 |
| ARTICLE-TC-07 | REQ-07, REQ-08, REQ-04 | Retrieve an existing article by slug without authentication | Positive | API | The requested article is returned with the documented Article representation | P0 |
| ARTICLE-TC-08 | REQ-09, REQ-10, REQ-11, REQ-12 | Authenticated user updates article title | Positive | API | Title is updated, returned Article reflects the new title, and slug changes accordingly | P0 |
| ARTICLE-TC-09 | REQ-09, REQ-10, REQ-12 | Authenticated user updates article description only | Positive | API | Description is updated while the request succeeds without requiring title/body | P1 |
| ARTICLE-TC-10 | REQ-09, REQ-10, REQ-12 | Authenticated user updates article body only | Positive | API | Body is updated while the request succeeds without requiring title/description | P1 |
| ARTICLE-TC-11 | REQ-13 | Unauthenticated user attempts to update an existing article | Negative / Authentication | API | Request is rejected and the article remains unchanged | P0 |
| ARTICLE-TC-12 | REQ-14 | Authenticated user deletes an existing article | Positive | API | Delete request succeeds; follow-up behaviour should confirm the article is no longer available once the missing-resource contract is verified | P0 |
| ARTICLE-TC-13 | REQ-15 | Unauthenticated user attempts to delete an existing article | Negative / Authentication | API | Request is rejected and the article remains available | P0 |

## Traceability Notes

`ARTICLE-REQ-04` does not need a separate test case for every field. The response contract can be asserted inside the positive Create, Read, and Update tests.

Validation tests intentionally omit **one required field at a time**. This isolates the variable under test and makes failures easier to diagnose.

Authentication-negative tests should use otherwise valid article data so the authentication rule remains the primary reason for rejection.

## Test Data Strategy

- Create a unique authenticated user for tests that require ownership/setup.
- Generate unique article titles to avoid collisions.
- Use API creation for setup when article creation itself is not the behaviour under test.
- Use the supported article delete endpoint for cleanup where possible.
- Negative delete tests should clean up afterward using an authenticated request.
- Tests must not depend on article data created by another test.

## Initial Automation Order

1. `ARTICLE-TC-01` — authenticated create
2. `ARTICLE-TC-07` — read by slug
3. `ARTICLE-TC-08` — update title and verify slug change
4. `ARTICLE-TC-12` — delete
5. `ARTICLE-TC-03/04/05` — required-field validation
6. `ARTICLE-TC-06` — unauthenticated create
7. `ARTICLE-TC-11` — unauthenticated update
8. `ARTICLE-TC-13` — unauthenticated delete
9. `ARTICLE-TC-02/09/10` — optional tags and partial-update coverage

This order establishes a working CRUD backbone first, then adds negative and validation coverage.

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

If the Hurl/OpenAPI contract explicitly defines any of these later, promote them into requirement-linked test conditions.
