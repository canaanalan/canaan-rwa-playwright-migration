import { expect, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test";

import type { User } from "../../src/models";
import { defaultPassword } from "./auth";
import { getTestData, seedDatabase } from "./testData";

export async function loginSeededUser(
  page: Page,
  context: BrowserContext,
  request: APIRequestContext,
  userIndex = 0
) {
  await seedDatabase(request);
  await context.clearCookies();
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());

  const users = await getTestData<User>(request, "users");
  const user = users[userIndex];

  await page.goto("/signin");
  await page.locator("[data-test=signin-username] input").fill(user.username);
  await page.locator("[data-test=signin-password] input").fill(defaultPassword);

  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes("/login") && response.request().method() === "POST"
    ),
    page.locator("[data-test=signin-submit]").click(),
  ]);

  await expect(page.locator("[data-test=sidenav-username]")).toContainText(`@${user.username}`);

  return { user, users };
}
