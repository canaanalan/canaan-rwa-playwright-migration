/**
 * First new transaction slice: contact selection, payment/request submission, and validation.
 */
import { test, expect, type Page } from "@playwright/test";
import type { User } from "../../../src/models";
import { loginSeededUser } from "../../fixtures/uiAuth";

test.describe.configure({ mode: "serial" });

test.describe("New Transaction", () => {
  let contact: User;

  test.beforeEach(async ({ context, page, request }) => {
    const { users } = await loginSeededUser(page, context, request);
    contact = users[1];
    await page.goto("/transaction/new");
  });

  test("submits a transaction payment", async ({ page }) => {
    const payment = {
      amount: "35",
      description: `Sushi dinner ${Date.now()}`,
    };

    await expect(page.locator("[data-test=users-list]")).toBeVisible();
    await page.locator("[data-test=user-list-search-input]").fill(contact.firstName);
    await selectContact(page, contact);

    await page.locator("[data-test=transaction-create-amount-input] input").fill(payment.amount);
    await page
      .locator("[data-test=transaction-create-description-input] input")
      .fill(payment.description);

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("/transactions") && response.request().method() === "POST"
      ),
      page.locator("[data-test=transaction-create-submit-payment]").click(),
    ]);

    await expectStepThreeConfirmation(page, payment.description);

    await page.locator("[data-test=new-transaction-return-to-transactions]").click();
    await page.locator("[data-test=nav-personal-tab]").click();
    await expect(page.locator("[data-test^=transaction-item-]").first()).toContainText(
      payment.description
    );
  });

  test("submits a transaction request", async ({ page }) => {
    const request = {
      amount: "95",
      description: `Fancy hotel ${Date.now()}`,
    };

    await expect(page.locator("[data-test=users-list]")).toBeVisible();
    await selectContact(page, contact);

    await page.locator("[data-test=transaction-create-amount-input] input").fill(request.amount);
    await page
      .locator("[data-test=transaction-create-description-input] input")
      .fill(request.description);

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("/transactions") && response.request().method() === "POST"
      ),
      page.locator("[data-test=transaction-create-submit-request]").click(),
    ]);

    await expectStepThreeConfirmation(page, request.description);

    await page.locator("[data-test=new-transaction-return-to-transactions]").click();
    await page.locator("[data-test=nav-personal-tab]").click();
    await expect(page.locator("[data-test^=transaction-item-]").first()).toContainText(
      request.description
    );
  });

  test("displays validation errors and disables submit buttons", async ({ page }) => {
    await expect(page.locator("[data-test=users-list]")).toBeVisible();
    await selectContact(page, contact);

    await page.locator("[data-test=transaction-create-amount-input] input").fill("43");
    await page.locator("[data-test=transaction-create-amount-input] input").clear();
    await page.locator("[data-test=transaction-create-amount-input] input").blur();
    await expect(page.locator("#transaction-create-amount-input-helper-text")).toContainText(
      "Please enter a valid amount"
    );

    await page.locator("[data-test=transaction-create-description-input] input").fill("Fun");
    await page.locator("[data-test=transaction-create-description-input] input").clear();
    await page.locator("[data-test=transaction-create-description-input] input").blur();
    await expect(page.locator("#transaction-create-description-input-helper-text")).toContainText(
      "Please enter a note"
    );

    await expect(page.locator("[data-test=transaction-create-submit-request]")).toBeDisabled();
    await expect(page.locator("[data-test=transaction-create-submit-payment]")).toBeDisabled();
  });
});

async function selectContact(page: Page, contact: User) {
  const contactItem = page.locator(`[data-test=user-list-item-${contact.id}]`);
  await expect(contactItem).toBeVisible();
  await contactItem.click();
}

async function expectStepThreeConfirmation(page: Page, description: string) {
  await expect(page.locator("[data-test=new-transaction-return-to-transactions]")).toBeVisible();
  await expect(page.locator("[data-test=new-transaction-create-another-transaction]")).toBeVisible();
  await expect(page.getByText(description)).toBeVisible();
}
