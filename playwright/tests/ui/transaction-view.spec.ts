/**
 * First transaction detail slice: navigation, social actions, and request resolution.
 */
import { test, expect } from "@playwright/test";

import { TransactionStatus, type Transaction, type User } from "../../../src/models";
import { loginSeededUser } from "../../fixtures/uiAuth";
import { findTestData } from "../../fixtures/testData";

test.describe.configure({ mode: "serial" });

test.describe("Transaction View", () => {
  let authenticatedUser: User;

  test.beforeEach(async ({ context, page, request }) => {
    const session = await loginSeededUser(page, context, request);
    authenticatedUser = session.user;
  });

  test("hides transaction feed tabs on a transaction detail page", async ({ page }) => {
    await page.goto("/personal");

    const firstTransaction = page.locator("[data-test^=transaction-item-]").first();
    await expect(firstTransaction).toBeVisible();
    await firstTransaction.click();

    await expect(page).toHaveURL(/\/transaction\//);
    await expect(page.locator("[data-test=nav-transaction-tabs]")).toHaveCount(0);
    await expect(page.locator("[data-test=transaction-detail-header]")).toBeVisible();
  });

  test("likes a transaction", async ({ page }) => {
    await page.goto("/personal");

    const firstTransaction = page.locator("[data-test^=transaction-item-]").first();
    await expect(firstTransaction).toBeVisible();
    await firstTransaction.click();
    await expect(page.locator("[data-test=transaction-detail-header]")).toBeVisible();

    const transactionId = page.url().split("/transaction/")[1];
    const likeCount = page.locator(`[data-test=transaction-like-count-${transactionId}]`);
    const initialCount = Number((await likeCount.textContent())?.trim() ?? "0");

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes(`/likes/${transactionId}`) &&
        response.request().method() === "POST"
      ),
      page.locator(`[data-test=transaction-like-button-${transactionId}]`).click(),
    ]);

    await expect(likeCount).toContainText(`${initialCount + 1}`);
    await expect(
      page.locator(`[data-test=transaction-like-button-${transactionId}]`)
    ).toBeDisabled();
  });

  test("comments on a transaction", async ({ page }) => {
    await page.goto("/personal");

    const firstTransaction = page.locator("[data-test^=transaction-item-]").first();
    await expect(firstTransaction).toBeVisible();
    await firstTransaction.click();
    await expect(page.locator("[data-test=transaction-detail-header]")).toBeVisible();

    const transactionId = page.url().split("/transaction/")[1];
    const comment = `Playwright comment ${Date.now()}`;

    await page.locator(`[data-test=transaction-comment-input-${transactionId}]`).fill(comment);
    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes(`/comments/${transactionId}`) &&
        response.request().method() === "POST"
      ),
      page.locator(`[data-test=transaction-comment-input-${transactionId}]`).press("Enter"),
    ]);

    await expect(page.locator("[data-test=comments-list]")).toContainText(comment);
  });

  test("accepts a pending transaction request", async ({ page, request }) => {
    const transactionRequest = await findTestData<Transaction>(request, "transactions", {
      receiverId: authenticatedUser.id,
      status: TransactionStatus.pending,
      requestStatus: "pending",
      requestResolvedAt: "",
    });

    if (!transactionRequest) {
      throw new Error("Expected a seeded pending request transaction for the authenticated user");
    }

    await page.goto(`/transaction/${transactionRequest.id}`);
    await expect(page.locator("[data-test=transaction-detail-header]")).toBeVisible();

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes(`/transactions/${transactionRequest.id}`) &&
        response.request().method() === "PATCH"
      ),
      page.locator(`[data-test=transaction-accept-request-${transactionRequest.id}]`).click(),
    ]);

    await expect(
      page.locator(`[data-test=transaction-accept-request-${transactionRequest.id}]`)
    ).toHaveCount(0);
    await expect(
      page.locator(`[data-test=transaction-reject-request-${transactionRequest.id}]`)
    ).toHaveCount(0);
  });
});
