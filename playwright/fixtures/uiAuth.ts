import { type APIRequestContext, type BrowserContext, type Page } from "@playwright/test";

import type { User } from "../../src/models";
import { defaultPassword } from "./auth";
import { getTestData, seedDatabase } from "./testData";
import { SideNav } from "../pages/SideNav";
import { SignInPage } from "../pages/SignInPage";

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
  const signInPage = new SignInPage(page);
  const sideNav = new SideNav(page);

  await signInPage.login(user.username, defaultPassword);
  await sideNav.expectSignedInAs(user.username);

  return { user, users };
}
