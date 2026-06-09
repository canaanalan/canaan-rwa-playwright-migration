/**
 * First UI slice: local auth smoke coverage.
 */
import { test, expect } from "@playwright/test";

import type { User } from "../../../src/models";
import { defaultPassword } from "../../fixtures/auth";
import { getTestData, seedDatabase } from "../../fixtures/testData";

test.describe("User Sign-up and Login", () => {
  test.beforeEach(async ({ context, page, request }) => {
    await seedDatabase(request);
    await context.clearCookies();
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
  });

  test("redirects unauthenticated user to signin page", async ({ page }) => {
    await page.goto("/personal");

    await expect(page).toHaveURL(/\/signin$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("logs in and logs out as a seeded user", async ({ page, request }) => {
    const users = await getTestData<User>(request, "users");
    const user = users[0];

    await page.goto("/signin");
    await page.locator("[data-test=signin-username] input").fill(user.username);
    await page.locator("[data-test=signin-password] input").fill(defaultPassword);

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("/login") && response.request().method() === "POST"
      ),
      page.locator("[data-test=signin-submit]").click(),
    ]);

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("[data-test=sidenav-username]")).toContainText(`@${user.username}`);
    await expect(page.locator("[data-test=nav-top-new-transaction]")).toBeVisible();

    await page.locator("[data-test=sidenav-signout]").click();

    await expect(page).toHaveURL(/\/signin$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("displays login validation errors", async ({ page }) => {
    await page.goto("/signin");

    await page.locator("[data-test=signin-username] input").fill("User");
    await page.locator("[data-test=signin-username] input").clear();
    await page.locator("[data-test=signin-username] input").blur();

    await expect(page.locator("#username-helper-text")).toContainText("Username is required");

    await page.locator("[data-test=signin-password] input").fill("abc");
    await page.locator("[data-test=signin-password] input").blur();

    await expect(page.locator("#password-helper-text")).toContainText(
      "Password must contain at least 4 characters"
    );
    await expect(page.locator("[data-test=signin-submit]")).toBeDisabled();
  });

  test("displays an error for invalid credentials", async ({ page }) => {
    await page.goto("/signin");

    await page.locator("[data-test=signin-username] input").fill("invalidUserName");
    await page.locator("[data-test=signin-password] input").fill("invalidPa$$word");

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("/login") && response.request().method() === "POST"
      ),
      page.locator("[data-test=signin-submit]").click(),
    ]);

    await expect(page.locator("[data-test=signin-error]")).toHaveText(
      "Username or password is invalid"
    );
  });

  test("allows a visitor to sign up, onboard, and log out", async ({ page }) => {
    const userInfo = {
      firstName: "Bob",
      lastName: "Ross",
      username: `PainterJoy${Date.now()}`,
      password: "s3cret",
    };

    await page.goto("/signup");
    await expect(page.locator("[data-test=signup-title]")).toBeVisible();

    await page.locator("[data-test=signup-first-name] input").fill(userInfo.firstName);
    await page.locator("[data-test=signup-last-name] input").fill(userInfo.lastName);
    await page.locator("[data-test=signup-username] input").fill(userInfo.username);
    await page.locator("[data-test=signup-password] input").fill(userInfo.password);
    await page.locator("[data-test=signup-confirmPassword] input").fill(userInfo.password);

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("/users") && response.request().method() === "POST"
      ),
      page.locator("[data-test=signup-submit]").click(),
    ]);

    await expect(page).toHaveURL(/\/signin$/);

    await page.locator("[data-test=signin-username] input").fill(userInfo.username);
    await page.locator("[data-test=signin-password] input").fill(userInfo.password);

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("/login") && response.request().method() === "POST"
      ),
      page.locator("[data-test=signin-submit]").click(),
    ]);

    await expect(page.locator("[data-test=user-onboarding-dialog]")).toBeVisible();
    await expect(page.locator("[data-test=list-skeleton]")).toHaveCount(0);
    await expect(page.locator("[data-test=nav-top-notifications-count]")).toBeVisible();

    await page.locator("[data-test=user-onboarding-next]").click();

    await expect(page.locator("[data-test=user-onboarding-dialog-title]")).toContainText(
      "Create Bank Account"
    );

    await page.locator("[data-test=bankaccount-bankName-input] input").fill("The Best Bank");
    await page.locator("[data-test=bankaccount-accountNumber-input] input").fill("123456789");
    await page.locator("[data-test=bankaccount-routingNumber-input] input").fill("987654321");

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("/bankAccounts") && response.request().method() === "POST"
      ),
      page.locator("[data-test=bankaccount-submit]").click(),
    ]);

    await expect(page.locator("[data-test=user-onboarding-dialog-title]")).toContainText(
      "Finished"
    );
    await expect(page.locator("[data-test=user-onboarding-dialog-content]")).toContainText(
      "You're all set!"
    );

    await page.locator("[data-test=user-onboarding-next]").click();

    await expect(page.locator("[data-test=transaction-list]")).toBeVisible();

    await page.locator("[data-test=sidenav-signout]").click();

    await expect(page).toHaveURL(/\/signin$/);
  });
});
