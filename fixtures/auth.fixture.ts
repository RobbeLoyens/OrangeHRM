import { test as base, type Page } from "@playwright/test";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { users } from "../test-data/users";

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  // This fixture is opt-in, so login tests can exercise the unauthenticated flow.
  authenticatedPage: async ({ page, loginPage, dashboardPage }, use) => {
    await loginPage.goto();
    await loginPage.login(users.admin);
    await dashboardPage.waitUntilLoaded();
    await use(page);
  },
});

export { expect } from "@playwright/test";
