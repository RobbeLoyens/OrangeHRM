import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { appRoutes } from "../utils/routes";

export interface LoginCredentials {
  username: string;
  password: string;
}

export class LoginPage extends BasePage {
  readonly usernameInput = this.page.getByRole("textbox", { name: "Username" });
  readonly passwordInput = this.page.getByRole("textbox", { name: "Password" });
  readonly loginButton = this.page.getByRole("button", { name: "Login" });
  readonly errorMessage = this.page.locator(".oxd-alert-content-text");

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigateTo(appRoutes.login);
  }

  async login(credentials: LoginCredentials): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click();
  }
}
