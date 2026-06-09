import { test, expect, type Page, type APIRequestContext, type BrowserContext } from "@playwright/test";

import type { User } from "../../../src/models";
import { defaultPassword } from "../../fixtures/auth";
import { getTestData, seedDatabase } from "../../fixtures/testData";

async function loginSeededUser(
  page: Page,
  context: BrowserContext,
  request: APIRequestContext
) {
  await seedDatabase(request);
  await context.clearCookies();
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());

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

  await expect(page.locator("[data-test=sidenav-username]")).toContainText(`@${user.username}`);
}

test.describe("Bank Accounts", () => {
  test.beforeEach(async ({ context, page, request }) => {
    await loginSeededUser(page, context, request);
  });

  test("creates a new bank account", async ({ page }) => {
    await page.goto("/bankaccounts");
    await page.locator("[data-test=bankaccount-new]").click();

    await expect(page).toHaveURL(/\/bankaccounts\/new$/);

    await page.locator("[data-test=bankaccount-bankName-input] input").fill("The Best Bank");
    await page.locator("[data-test=bankaccount-routingNumber-input] input").fill("987654321");
    await page.locator("[data-test=bankaccount-accountNumber-input] input").fill("123456789");

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("/bankAccounts") && response.request().method() === "POST"
      ),
      page.locator("[data-test=bankaccount-submit]").click(),
    ]);

    await expect(page.locator("[data-test^=bankaccount-list-item-]")).toHaveCount(2);
    await expect(page.locator("[data-test^=bankaccount-list-item-]").last()).toContainText(
      "The Best Bank"
    );
  });

  test("displays bank account form validation errors", async ({ page }) => {
    await page.goto("/bankaccounts/new");

    await page.locator("[data-test=bankaccount-bankName-input] input").fill("The");
    await page.locator("[data-test=bankaccount-bankName-input] input").clear();
    await page.locator("[data-test=bankaccount-bankName-input] input").blur();
    await expect(page.locator("#bankaccount-bankName-input-helper-text")).toContainText(
      "Enter a bank name"
    );

    await page.locator("[data-test=bankaccount-bankName-input] input").fill("The");
    await page.locator("[data-test=bankaccount-bankName-input] input").blur();
    await expect(page.locator("#bankaccount-bankName-input-helper-text")).toContainText(
      "Must contain at least 5 characters"
    );

    await page.locator("[data-test=bankaccount-routingNumber-input] input").focus();
    await page.locator("[data-test=bankaccount-routingNumber-input] input").blur();
    await expect(page.locator("#bankaccount-routingNumber-input-helper-text")).toContainText(
      "Enter a valid bank routing number"
    );

    await page.locator("[data-test=bankaccount-routingNumber-input] input").fill("12345678");
    await page.locator("[data-test=bankaccount-routingNumber-input] input").blur();
    await expect(page.locator("#bankaccount-routingNumber-input-helper-text")).toContainText(
      "Must contain a valid routing number"
    );

    await page.locator("[data-test=bankaccount-accountNumber-input] input").focus();
    await page.locator("[data-test=bankaccount-accountNumber-input] input").blur();
    await expect(page.locator("#bankaccount-accountNumber-input-helper-text")).toContainText(
      "Enter a valid bank account number"
    );

    await page.locator("[data-test=bankaccount-accountNumber-input] input").fill("12345678");
    await page.locator("[data-test=bankaccount-accountNumber-input] input").blur();
    await expect(page.locator("#bankaccount-accountNumber-input-helper-text")).toContainText(
      "Must contain at least 9 digits"
    );

    await page.locator("[data-test=bankaccount-accountNumber-input] input").clear();
    await page.locator("[data-test=bankaccount-accountNumber-input] input").fill("1234567891111");
    await page.locator("[data-test=bankaccount-accountNumber-input] input").blur();
    await expect(page.locator("#bankaccount-accountNumber-input-helper-text")).toContainText(
      "Must contain no more than 12 digits"
    );

    await expect(page.locator("[data-test=bankaccount-submit]")).toBeDisabled();
  });

  test("soft deletes a bank account", async ({ page }) => {
    await page.goto("/bankaccounts");

    const firstBankAccount = page.locator("[data-test^=bankaccount-list-item-]").first();
    await expect(firstBankAccount).toBeVisible();

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("/bankAccounts") && response.request().method() === "DELETE"
      ),
      firstBankAccount.locator("[data-test=bankaccount-delete]").click(),
    ]);

    await expect(firstBankAccount).toContainText("(Deleted)");
  });
});
