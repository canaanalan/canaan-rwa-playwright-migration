import { test, expect } from "@playwright/test";

import { loginSeededUser } from "../../fixtures/uiAuth";
import { BankAccountForm } from "../../pages/BankAccountForm";

test.describe("Bank Accounts", () => {
  test.beforeEach(async ({ context, page, request }) => {
    await loginSeededUser(page, context, request);
  });

  test("creates a new bank account", async ({ page }) => {
    const bankAccountForm = new BankAccountForm(page);

    await page.goto("/bankaccounts");
    await page.locator("[data-test=bankaccount-new]").click();

    await expect(page).toHaveURL(/\/bankaccounts\/new$/);

    await bankAccountForm.create({
      bankName: "The Best Bank",
      routingNumber: "987654321",
      accountNumber: "123456789",
    });

    await expect(page.locator("[data-test^=bankaccount-list-item-]")).toHaveCount(2);
    await expect(page.locator("[data-test^=bankaccount-list-item-]").last()).toContainText(
      "The Best Bank"
    );
  });

  test("displays bank account form validation errors", async ({ page }) => {
    const bankAccountForm = new BankAccountForm(page);

    await page.goto("/bankaccounts/new");

    await bankAccountForm.expectValidationErrors();
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
