<p align="center">
  <img width="280" alt="Canaan Playwright Migration Logo" src="./src/svgs/canaan_migration_logo.png" />
</p>

# Canaan's Playwright Real World App Migration

This is a portfolio project built around the Cypress Real World App, reworked into a Playwright-centered automation and reliability framework.

Showcasing QA automation at the system level: test architecture, app startup reliability, seeded data, API-first migration, CI feedback, readable artifacts, and practical tradeoffs.

The base app comes from the Cypress Real World App. For this project, I reworked the original application, removed legacy surface area, and built a Playwright migration/reliability layer around it.

## What This Project Shows

- Rebuilding the original Cypress coverage as Playwright API and UI automation without turning it into a syntax-only port
- API-first test strategy to validate auth, data seeding, environment config, and backend contracts before layering on browser workflows
- Playwright fixtures for API clients, auth, test data, and shared UI login behavior
- Realistic handling of a shared lowdb JSON database
- GitHub Actions pipeline for typecheck, unit tests, build, Playwright API, and Playwright UI
- Custom Playwright reliability reporter with Markdown/JSON output
- Incremental cleanup of legacy RWA repo noise
- A practical portfolio example of senior SDET / QA automation ownership

## Current Test Stack

| Layer | Tooling | Purpose |
| --- | --- | --- |
| Backend/data logic | Vitest | Fast checks for pure/backend behavior |
| API automation | Playwright APIRequestContext | REST contract coverage, auth, seed data, isolation |
| UI automation | Playwright browser tests | Auth and core user workflows |
| CI | GitHub Actions | Repeatable quality gate |
| Reporting | Custom Playwright reporter | Reliability summary, slowest tests, retries, failures |

## Playwright Coverage

API specs live in [playwright/tests/api](./playwright/tests/api):

- bank accounts
- bank transfers
- comments
- contacts
- likes
- notifications
- test data
- transactions
- users/auth

UI specs live in [playwright/tests/ui](./playwright/tests/ui):

- auth
- bank accounts
- new transaction
- notifications
- transaction feeds
- transaction view
- user settings

The original Cypress suite has been removed after the core API and UI coverage was rebuilt in Playwright.

## Architecture Notes

### Why API First?

API tests came first because they prove the boring-but-critical things:

- the backend starts correctly
- seed data is available
- login/auth works without browser noise
- lowdb state can be reset predictably
- API helper patterns are worth extracting

Once that was stable, UI tests came next. 

### Shared Seeded State

The app uses lowdb with JSON files. Tests reseed the database frequently so each spec starts from known data.

Because this is a shared local JSON database, Playwright API/UI suites use one worker in CI. That is intentional. Parallelism is great when the system supports it, shared mutable state isn't ideal for parallelization.

### Fixtures

Key Playwright helpers live in [playwright/fixtures](./playwright/fixtures):

- [apiClient.ts](./playwright/fixtures/apiClient.ts): typed-ish REST client wrapper for API tests
- [auth.ts](./playwright/fixtures/auth.ts): API login helper and default password
- [testData.ts](./playwright/fixtures/testData.ts): database seeding and seeded data lookup
- [uiAuth.ts](./playwright/fixtures/uiAuth.ts): shared UI login helper for browser specs


## Custom Reliability Reporter

The custom reporter lives in [playwright/reporters/reliabilityReporter.ts](./playwright/reporters/reliabilityReporter.ts).

It produces Markdown and JSON summaries under `playwright/reports/`, including:

- total, passed, failed, flaky, skipped, and retried counts
- slowest tests
- failure summaries
- GitHub Step Summary output in CI

In GitHub Actions, API and UI runs write separate artifacts:

- `api-reliability-summary.md/json`
- `ui-reliability-summary.md/json`

## GitHub Actions

The main workflow is [.github/workflows/main.yml](./.github/workflows/main.yml).

It currently runs:

1. root dependency install
2. TypeScript typecheck
3. Vitest unit tests
4. production build
5. Playwright package install
6. Playwright browser install
7. Playwright test typecheck
8. Playwright API tests
9. Playwright UI tests
10. reliability report artifact upload

Node 22 is used in CI.

## Local Setup

Install root dependencies:

```bash
yarn install
```

Install Playwright package dependencies:

```bash
cd playwright
npm install
```

Install Playwright browsers:

```bash
cd playwright
npx playwright install chromium
```

## Running The App

From the repo root:

```bash
yarn dev
```

The app runs on:

- frontend: `http://localhost:3000`
- backend: `http://127.0.0.1:3001`

To list seeded users:

```bash
yarn list:dev:users
```

Default seeded user password:

```text
s3cret
```

## Running Checks

Root checks:

```bash
yarn types
yarn test:unit:ci
yarn build
```

Playwright checks:

```bash
cd playwright
npx tsc -p tsconfig.json --noEmit
npm run test:api -- --workers=1
npm run test:ui -- --workers=1
```

Run one Playwright file:

```bash
cd playwright
npm run test -- tests/ui/auth.spec.ts --project=ui --workers=1
```

Open the Playwright UI runner:

```bash
cd playwright
npm run test -- tests/ui/auth.spec.ts --project=ui --ui
```

Debug one file:

```bash
cd playwright
npm run test -- tests/ui/auth.spec.ts --project=ui --debug --workers=1
```

## What Changed From The Original RWA

This repo intentionally diverges from the upstream Cypress RWA in a few ways:

- Playwright API/UI coverage has been added
- GraphQL app-owned code was removed
- CircleCI and Cypress Cloud workflows were removed
- GitHub Actions is now the main CI path
- generated coverage/test artifacts are ignored/cleaned
- visual design and branding were personalized
- a custom reliability reporter was added


## Credit

This project is based on the Cypress Real World App. The original application provided by them, this repo is my Playwright migration, reliability, and QA automation architecture showcase.

