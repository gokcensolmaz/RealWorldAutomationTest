# PW-205 — Authentication Test Conditions

## Scope

Related requirements:

* AUTH-REQ-02 — Registered user can login with email and password.
* AUTH-REQ-04 — Invalid login credentials must be rejected.

## Test Conditions

| ID         | Requirement | Test Condition                                                                      | Type     | Expected Behaviour                                                                  |
| ---------- | ----------- | ----------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| AUTH-TC-01 | AUTH-REQ-02 | A registered user can log in using valid credentials.                               | Positive | The user is authenticated successfully and can access the authenticated user state. |
| AUTH-TC-02 | AUTH-REQ-04 | A registered user attempts to log in using a valid email and an incorrect password. | Negative | The login attempt is rejected and the user remains unauthenticated.                 |

## Automation Notes

### AUTH-TC-01

* Test data setup: Create a user through the API with a valid email and password.
* Action under test: Log in through the UI.
* Main verification: The user is successfully authenticated using the credentials created during test setup.

### AUTH-TC-02

* Test data setup: Create a user through the API with a valid email and password.
* Action under test: Attempt to log in through the UI using the registered email and an incorrect password.
* Main verification: The login attempt is rejected and the user remains unauthenticated.
