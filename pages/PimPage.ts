import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class PimPage extends BasePage {
  readonly heading = this.page.getByRole("heading", { name: "PIM", exact: true });
  readonly employeeInformationHeading = this.page.getByRole("heading", {
    name: "Employee Information",
    exact: true,
  });
  readonly employeeTable = this.page.getByRole("table");
  readonly employeeListLink = this.page.getByRole("link", {
    name: "Employee List",
    exact: true,
  });
  readonly addEmployeeLink = this.page.getByRole("link", {
    name: "Add Employee",
    exact: true,
  });
  readonly searchButton = this.page.getByRole("button", { name: "Search", exact: true });

  constructor(page: Page) {
    super(page);
  }

  async waitForEmployeeList(): Promise<void> {
    await expect(this.employeeInformationHeading).toBeVisible();
    await expect(this.searchButton).toBeVisible();
    await expect(this.employeeTable).toBeVisible();
    await expect(this.employeeTable.getByRole("row").first()).toBeVisible();
  }

  async openAddEmployee(): Promise<void> {
    await this.addEmployeeLink.click();
  }
}
