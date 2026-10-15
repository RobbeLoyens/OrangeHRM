import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LeavePage extends BasePage {
  readonly heading = this.page.getByRole("heading", { name: "Leave List", exact: true });

  constructor(page: Page) {
    super(page);
  }

  async waitUntilLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }
}
