# RealWorld Playwright Test Automation

Playwright and TypeScript test automation project for the RealWorld application.

This project is being developed incrementally to gain hands-on experience with specification-based testing, UI and API automation, reusable test architecture, and AI-assisted QA engineering practices.

## Current Scope

The project currently includes:

* Playwright + TypeScript baseline setup
* Chromium execution
* Basic application smoke test
* Requirement analysis documentation
* AI-assisted engineering worklog

Business test automation will be added incrementally based on documented requirements and risk analysis.

## Project Structure

```text
docs/
  ai/
  requirements/

tests/
  smoke.spec.ts

playwright.config.ts
```

## Prerequisites

* Node.js
* npm

## Installation

```bash
npm install
npx playwright install
```

## Run Tests

Run all tests:

```bash
npx playwright test
```

Run Chromium only:

```bash
npx playwright test --project=chromium
```

## Documentation

Requirement analysis:

```text
docs/requirements/
```

AI-assisted engineering worklog:

```text
docs/ai/ai-worklog.md
```

## Current Status

PW-204 — RealWorld Playwright baseline setup completed.
