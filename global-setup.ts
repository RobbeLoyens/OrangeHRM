import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium, type FullConfig } from "@playwright/test";
import { environment } from "./config/environment";
import { appRoutes } from "./utils/routes";

const storageStatePath = "playwright/.auth/admin.json";

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await mkdir(dirname(storageStatePath), { recursive: true });
    await page.goto(`${environment.baseURL}${appRoutes.login}`);
    await page.getByLabel(/username/i).fill(environment.auth.username);
    await page.getByLabel(/password/i).fill(environment.auth.password);
    await page.getByRole("button", { name: /login/i }).click();
    await page.waitForURL(/\/dashboard\/index(?:[/?#]|$)/, { timeout: 20_000 });
    await page.context().storageState({ path: storageStatePath });
  } finally {
    await browser.close();
  }
}
