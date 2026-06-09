/**
 * Run (from playwright/): API + app must be up, or use webServer in playwright.config.
 *   yarn test:api
 */
import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";

import type { BankAccount, User } from "../../../src/models";
import { ApiClient } from "../../fixtures/apiClient";
import { loginByApi } from "../../fixtures/auth";
import { getTestData, seedDatabase } from "../../fixtures/testData";

// Shared lowdb file — avoid parallel workers mutating seed data at once.
test.describe.configure({ mode: "serial" });

test.describe("Bank Accounts API", () => {
  let authenticatedUser: User;
  let bankAccounts: BankAccount[];

  test.beforeEach(async ({ request }) => {
    await seedDatabase(request);

    const users = await getTestData<User>(request, "users");
    authenticatedUser = users[0];
    await loginByApi(request, authenticatedUser.username);

    bankAccounts = await getTestData<BankAccount>(request, "bankaccounts");
  });

  test("GET /bankAccounts returns accounts for authenticated user", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.listBankAccounts();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.results[0].userId).toBe(authenticatedUser.id);
  });

  test("GET /bankAccounts/:bankAccountId returns a bank account", async ({ request }) => {
    const api = new ApiClient(request);
    const bankAccountId = bankAccounts[0].id;
    const response = await api.getBankAccount(bankAccountId);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.account.userId).toBe(authenticatedUser.id);
  });

  test("POST /bankAccounts creates a new bank account", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.createBankAccount({
      bankName: `${faker.company.companyName()} Bank`,
      accountNumber: faker.finance.account(10),
      routingNumber: faker.finance.account(9),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(typeof body.account.id).toBe("string");
    expect(body.account.userId).toBe(authenticatedUser.id);
  });

  test("DELETE /bankAccounts/:bankAccountId deletes a bank account", async ({ request }) => {
    const api = new ApiClient(request);
    const bankAccountId = bankAccounts[0].id;
    const response = await api.deleteBankAccount(bankAccountId);

    expect(response.status()).toBe(200);
  });
});
