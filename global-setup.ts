import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium, type FullConfig } from "@playwright/test";
import { environment } from "./config/environment";
import { authStatePath } from "./utils/authState";
import { appRoutes } from "./utils/routes";

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await mkdir(dirname(authStatePath), { recursive: true });
    await page.goto(`${environment.baseURL}${appRoutes.login}`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: /login/i }).waitFor({ state: "visible" });
    await page.locator('input[name="username"]').fill(environment.auth.username);
    await page.locator('input[name="password"]').fill(environment.auth.password);
    await page.getByRole("button", { name: /login/i }).click();
    await page.waitForURL(/\/dashboard\/index(?:[/?#]|$)/, { timeout: 20_000 });
    await page.getByRole("heading", { name: "Dashboard", exact: true }).waitFor({
      state: "visible",
      timeout: 15_000,
    });
    await page.context().storageState({ path: authStatePath });
  } finally {
    await browser.close();
  }
}
