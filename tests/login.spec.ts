import { appRoutes } from "../utils/routes";
import { escapeRegExp } from "../utils/regex";
import { expect, test } from "../fixtures/auth.fixture";
import { users } from "../test-data/users";

test.describe("Login", () => {
  test("admin can log in and reach the dashboard", async ({
    page,
    loginPage,
    dashboardPage,
    mainNavigationPage,
    appUser,
  }) => {
    await test.step("Visit the login page", async () => {
      await mainNavigationPage.logoutIfAuthenticated();
      await loginPage.goto();
    });

    await test.step("Authenticate with a valid admin account", async () => {
      await loginPage.login(appUser);
    });

    await test.step("Confirm we landed on the dashboard", async () => {
      await dashboardPage.waitUntilLoaded();
      await expect(page).toHaveURL(
        new RegExp(`${escapeRegExp(appRoutes.dashboard)}(?:[/?#]|$)`),
      );
      await expect(dashboardPage.heading).toBeVisible();
    });
  });

  test("invalid credentials show an actionable error", async ({
    loginPage,
    mainNavigationPage,
  }) => {
    await test.step("Attempt login with a bad password", async () => {
      await mainNavigationPage.logoutIfAuthenticated();
      await loginPage.goto();
      await loginPage.login(users.invalidPassword);
    });

    await test.step("Verify the error message is user-visible", async () => {
      await expect(loginPage.errorMessage).toContainText("Invalid credentials");
    });
  });
});
