# OrangeHRM Playwright Automation

A TypeScript and Playwright Test starter framework for the OrangeHRM demo application. It uses Page Objects, composable fixtures, separated test data, three-browser projects, and failure diagnostics.

## Project structure

```text
.
├── config/
│   └── environment.ts       # Validated environment settings and defaults
├── fixtures/
│   └── auth.fixture.ts      # Page Object and authenticated-page fixtures
├── pages/
│   ├── BasePage.ts          # Shared navigation behavior
│   ├── DashboardPage.ts     # Dashboard-specific locators and readiness
│   └── LoginPage.ts         # Login-specific locators and actions
├── test-data/
│   └── users.ts             # Named, reusable demo-user data
├── tests/
│   └── login.spec.ts        # Login scenarios and user-facing assertions
├── utils/
│   ├── regex.ts             # Escapes dynamic strings used in URL assertions
│   └── routes.ts            # Central application route constants
├── .env.example             # Local configuration template (safe to commit)
├── .gitignore
├── package-lock.json        # Reproducible dependency resolution
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

## Requirements and setup

- Node.js 20 or newer
- npm

```bash
npm install
npx playwright install chromium firefox webkit
Copy-Item .env.example .env
```

On macOS/Linux, use `cp .env.example .env` in place of `Copy-Item`.

The demo credentials are public sample credentials, not secrets. `BASE_URL`, `ORANGEHRM_USERNAME`, and `ORANGEHRM_PASSWORD` in `.env` can be changed for another environment. `BASE_URL` is checked as an absolute HTTP(S) URL when the configuration is loaded.

## Running tests

```bash
npm test
npm run test:headed
npm run test:ui
npm run report
npm run typecheck
```

The default run executes the suite in Chromium, Firefox, and WebKit. Each test gets an isolated Playwright page/context. The suite can run tests in parallel; in CI it uses two workers and retries failures twice. HTML reports are written to `playwright-report/`; `test-results/` stores failure artifacts.

## Design choices

- **Layered architecture** keeps environment configuration, page objects, fixtures, and tests separate. The config layer validates runtime inputs once, the page layer owns interaction logic, and specs remain focused on user outcomes.
- **Typed page fixtures** construct page objects per test and expose reusable authentication state. The `authenticatedPage` fixture demonstrates the pattern without forcing all tests through a logged-in flow.
- **Resilient selectors** prefer user-visible labels and roles over brittle CSS selectors. This reduces breakage when the UI markup changes without altering the user-facing experience.
- **Centralized test data and route constants** keep scenarios readable and avoid duplicating raw strings across the suite. Route matching remains explicit and safe via the regex helper.
- **Global auth bootstrap** creates a reusable storage state for the demo admin session and makes authenticated tests cheaper to scale. This avoids repeated browser login steps across the suite.
- **Independent browser projects and parallel workers** exercise engine-specific behavior and keep execution efficient in CI. Tests avoid shared state and remain parallel-safe.
- **HTML reporting and failure-only diagnostics** keep successful runs lightweight while retaining screenshots, traces, and video when a test fails. Open a report with `npm run report`.
- **Strict TypeScript** catches mistakes in page objects, fixtures, and config before code reaches the browser runner.

## Extending the framework

Add page objects under `pages/`, scenarios under `tests/`, and reusable fixture setup in `fixtures/`. Put stable inputs in `test-data/`; use environment variables for machine-specific or sensitive values. Prefer role/label-based locators and assert user-observable behavior in the spec. Avoid adding generic helpers until a real use case is shared by multiple tests.
