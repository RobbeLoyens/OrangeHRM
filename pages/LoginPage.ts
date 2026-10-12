import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { appRoutes } from "../utils/routes";

export interface LoginCredentials {
  username: string;
  password: string;
}

export class LoginPage extends BasePage {
  readonly usernameInput = this.page.locator('input[name="username"]');
  readonly passwordInput = this.page.locator('input[name="password"]');
  readonly loginButton = this.page.getByRole("button", { name: /login/i });
  readonly errorMessage = this.page.locator(".oxd-alert-content-text");
  readonly heading = this.page.getByRole("heading", { name: /login/i });

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigateTo(appRoutes.login);
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await this.heading.waitFor({ state: "visible", timeout: 15_000 });
  }

  async login(credentials: LoginCredentials): Promise<void> {
    await this.waitForReady();
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click();
  }
}
