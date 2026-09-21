# AI-301 — AI-Assisted Authentication Review

## Existing Coverage

- AUTH-UI-01 — Registered user can log in with valid credentials
- AUTH-UI-02 — Registered user cannot log in with incorrect password

## AI Candidate Scenarios

### Candidate 1
Login with an unregistered email and a valid-looking password.

Decision: ACCEPT 

Reason: Reason: We have not tested this credential combination yet. The existing negative test covers a registered user with an incorrect password, while this scenario covers an unregistered email with a valid-looking password.


### Candidate 2
Login with an empty email.

Decision: REJECT

Reason: Requirement is not defined clearly.


### Candidate 3
Login with an empty password.

Decision: REJECT 

Reason:Requirement is not defined clearly


### Candidate 4
Login with an invalid email format.

Decision: REJECT 

Reason:Requirement is not defined clearly


### Candidate 5
Login with both email and password invalid at the same time.

Decision:  REJECT

Reason: Two variables would change at the same time, making the failure cause less clear. It also adds little value beyond the existing and selected negative authentication scenarios.


## Selected Change

Scenario selected for implementation:
1

Why:
This scenario adds a distinct invalid-credential path to AUTH-REQ-04 without
changing multiple variables at once. It complements the existing incorrect-
password test while keeping the failure cause clear.

## Lessons Learned

- Not every AI-suggested scenario should be automated. Suggestions should be
  checked against documented requirements, risk and existing coverage.

- Similar-looking negative tests may exercise different layers. Empty or
  malformed inputs can be UI/browser validation rather than authentication
  behavior.

- Changing one important variable at a time makes negative authentication
  failures easier to understand and diagnose.