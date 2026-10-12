import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  readonly heading = this.page.getByRole("heading", { name: "Dashboard" });

  constructor(page: Page) {
    super(page);
  }

  async waitUntilLoaded(): Promise<void> {
    await this.heading.waitFor({ state: "visible" });
  }
}
