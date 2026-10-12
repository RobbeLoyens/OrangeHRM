import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  readonly heading = this.page.getByRole("heading", { name: "Dashboard", exact: true });

  constructor(page: Page) {
    super(page);
  }

  async waitUntilLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }
}
