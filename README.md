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
│   ├── LeavePage.ts         # Leave module readiness
│   ├── LoginPage.ts         # Login-specific locators and actions
│   ├── MainNavigationPage.ts # Primary navigation and logout
│   └── PimPage.ts           # PIM list and Add Employee entry point
├── test-data/
│   └── users.ts             # Named, reusable demo-user data
├── tests/
│   ├── login.spec.ts        # Login scenarios and user-facing assertions
│   └── smoke.spec.ts        # Post-deployment smoke checks
├── utils/
│   ├── authState.ts         # Shared path for generated admin storage state
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
npm run test:smoke
npm run test:headed
npm run test:ui
npm run report
npm run typecheck
```

The default run executes the suite in Chromium, Firefox, and WebKit. Tests within each browser project share one page and browser context so the headed run can be recorded as a continuous session; they run serially, and the browser closes when that project's tests finish. CI retries failures twice. HTML reports are written to `playwright-report/`; `test-results/` stores failure artifacts.

For a single continuous recording in Chromium, run `npm run test:headed -- --project=chromium`.

## Smoke-test strategy

A smoke test is a fast, deterministic, high-signal check of critical application paths after deployment. It should prove that users can authenticate, reach key modules, load the core screens, and end a session. It should avoid exhaustive field validation, large data permutations, complex business rules, and destructive workflows; those belong in broader functional and regression suites. Smoke checks should assert user-observable readiness rather than implementation details, use stable seeded data only when needed, and avoid creating or editing records.

The smoke command runs only this small suite in Chromium to keep deployment feedback quick. The standard test command still exercises all configured browser engines. Authentication is performed once in global setup and its storage state initializes the shared worker context; login checks explicitly log out before starting, and the logout check verifies the session returns to the login page.

| Scenario | Priority | Objective | Preconditions | Steps | Expected results |
|---|---|---|---|---|---|
| Successful login | Critical | Confirm a valid administrator can authenticate. | Deployment is reachable; configured administrator credentials are valid. | Start without stored state; open login; submit valid credentials. | Dashboard heading appears and the URL is the dashboard route. |
| Main navigation availability | Critical | Confirm primary navigation renders after authentication. | Valid authenticated storage state. | Open the dashboard; inspect PIM and Leave links. | Both links are visible and available. |
| PIM accessibility | High | Confirm the PIM module can be opened. | Valid authenticated storage state. | Select PIM in main navigation. | PIM route and module heading appear. |
| Employee list loading | High | Confirm the employee list view is rendered. | Valid authenticated storage state. | Select PIM. | Employee Information, Search, and the table with a row/header render; data volume is not assumed. |
| Add Employee page loading | High | Confirm the create-employee form is available without mutating data. | Valid authenticated storage state. | Select PIM; select Add. | Add Employee heading and First Name/Last Name fields appear. |
| Leave accessibility | High | Confirm the Leave module can be opened. | Valid authenticated storage state. | Select Leave in main navigation. | Leave List heading and route appear. |
| Successful logout | High | Confirm a user can end an authenticated session. | Valid authenticated storage state. | Open the account menu; select Logout. | Login page appears at the login route. |

### Scope boundaries

Do not put employee creation/editing/deletion, leave application/approval, search permutations, role/permission matrices, data integrity checks, or exhaustive form validation in smoke. These require mutable test data, broader setup/cleanup, more assertions, and/or many combinations, increasing execution time and flakiness while reducing the signal that a deployment is fundamentally healthy. Keep them in focused functional, integration, and regression suites.

### Framework additions and design decisions

- **Page objects:** `MainNavigationPage` owns primary module links and logout; `PimPage` owns PIM readiness and the Add entry point; `LeavePage` owns Leave-list readiness. `DashboardPage` gains a route entry point. `LoginPage` already owns the login interaction and remains the unauthenticated boundary.
- **Existing page objects:** `BasePage` continues to centralize navigation behavior. `DashboardPage` gains `goto()`; the other existing objects remain focused on their own page state.
- **Reusable methods:** `PimPage.waitForEmployeeList()` asserts the stable list shell (heading, Search, table, row), not a particular employee; `PimPage.openAddEmployee()` and `LeavePage.waitUntilLoaded()` centralize repeatable page actions/readiness.
- **Fixtures:** the typed fixture adds navigation, PIM, and Leave page objects. `authenticatedPage` opens the dashboard using generated storage state, avoiding a login for every authenticated scenario. `appUser` remains the source of configured credentials.
- **Utilities and setup:** `authStatePath` shares the storage-state location between global setup and config; existing route constants and regex escaping are reused for URL checks. Global setup now runs from the Playwright config and waits on DOM/application readiness instead of `networkidle`, which can be unreliable for applications with background traffic.
- **Assertions and scope:** checks use roles/headings and route patterns where possible. Only the user-menu trigger uses the OrangeHRM-specific class because it is not consistently exposed as an accessible button. The Add Employee check is read-only; logout changes only the isolated test context. Authentication state remains ignored by Git.
- **CI strategy:** `npm run test:smoke` uses Chromium for quick deployment feedback; the full suite retains Chromium, Firefox, and WebKit coverage. A release gate can run the smoke command after deployment, then run broader regression separately.

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
