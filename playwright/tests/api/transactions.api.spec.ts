import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";

import type { BankAccount, NotificationType, Transaction, User } from "../../../src/models";
import { ApiClient } from "../../fixtures/apiClient";
import { loginByApi } from "../../fixtures/auth";
import { findTestData, getTestData, seedDatabase } from "../../fixtures/testData";

const getFakeAmount = () => parseInt(faker.finance.amount(), 10);

// Shared lowdb file — avoid parallel workers mutating seed data at once.
test.describe.configure({ mode: "serial" });

test.describe("Transactions API", () => {
  let authenticatedUser: User;
  let receiver: User;
  let transactionId: string;
  let bankAccountId: string;

  const isSenderOrReceiver = (transaction: Transaction) =>
    transaction.senderId === authenticatedUser.id || transaction.receiverId === authenticatedUser.id;

  test.beforeEach(async ({ request }) => {
    await seedDatabase(request);

    const users = await getTestData<User>(request, "users");
    authenticatedUser = users[0];
    receiver = users[1];
    await loginByApi(request, authenticatedUser.username);

    const transaction = await findTestData<Transaction>(request, "transactions", {});
    const notification = await findTestData<NotificationType>(request, "notifications", {});
    const bankAccount = await findTestData<BankAccount>(request, "bankaccounts", {});

    if (!transaction || !notification || !bankAccount) {
      throw new Error("Expected seeded transaction, notification, and bank account");
    }

    transactionId = transaction.id;
    bankAccountId = bankAccount.id;
  });

  test("GET /transactions returns transactions for user by default", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.listTransactions();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(isSenderOrReceiver(body.results[0])).toBe(true);
  });

  test("GET /transactions returns pending request transactions for user", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.listTransactions({ requestStatus: "pending" });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(isSenderOrReceiver(body.results[0])).toBe(true);
  });

  test("GET /transactions returns pending request transactions within a time range", async ({
    request,
  }) => {
    const api = new ApiClient(request);
    const response = await api.listTransactions({
      requestStatus: "pending",
      dateRangeStart: new Date("Jan 01 2018").toISOString(),
      dateRangeEnd: new Date("Dec 05 2030").toISOString(),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(isSenderOrReceiver(body.results[0])).toBe(true);
  });

  test("GET /transactions/contacts returns contact transactions page one", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.listContactTransactions();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.results.length).toBeGreaterThan(1);
  });

  test("GET /transactions/contacts returns contact transactions page two", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.listContactTransactions({ page: 2 });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.results.length).toBeGreaterThan(1);
  });

  test("GET /transactions/public returns public transactions", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.listPublicTransactions();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.results.length).toBeGreaterThan(1);
  });

  test("POST /transactions creates a new payment", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.createTransaction({
      transactionType: "payment",
      source: bankAccountId,
      receiverId: receiver.id,
      description: `Payment: ${authenticatedUser.id} to ${receiver.id}`,
      amount: getFakeAmount(),
      privacyLevel: "public",
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(typeof body.transaction.id).toBe("string");
    expect(body.transaction.status).toBe("complete");
    expect(body.transaction.requestStatus).toBeUndefined();
  });

  test("POST /transactions creates a new request", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.createTransaction({
      transactionType: "request",
      source: bankAccountId,
      receiverId: receiver.id,
      description: `Request: ${authenticatedUser.id} from ${receiver.id}`,
      amount: getFakeAmount(),
      privacyLevel: "public",
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(typeof body.transaction.id).toBe("string");
    expect(body.transaction.status).toBe("pending");
    expect(body.transaction.requestStatus).toBe("pending");
  });

  test("PATCH /transactions/:transactionId updates a transaction", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.updateTransaction(transactionId, {
      requestStatus: "rejected",
    });

    expect(response.status()).toBe(204);
  });

  test("PATCH /transactions/:transactionId returns validation error for invalid field", async ({
    request,
  }) => {
    const api = new ApiClient(request);
    const response = await api.updateTransaction(transactionId, {
      notATransactionField: "not a transaction field",
    });
    const body = await response.json();

    expect(response.status()).toBe(422);
    expect(body.errors).toHaveLength(1);
  });
});
