import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { appRoutes } from "../utils/routes";

export class MainNavigationPage extends BasePage {
  readonly pimLink = this.page.getByRole("link", { name: "PIM", exact: true });
  readonly leaveLink = this.page.getByRole("link", { name: "Leave", exact: true });
  private readonly userMenu = this.page.locator(".oxd-userdropdown-tab");
  private readonly logoutLink = this.page.getByRole("menuitem", { name: "Logout", exact: true });

  constructor(page: Page) {
    super(page);
  }

  async logout(): Promise<void> {
    await this.userMenu.click();
    await this.logoutLink.click();
  }

  async logoutIfAuthenticated(): Promise<void> {
    await this.page.goto(appRoutes.dashboard, { waitUntil: "domcontentloaded" });
    if (new URL(this.page.url()).pathname.endsWith(appRoutes.dashboard)) {
      await this.logout();
    }
  }
}
