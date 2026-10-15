import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { appRoutes } from "../utils/routes";

export class DashboardPage extends BasePage {
  readonly heading = this.page.getByRole("heading", { name: "Dashboard", exact: true });

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigateTo(appRoutes.dashboard);
  }

  async waitUntilLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }
}
