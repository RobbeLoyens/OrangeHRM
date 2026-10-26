import { randomUUID } from "node:crypto";
import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../fixtures/auth.fixture";
import type { DashboardPage } from "../pages/DashboardPage";
import type { LoginCredentials, LoginPage } from "../pages/LoginPage";
import type { MainNavigationPage } from "../pages/MainNavigationPage";
import type { PimPage } from "../pages/PimPage";
import { appRoutes } from "../utils/routes";

type Employee = {
  firstName: string;
  lastName: string;
  employeeId: string;
};

type EmployeeManagementFixtures = {
  appUser: LoginCredentials;
  dashboardPage: DashboardPage;
  loginPage: LoginPage;
  mainNavigationPage: MainNavigationPage;
  pimPage: PimPage;
};

function createUniqueEmployee(): Employee {
  const uniqueToken = randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();

  return {
    firstName: `Auto${uniqueToken.slice(0, 5)}`,
    lastName: `Test${uniqueToken.slice(5)}`,
    employeeId: uniqueToken,
  };
}

function employeeIdInput(page: Page): Locator {
  return page
    .getByText("Employee Id", { exact: true })
    .locator("..")
    .locator("..")
    .locator("input");
}

function employeeRow(page: Page, employeeId: string): Locator {
  return page.getByRole("row").filter({ hasText: employeeId });
}

function noEmployeeResults(page: Page): Locator {
  return page
    .locator(".orangehrm-horizontal-padding.orangehrm-vertical-padding")
    .getByText("No Records Found", { exact: true });
}

async function logInAndOpenPim(pageObjects: EmployeeManagementFixtures): Promise<void> {
  await pageObjects.mainNavigationPage.logoutIfAuthenticated();
  await pageObjects.loginPage.goto();
  await pageObjects.loginPage.login(pageObjects.appUser);
  await pageObjects.dashboardPage.waitUntilLoaded();
  await pageObjects.mainNavigationPage.pimLink.click();
  await pageObjects.pimPage.waitForEmployeeList();
}

async function openAddEmployeeForm(page: Page, pimPage: PimPage): Promise<void> {
  await pimPage.openAddEmployee();
  await expect(page.getByRole("heading", { name: "Add Employee", exact: true })).toBeVisible();
}

async function fillEmployeeForm(page: Page, employee: Employee): Promise<void> {
  await page.getByRole("textbox", { name: "First Name" }).fill(employee.firstName);
  await page.getByRole("textbox", { name: "Last Name" }).fill(employee.lastName);
  await employeeIdInput(page).fill(employee.employeeId);
}

async function savePersonalDetails(page: Page): Promise<void> {
  const personalDetailsForm = page
    .locator("form.oxd-form")
    .filter({ has: page.getByRole("textbox", { name: "First Name" }) });
  await personalDetailsForm.getByRole("button", { name: "Save", exact: true }).click();
}

async function expectSuccessNotification(page: Page, message: RegExp): Promise<void> {
  await expect(
    page.locator(".oxd-toast-content-text").filter({ hasText: message }),
  ).toBeVisible();
}

async function searchForEmployee(
  page: Page,
  pimPage: PimPage,
  employeeId: string,
): Promise<Locator> {
  await page.goto(appRoutes.pimEmployeeList, { waitUntil: "domcontentloaded" });
  await pimPage.waitForEmployeeList();
  const idInput = employeeIdInput(page);
  if (!(await idInput.isVisible())) {
    await page.locator(".oxd-table-filter-header-options .oxd-icon-button").click();
  }
  await expect(idInput).toBeVisible();
  await idInput.fill(employeeId);
  await pimPage.searchButton.click();

  const row = employeeRow(page, employeeId);
  await expect(row.or(noEmployeeResults(page))).toBeVisible();
  return row;
}

async function deleteEmployee(page: Page, row: Locator): Promise<void> {
  await row.getByRole("button").nth(1).click();
  await expect(page.getByText("Are you Sure?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /yes,\s*delete/i }).click();
}

async function removeEmployeeIfPresent(
  page: Page,
  pimPage: PimPage,
  employeeId: string,
): Promise<void> {
  const row = await searchForEmployee(page, pimPage, employeeId);
  if (await row.count()) {
    await deleteEmployee(page, row);
    await expect(row).toHaveCount(0);
  }
}

test.describe("Employee management workflow", () => {
  // Exercise the complete create, verify, edit, verify, and delete journey with run-unique data.
  test("creates, updates, searches, and deletes an employee", async ({
    page,
    appUser,
    loginPage,
    dashboardPage,
    mainNavigationPage,
    pimPage,
  }) => {
    test.setTimeout(60_000);
    const employee = createUniqueEmployee();
    const updatedLastName = `${employee.lastName}Updated`;
    let employeeMayExist = false;

    try {
      await test.step("Log in and open PIM", async () => {
        await logInAndOpenPim({
          appUser,
          dashboardPage,
          loginPage,
          mainNavigationPage,
          pimPage,
        });
      });

      await test.step("Create a uniquely identified employee", async () => {
        await openAddEmployeeForm(page, pimPage);
        await fillEmployeeForm(page, employee);
        employeeMayExist = true;
        await page.getByRole("button", { name: "Save", exact: true }).click();
        await expectSuccessNotification(page, /successfully saved/i);
      });

      await test.step("Find the new employee and verify the saved details", async () => {
        const row = await searchForEmployee(page, pimPage, employee.employeeId);
        await expect(row).toHaveCount(1);
        await expect(row).toContainText(employee.firstName);
        await expect(row).toContainText(employee.lastName);
      });

      await test.step("Update the employee's last name", async () => {
        const row = await searchForEmployee(page, pimPage, employee.employeeId);
        await row.getByRole("button").first().click();
        const lastNameInput = page.getByRole("textbox", { name: "Last Name" });
        await expect(lastNameInput).toHaveValue(employee.lastName);
        await lastNameInput.fill(updatedLastName);
        await savePersonalDetails(page);
        await expectSuccessNotification(page, /successfully updated/i);
        await expect(lastNameInput).toHaveValue(updatedLastName);
      });

      await test.step("Verify the updated employee details in search results", async () => {
        const row = await searchForEmployee(page, pimPage, employee.employeeId);
        await expect(row).toHaveCount(1);
        await expect(row).toContainText(updatedLastName);
      });

      await test.step("Delete the employee and verify it is no longer listed", async () => {
        const row = await searchForEmployee(page, pimPage, employee.employeeId);
        await deleteEmployee(page, row);
        await expectSuccessNotification(page, /successfully deleted/i);
        await expect(row).toHaveCount(0);
        await expect(noEmployeeResults(page)).toBeVisible();
      });
    } finally {
      if (employeeMayExist) {
        await removeEmployeeIfPresent(page, pimPage, employee.employeeId);
      }
    }
  });

  // Required name fields must prevent an incomplete employee record from being submitted.
  test("rejects creating an employee without required names", async ({
    page,
    appUser,
    loginPage,
    dashboardPage,
    mainNavigationPage,
    pimPage,
  }) => {
    const employee = createUniqueEmployee();

    await test.step("Log in and open the Add Employee form", async () => {
      await logInAndOpenPim({
        appUser,
        dashboardPage,
        loginPage,
        mainNavigationPage,
        pimPage,
      });
      await openAddEmployeeForm(page, pimPage);
      await employeeIdInput(page).fill(employee.employeeId);
    });

    await test.step("Submit the empty form and verify required-field errors", async () => {
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await expect(page.getByText("Required", { exact: true })).toHaveCount(2);
      await expect(page.getByRole("heading", { name: "Add Employee", exact: true })).toBeVisible();
    });

    await test.step("Verify the invalid form did not create an employee", async () => {
      const row = await searchForEmployee(page, pimPage, employee.employeeId);
      await expect(row).toHaveCount(0);
      await expect(noEmployeeResults(page)).toBeVisible();
    });
  });

  // An invalid edit must be rejected without changing the existing employee.
  test("rejects clearing a required employee name during an edit", async ({
    page,
    appUser,
    loginPage,
    dashboardPage,
    mainNavigationPage,
    pimPage,
  }) => {
    const employee = createUniqueEmployee();
    let employeeMayExist = false;

    try {
      await test.step("Log in, create a baseline employee, and verify it exists", async () => {
        await logInAndOpenPim({
          appUser,
          dashboardPage,
          loginPage,
          mainNavigationPage,
          pimPage,
        });
        await openAddEmployeeForm(page, pimPage);
        await fillEmployeeForm(page, employee);
        employeeMayExist = true;
        await page.getByRole("button", { name: "Save", exact: true }).click();
        await expectSuccessNotification(page, /successfully saved/i);
        const row = await searchForEmployee(page, pimPage, employee.employeeId);
        await expect(row).toHaveCount(1);
      });

      await test.step("Attempt to save an employee with a blank first name", async () => {
        const row = await searchForEmployee(page, pimPage, employee.employeeId);
        await row.getByRole("button").first().click();
        const firstNameInput = page.getByRole("textbox", { name: "First Name" });
        await expect(firstNameInput).toHaveValue(employee.firstName);
        await firstNameInput.fill("");
        await savePersonalDetails(page);
        await expect(page.getByText("Required", { exact: true })).toBeVisible();
      });

      await test.step("Verify the original employee data remains unchanged", async () => {
        const row = await searchForEmployee(page, pimPage, employee.employeeId);
        await expect(row).toHaveCount(1);
        await expect(row).toContainText(employee.firstName);
        await expect(row).toContainText(employee.lastName);
      });
    } finally {
      if (employeeMayExist) {
        await removeEmployeeIfPresent(page, pimPage, employee.employeeId);
      }
    }
  });

  // Canceling the delete confirmation must keep the employee record intact.
  test("keeps an employee when deletion is canceled", async ({
    page,
    appUser,
    loginPage,
    dashboardPage,
    mainNavigationPage,
    pimPage,
  }) => {
    const employee = createUniqueEmployee();
    let employeeMayExist = false;

    try {
      await test.step("Log in and create an employee to use in the cancellation check", async () => {
        await logInAndOpenPim({
          appUser,
          dashboardPage,
          loginPage,
          mainNavigationPage,
          pimPage,
        });
        await openAddEmployeeForm(page, pimPage);
        await fillEmployeeForm(page, employee);
        employeeMayExist = true;
        await page.getByRole("button", { name: "Save", exact: true }).click();
        await expectSuccessNotification(page, /successfully saved/i);
        const row = await searchForEmployee(page, pimPage, employee.employeeId);
        await expect(row).toHaveCount(1);
      });

      await test.step("Cancel the delete confirmation and verify the record remains", async () => {
        const row = await searchForEmployee(page, pimPage, employee.employeeId);
        await row.getByRole("button").nth(1).click();
        await expect(page.getByText("Are you Sure?", { exact: true })).toBeVisible();
        await page.getByRole("button", { name: /no,\s*cancel/i }).click();
        await expect(page.getByText("Are you Sure?", { exact: true })).not.toBeVisible();
        await expect(row).toHaveCount(1);
        await expect(row).toContainText(employee.firstName);
      });
    } finally {
      if (employeeMayExist) {
        await removeEmployeeIfPresent(page, pimPage, employee.employeeId);
      }
    }
  });
});
