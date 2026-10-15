import { devices, test as base, type BrowserContext, type Page } from "@playwright/test";
import { environment } from "../config/environment";
import { DashboardPage } from "../pages/DashboardPage";
import { LeavePage } from "../pages/LeavePage";
import { LoginPage, type LoginCredentials } from "../pages/LoginPage";
import { MainNavigationPage } from "../pages/MainNavigationPage";
import { PimPage } from "../pages/PimPage";
import { authStatePath } from "../utils/authState";

type PageFixtures = {
  appUser: LoginCredentials;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  mainNavigationPage: MainNavigationPage;
  pimPage: PimPage;
  leavePage: LeavePage;
  authenticatedPage: Page;
  page: Page;
};

type WorkerFixtures = {
  sharedContext: BrowserContext;
  sharedPage: Page;
};

const browserDevices = {
  chromium: devices["Desktop Chrome"],
  firefox: devices["Desktop Firefox"],
  webkit: devices["Desktop Safari"],
} as const;

export const test = base.extend<PageFixtures, WorkerFixtures>({
  sharedContext: [
    async ({ browser, browserName }, use) => {
      const context = await browser.newContext({
        ...browserDevices[browserName],
        baseURL: environment.baseURL,
        storageState: authStatePath,
        ignoreHTTPSErrors: true,
      });
      await use(context);
      await context.close();
    },
    { scope: "worker" },
  ],
  sharedPage: [
    async ({ sharedContext }, use) => {
      const page = await sharedContext.newPage();
      await use(page);
    },
    { scope: "worker" },
  ],
  page: async ({ sharedPage }, use) => {
    await use(sharedPage);
  },
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
  mainNavigationPage: async ({ page }, use) => {
    await use(new MainNavigationPage(page));
  },
  pimPage: async ({ page }, use) => {
    await use(new PimPage(page));
  },
  leavePage: async ({ page }, use) => {
    await use(new LeavePage(page));
  },
  authenticatedPage: async ({ page, dashboardPage }, use) => {
    await dashboardPage.goto();
    await dashboardPage.waitUntilLoaded();
    await use(page);
  },
});

export { expect } from "@playwright/test";
