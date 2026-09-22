# PW-210 — Article CRUD Requirements

## Purpose

This document extends the article requirements already captured in `PORT-201-requirements.md` and defines the requirement baseline for PW-210.

The requirements below are derived from the RealWorld backend specification. Undefined behaviour is not converted into a requirement.

## Source Basis

Primary source:
- RealWorld Backend Specification — Articles endpoints
- RealWorld single-article response schema
- Existing `PORT-201-requirements.md`

## Existing Article Creation Requirements

### ARTICLE-REQ-01
An authenticated user can create an article.

**Endpoint:** `POST /api/articles`

### ARTICLE-REQ-02
Article creation requires:
- `title`
- `description`
- `body`

### ARTICLE-REQ-03
Successful article creation returns an Article representation.

### ARTICLE-REQ-04
An Article representation contains:
- `slug`
- `title`
- `description`
- `body`
- `tagList`
- `createdAt`
- `updatedAt`
- `favorited`
- `favoritesCount`
- `author`

### ARTICLE-REQ-05
An unauthenticated user cannot create an article.

## Additional Create Requirement

### ARTICLE-REQ-06
Article creation may include `tagList` as an optional array of strings.

## Read Requirements

### ARTICLE-REQ-07
A single article can be retrieved by its slug.

**Endpoint:** `GET /api/articles/:slug`

Authentication is not required.

### ARTICLE-REQ-08
Successful retrieval returns a single Article representation.

The returned Article follows the structure defined in `ARTICLE-REQ-04`.

## Update Requirements

### ARTICLE-REQ-09
An authenticated user can update an article.

**Endpoint:** `PUT /api/articles/:slug`

### ARTICLE-REQ-10
The update request may contain any of the following optional fields:
- `title`
- `description`
- `body`

The specification does not require all three fields to be sent together.

### ARTICLE-REQ-11
When the article title changes, the article slug is updated.

### ARTICLE-REQ-12
Successful article update returns the updated Article representation.

### ARTICLE-REQ-13
An unauthenticated user cannot update an article.

## Delete Requirements

### ARTICLE-REQ-14
An authenticated user can delete an article.

**Endpoint:** `DELETE /api/articles/:slug`

### ARTICLE-REQ-15
An unauthenticated user cannot delete an article.

## Requirement-to-Endpoint Summary

| Requirement | Endpoint | Area |
|---|---|---|
| ARTICLE-REQ-01 | `POST /api/articles` | Create |
| ARTICLE-REQ-02 | `POST /api/articles` | Create validation |
| ARTICLE-REQ-03 | `POST /api/articles` | Create response |
| ARTICLE-REQ-04 | Article response | Response contract |
| ARTICLE-REQ-05 | `POST /api/articles` | Authentication |
| ARTICLE-REQ-06 | `POST /api/articles` | Optional tags |
| ARTICLE-REQ-07 | `GET /api/articles/:slug` | Read |
| ARTICLE-REQ-08 | `GET /api/articles/:slug` | Read response |
| ARTICLE-REQ-09 | `PUT /api/articles/:slug` | Update |
| ARTICLE-REQ-10 | `PUT /api/articles/:slug` | Update fields |
| ARTICLE-REQ-11 | `PUT /api/articles/:slug` | Slug behaviour |
| ARTICLE-REQ-12 | `PUT /api/articles/:slug` | Update response |
| ARTICLE-REQ-13 | `PUT /api/articles/:slug` | Authentication |
| ARTICLE-REQ-14 | `DELETE /api/articles/:slug` | Delete |
| ARTICLE-REQ-15 | `DELETE /api/articles/:slug` | Authentication |

## Ambiguities / Not Yet Requirements

The following behaviours are intentionally **not** treated as requirements until supported by the specification or explicitly verified:

- Whether only the article author can update or delete an article.
- Exact response status/body when a non-owner attempts update/delete.
- Behaviour for duplicate article titles.
- Minimum/maximum lengths for title, description, or body.
- Exact validation behaviour for empty strings versus omitted fields.
- Exact response for a missing/non-existent slug.
- Behaviour of an update request containing no editable fields.
- Updating `tagList` through the update endpoint.
- Exact error status codes and error-body structure for authentication/validation failures.

These items may become additional test conditions only after contract evidence or explicit SUT behaviour is reviewed.
