# AI-Assisted Engineering Worklog

## PW-204 — RealWorld Playwright Baseline

### Goal

Create a clean Playwright + TypeScript baseline repository for the RealWorld automation project.

### AI Assistance

AI was used to:
- Define the initial repository structure.
- Review the Playwright project setup.
- Suggest a minimal smoke-test approach.
- Help separate environment verification from business test automation.
- Guide the Git initialization and first commit process.

### Human Decisions

I decided to:
- Use Playwright with TypeScript.
- Keep the initial smoke test minimal.
- Avoid implementing business test scenarios during the baseline setup.
- Postpone Page Objects, fixtures, CI/CD, and framework abstractions until they are needed.
- Keep requirement documentation inside the repository.

### Human Validation

I manually:
- Created and reviewed the project structure.
- Ran the Playwright smoke test locally.
- Verified the Chromium execution passed.
- Reviewed the generated/configured files.
- Verified Git status and repository state.

### Outcome

- Playwright project baseline created.
- Chromium execution verified.
- Smoke test passed.
- Requirements documentation added to the repository.
- Git repository initialized and committed successfully.


## PW-205 — Core Authentication Slice

### Goal

Implement the first requirement-driven authentication automation slice covering successful and unsuccessful login scenarios.

### AI Assistance

AI was used to:

* Help translate authentication requirements into test conditions.
* Review the API-assisted test-data setup approach.
* Review the positive and negative login scenarios.
* Help diagnose an import/export issue in the shared navigation helper.

### Human Decisions

I decided to:

* Create registered users through the API instead of the UI because registration was test setup, not the behavior under test.
* Keep login as the UI behavior being validated.
* Use a valid registered email with an incorrect password for the negative scenario so only one variable changes.
* Extract login-page navigation into a reusable helper.

### Human Validation

I manually:

* Implemented the authentication tests.
* Ran the tests locally in Chromium.
* Verified successful login with valid credentials.
* Verified login rejection with an incorrect password.
* Confirmed that the API-created test users could be used successfully in the UI flow.
* Fixed and re-ran the tests after identifying the navigation helper export issue.

### Outcome

* AUTH-UI-01 — Valid login passed.
* AUTH-UI-02 — Incorrect password login was rejected as expected.
* API-assisted test-data setup was successfully integrated with UI automation.
* Requirement-to-test traceability was established for the first authentication slice.
