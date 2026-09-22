# QA-206 — Test Plan and Coverage Matrix

## Scope

Features currently in scope:
- Authentication
- Article Creation

## Test Levels / Suites

### Smoke
Critical checks proving the application and core flow are usable.

### Sanity
Focused checks after a small change or fix.

### Regression
Broader checks protecting previously working behaviour.

### Acceptance
Tests mapped directly to documented requirements.

## Coverage Matrix

| Requirement | Test Condition | Test Case | Layer | Suite | Status |
|---|---|---|---|---|---|
| AUTH-REQ-02 | AUTH-TC-01 | AUTH-UI-01 | UI + API setup | Acceptance / Smoke / Regression| Automated |
| AUTH-REQ-04 | AUTH-TC-02 | AUTH-UI-02 | UI + API setup | Acceptance / Regression | Automated |
| ARTICLE-REQ-01 | TBD | TBD | TBD | Acceptance | Not Designed |
| ARTICLE-REQ-02 | TBD | TBD | TBD | TBD | Not Designed |
| ARTICLE-REQ-03 | TBD | TBD | TBD | TBD | Not Designed |
| ARTICLE-REQ-04 | TBD | TBD | TBD | TBD | Not Designed |
| ARTICLE-REQ-05 | TBD | TBD | TBD | TBD | Not Designed |

## Coverage Gaps

- Article Creation requirements have not yet been converted into test conditions.
- API-only coverage has not yet been implemented.
- No dedicated sanity suite exists yet.
- Article Creation requirements are currently untested because their test conditions have not yet been designed.

## Exit Criteria

QA-206 is complete when:

- Every in-scope requirement appears in the matrix.
- Every requirement is either covered or has an explicit reason for being untested.
- Existing automated tests are mapped to their requirements.
- Smoke, sanity, regression, and acceptance purposes are documented.
- UI/API responsibility is visible in the matrix.