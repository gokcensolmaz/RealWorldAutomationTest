# PORT-201 — Requirements Inventory

## 1. Authentication Requirements

| ID | Requirement | Source | Notes |
|---|---|---|---|
| AUTH-REQ-01 | User can register with user name, email and password | POST /users - OpenAPI | ... |
| AUTH-REQ-02 | Registered User can login with email and password | POST /users/login - OpenAPI| ... |
| AUTH-REQ-03 | Logged User can see own informations | GET /user -  OpenAPI| ... |
| AUTH-REQ-04 | Invalid login credentials must be rejected. | POST /users/login - OpenAPI| ... |



## 2. Article Creation Requirements

| ID | Requirement | Source | Notes |
|---|---|---|---|
| ARTICLE-REQ-01 | Authenticated User can create an article| POST /articles -  OpenAPI | ... |
| ARTICLE-REQ-02 | Article creation requires title, description and body | POST /articles - OpenAPI | ... |
| ARTICLE-REQ-03 | Successful article creation returns an article representation. | POST /articles - OpenAPI | ... |
| ARTICLE-REQ-04 | Returned article contains slug, title, description, body, taglist, createdAt, updatedAt,favorited, favorites count and author| POST /articles - OpenAPI & spec/single article | ... |
| ARTICLE-REQ-05 | Unauthenticated user cannot create an article | spec/create article | ... |

## 3. Assumptions

- No assumptions are currently made. Undefined behaviour is recorded under Ambiguities / Questions.

## 4. Ambiguities / Questions

- Is there any obligations for password?
- Is there any restrictions on length/format for article title,body,description?
- Is it okay to have duplicate article titles?
- Is there any restriction for userId aspects of length, format?
- Is it okay to have duplicated user names?



## 5. Short Behaviour Summary

Authentication:
Registration allows a new user to create an account using the documented credentials.
A registered user can authenticate and receive authenticated user information.
Authenticated requests can access the current user's information.


Article creation:
An authenticated user can create an article using the fields defined by the API specification.
A successful creation returns the newly created article in the documented article response structure.