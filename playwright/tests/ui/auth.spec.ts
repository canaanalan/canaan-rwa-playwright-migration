/**
 * First UI slice: local auth smoke coverage.
 */
import { test, expect } from "@playwright/test";

import type { User } from "../../../src/models";
import { defaultPassword } from "../../fixtures/auth";
import { getTestData, seedDatabase } from "../../fixtures/testData";
import { BankAccountForm } from "../../pages/BankAccountForm";
import { SideNav } from "../../pages/SideNav";
import { SignInPage } from "../../pages/SignInPage";

test.describe("User Sign-up and Login", () => {
  test.beforeEach(async ({ context, page, request }) => {
    await seedDatabase(request);
    await context.clearCookies();
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
  });

  test("redirects unauthenticated user to signin page", async ({ page }) => {
    const signInPage = new SignInPage(page);

    await page.goto("/personal");

    await signInPage.expectLoaded();
  });

  test("logs in and logs out as a seeded user", async ({ page, request }) => {
    const users = await getTestData<User>(request, "users");
    const user = users[0];
    const signInPage = new SignInPage(page);
    const sideNav = new SideNav(page);

    await signInPage.login(user.username, defaultPassword);

    await expect(page).toHaveURL(/\/$/);
    await sideNav.expectSignedInAs(user.username);
    await expect(page.locator("[data-test=nav-top-new-transaction]")).toBeVisible();

    await sideNav.signOut();

    await signInPage.expectLoaded();
  });

  test("displays login validation errors", async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();
    await signInPage.expectRequiredUsernameValidation();
    await signInPage.expectShortPasswordValidation();

    await expect(signInPage.submitButton).toBeDisabled();
  });

  test("displays an error for invalid credentials", async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.login("invalidUserName", "invalidPa$$word");

    await signInPage.expectInvalidCredentialsError();
  });

  test("allows a visitor to sign up, onboard, and log out", async ({ page }) => {
    const userInfo = {
      firstName: "Bob",
      lastName: "Ross",
      username: `PainterJoy${Date.now()}`,
      password: "s3cret",
    };
    const signInPage = new SignInPage(page);
    const sideNav = new SideNav(page);
    const bankAccountForm = new BankAccountForm(page);

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

    await signInPage.login(userInfo.username, userInfo.password);

    await expect(page.locator("[data-test=user-onboarding-dialog]")).toBeVisible();
    await expect(page.locator("[data-test=list-skeleton]")).toHaveCount(0);
    await expect(page.locator("[data-test=nav-top-notifications-count]")).toBeVisible();

    await page.locator("[data-test=user-onboarding-next]").click();

    await expect(page.locator("[data-test=user-onboarding-dialog-title]")).toContainText(
      "Create Bank Account"
    );

    await bankAccountForm.create({
      bankName: "The Best Bank",
      routingNumber: "987654321",
      accountNumber: "123456789",
    });

    await expect(page.locator("[data-test=user-onboarding-dialog-title]")).toContainText(
      "Finished"
    );
    await expect(page.locator("[data-test=user-onboarding-dialog-content]")).toContainText(
      "You're all set!"
    );

    await page.locator("[data-test=user-onboarding-next]").click();

    await expect(page.locator("[data-test=transaction-list]")).toBeVisible();

    await sideNav.signOut();

    await expect(page).toHaveURL(/\/signin$/);
  });
});
