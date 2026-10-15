import { expect, test } from "../fixtures/auth.fixture";
import { appRoutes } from "../utils/routes";
import { escapeRegExp } from "../utils/regex";

test.describe("Smoke tests", () => {
  test.describe("Successful login", () => {
    test("valid admin credentials open the dashboard", async ({
      page,
      loginPage,
      dashboardPage,
      mainNavigationPage,
      appUser,
    }) => {
      await test.step("Open the login page and sign in", async () => {
        await mainNavigationPage.logoutIfAuthenticated();
        await loginPage.goto();
        await loginPage.login(appUser);
      });

      await test.step("Verify the dashboard is ready", async () => {
        await dashboardPage.waitUntilLoaded();
        await expect(page).toHaveURL(
          new RegExp(`${escapeRegExp(appRoutes.dashboard)}(?:[/?#]|$)`),
        );
      });
    });
  });

  test.describe("Authenticated user", () => {
    test("main navigation exposes PIM and Leave", async ({
      authenticatedPage,
      mainNavigationPage,
    }) => {
      await test.step("Verify primary business modules are available", async () => {
        await expect(mainNavigationPage.pimLink).toBeVisible();
        await expect(mainNavigationPage.leaveLink).toBeVisible();
      });
    });

    test("PIM module opens successfully", async ({
      authenticatedPage,
      mainNavigationPage,
      pimPage,
    }) => {
      await test.step("Open PIM from the main navigation", async () => {
        await mainNavigationPage.pimLink.click();
      });

      await test.step("Verify the PIM module is ready", async () => {
        await expect(authenticatedPage).toHaveURL(
          new RegExp(`${escapeRegExp(appRoutes.pimEmployeeList)}(?:[/?#]|$)`),
        );
        await expect(pimPage.heading).toBeVisible();
      });
    });

    test("employee list loads in PIM", async ({
      authenticatedPage,
      mainNavigationPage,
      pimPage,
    }) => {
      await test.step("Open the employee list", async () => {
        await mainNavigationPage.pimLink.click();
      });

      await test.step("Verify the list interface is rendered", async () => {
        await pimPage.waitForEmployeeList();
      });
    });

    test("Add Employee page loads from PIM", async ({
      authenticatedPage,
      mainNavigationPage,
      pimPage,
      page,
    }) => {
      await test.step("Open the PIM employee list and select Add", async () => {
        await mainNavigationPage.pimLink.click();
        await pimPage.waitForEmployeeList();
        await pimPage.openAddEmployee();
      });

      await test.step("Verify the Add Employee form is ready", async () => {
        await expect(page).toHaveURL(
          new RegExp(`${escapeRegExp(appRoutes.pimAddEmployee)}(?:[/?#]|$)`),
        );
        await expect(
          page.getByRole("heading", { name: "Add Employee", exact: true }),
        ).toBeVisible();
        await expect(page.getByRole("textbox", { name: "First Name" })).toBeVisible();
        await expect(page.getByRole("textbox", { name: "Last Name" })).toBeVisible();
      });
    });

    test("Leave module opens successfully", async ({
      authenticatedPage,
      mainNavigationPage,
      leavePage,
    }) => {
      await test.step("Open Leave from the main navigation", async () => {
        await mainNavigationPage.leaveLink.click();
      });

      await test.step("Verify the Leave list is ready", async () => {
        await expect(authenticatedPage).toHaveURL(
          new RegExp(`${escapeRegExp(appRoutes.leaveList)}(?:[/?#]|$)`),
        );
        await leavePage.waitUntilLoaded();
      });
    });

    test("admin can log out successfully", async ({
      authenticatedPage,
      mainNavigationPage,
      loginPage,
    }) => {
      await test.step("Sign out using the account menu", async () => {
        await mainNavigationPage.logout();
      });

      await test.step("Verify the login page is shown after logout", async () => {
        await loginPage.waitForReady();
        await expect(authenticatedPage).toHaveURL(
          new RegExp(`${escapeRegExp(appRoutes.login)}(?:[/?#]|$)`),
        );
      });
    });
  });
});
