import type { Page } from "@playwright/test";

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  protected async navigateTo(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }

  protected async waitForUrl(pathOrPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(pathOrPattern, { timeout: 15_000 });
  }
}
