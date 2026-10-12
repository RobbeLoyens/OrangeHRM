import { test as base, type Page } from "@playwright/test";
import { environment } from "../config/environment";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage, type LoginCredentials } from "../pages/LoginPage";

type PageFixtures = {
  appUser: LoginCredentials;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<PageFixtures>({
  appUser: async ({}, use) => {
    await use({
      username: environment.auth.username,
      password: environment.auth.password,
    });
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  authenticatedPage: async ({ page, loginPage, dashboardPage, appUser }, use) => {
    await loginPage.goto();
    await loginPage.login(appUser);
    await dashboardPage.waitUntilLoaded();
    await use(page);
  },
});

export { expect } from "@playwright/test";
