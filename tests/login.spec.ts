import { appRoutes } from "../utils/routes";
import { escapeRegExp } from "../utils/regex";
import { expect, test } from "../fixtures/auth.fixture";
import { users } from "../test-data/users";

test.describe("Login", () => {
  test("admin can log in and reach the dashboard", async ({
    page,
    loginPage,
    dashboardPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(users.admin);

    await expect(dashboardPage.heading).toBeVisible();
    await expect(page).toHaveURL(
      new RegExp(`${escapeRegExp(appRoutes.dashboard)}(?:[/?#]|$)`),
    );
  });

  test("invalid credentials show an actionable error", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.invalidPassword);

    await expect(loginPage.errorMessage).toHaveText("Invalid credentials");
  });
});
