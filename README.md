<p align="center">
  <img width="280" alt="Canaan Playwright Migration Logo" src="./src/svgs/canaan_migration_logo.png" />
</p>

# Canaan's Playwright Real World App Migration

This is a portfolio project built around the Cypress Real World App, reworked into a Playwright-centered automation and reliability framework.

Just showcasing QA automation at the system level: test architecture, app startup reliability, seeded data, API-first migration, CI feedback, readable artifacts, and practical tradeoffs. Not for practical use.

The base app comes from the Cypress Real World App. For this project, I reworked the original application, removed legacy surface area, and built a Playwright migration/reliability layer around it.

<img width="860" height="573" alt="Screenshot 2026-06-10 at 1 20 44 AM" src="https://github.com/user-attachments/assets/56cc587f-0cf2-41f8-bbd5-a840528acec0" />

## What This Project Shows

- Rebuilding the original Cypress coverage as Playwright API and UI automation without turning it into a syntax-only port
- API-first test strategy to validate auth, data seeding, environment config, and backend contracts before layering on browser workflows
- Playwright fixtures for API clients, auth, test data, and shared UI login behavior
- Page/component objects for repeated UI workflows without hiding test intent
- Realistic handling of a shared lowdb JSON database
- GitHub Actions pipeline for typecheck, unit tests, build, Playwright API, and Playwright UI
- Custom Playwright reliability reporter with Markdown/JSON output
- Lightweight backend health check for CI/app readiness smoke coverage
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
- health
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

UI page/component objects live in [playwright/pages](./playwright/pages). They are used where interaction patterns repeat, such as sign in, side navigation, and the bank account form.


## Custom Reliability Reporter

The custom reporter lives in [playwright/reporters/reliabilityReporter.ts](./playwright/reporters/reliabilityReporter.ts).

➡️ [Jump to Reliability Reports](#reliability-reports)

It produces Markdown and JSON summaries under `playwright/reports/`, including:

- total, passed, failed, flaky, skipped, and retried counts
- slowest tests
- failure summaries
- flaky candidates
- CI metadata when available
- GitHub Step Summary output in CI

In GitHub Actions, API and UI runs write separate artifacts:

- `api-reliability-summary.md/json`
- `ui-reliability-summary.md/json`

### Operational Smoke Checks

The backend exposes a lightweight `/health` endpoint with service status, environment, timestamp, and seeded data checks. Playwright validates it as part of the API suite so CI gets a fast signal that the app server is up and the test environment is ready before deeper workflow coverage matters.

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
10. reliability telemetry summary output
11. reliability report artifact upload

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
<a id="reliability-reports"></a>

# Playwright Reliability Summary

Status: **passed**
Duration: **8.1s**
Source: **github-actions**

## Reliability KPIs

| Total | Passed | Failed | Flaky | Skipped | Retried |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 49 | 49 | 0 | 0 | 0 | 0 |

## Slowest Tests

| Project | Test | File | Duration | Retries | Outcome |
| --- | --- | --- | ---: | ---: | --- |
| api | Bank Accounts API > GET /bankAccounts returns accounts for authenticated user | tests/api/bank-accounts.api.spec.ts | 229ms | 0 | expected |
| api | Users API > POST /login logs in as a user | tests/api/users.api.spec.ts | 185ms | 0 | expected |
| api | Users API > POST /users creates a new user | tests/api/users.api.spec.ts | 179ms | 0 | expected |
| api | Users API > POST /users creates a new user with an account balance in cents | tests/api/users.api.spec.ts | 179ms | 0 | expected |
| api | Bank Accounts API > POST /bankAccounts creates a new bank account | tests/api/bank-accounts.api.spec.ts | 168ms | 0 | expected |
| api | Bank Accounts API > GET /bankAccounts/:bankAccountId returns a bank account | tests/api/bank-accounts.api.spec.ts | 165ms | 0 | expected |
| api | Transactions API > GET /transactions/contacts returns contact transactions page one | tests/api/transactions.api.spec.ts | 157ms | 0 | expected |
| api | Transactions API > GET /transactions/public returns public transactions | tests/api/transactions.api.spec.ts | 143ms | 0 | expected |
| api | Transactions API > GET /transactions/contacts returns contact transactions page two | tests/api/transactions.api.spec.ts | 140ms | 0 | expected |
| api | Transactions API > GET /transactions returns transactions for user by default | tests/api/transactions.api.spec.ts | 134ms | 0 | expected |

## Failures

No failing tests in this run.

## Flaky Candidates

No flaky or retried tests in this run.


# Playwright Reliability Summary

Status: **passed**
Duration: **56.1s**
Source: **github-actions**

## Reliability KPIs

| Total | Passed | Failed | Flaky | Skipped | Retried |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 24 | 24 | 0 | 0 | 0 | 0 |

## Slowest Tests

| Project | Test | File | Duration | Retries | Outcome |
| --- | --- | --- | ---: | ---: | --- |
| ui | User Sign-up and Login > allows a visitor to sign up, onboard, and log out | tests/ui/auth.spec.ts | 2.8s | 0 | expected |
| ui | New Transaction > displays validation errors and disables submit buttons | tests/ui/new-transaction.spec.ts | 2.8s | 0 | expected |
| ui | New Transaction > submits a transaction payment | tests/ui/new-transaction.spec.ts | 2.7s | 0 | expected |
| ui | New Transaction > submits a transaction request | tests/ui/new-transaction.spec.ts | 2.6s | 0 | expected |
| ui | Transaction Feeds > switches between public, contacts, and personal feeds | tests/ui/transaction-feeds.spec.ts | 2.6s | 0 | expected |
| ui | Notifications > renders an empty notifications state | tests/ui/notifications.spec.ts | 2.6s | 0 | expected |
| ui | Notifications > marks a notification as read | tests/ui/notifications.spec.ts | 2.5s | 0 | expected |
| ui | Transaction Feeds > toggles the side navigation drawer | tests/ui/transaction-feeds.spec.ts | 2.4s | 0 | expected |
| ui | User Settings > updates first name, last name, email, and phone number | tests/ui/user-settings.spec.ts | 2.4s | 0 | expected |
| ui | Notifications > renders notifications for the current user | tests/ui/notifications.spec.ts | 2.3s | 0 | expected |

## Failures

No failing tests in this run.

## Flaky Candidates

No flaky or retried tests in this run.


---

## Credit

This project is a rework based on the Cypress Real World App here https://github.com/cypress-io/cypress-realworld-app. This repo is primarily a Playwright migration, adding reliability, new pipelines, test authentication, etc.. as a QA automation architecture showcase. 
