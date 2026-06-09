import { test, expect } from "@playwright/test";

import type { User } from "../../../src/models";
import { ApiClient } from "../../fixtures/apiClient";
import { loginByApi } from "../../fixtures/auth";
import { findTestData, seedDatabase } from "../../fixtures/testData";

// Shared lowdb file — avoid parallel workers mutating seed data at once.
test.describe.configure({ mode: "serial" });

test.describe("Bank Transfer API", () => {
  let authenticatedUser: User;

  test.beforeEach(async ({ request }) => {
    await seedDatabase(request);

    const user = await findTestData<User>(request, "users", {});
    if (!user) {
      throw new Error("Expected at least one seeded user");
    }

    authenticatedUser = user;
    await loginByApi(request, authenticatedUser.username);
  });

  test("GET /bankTransfers returns transfers for authenticated user", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.listBankTransfers();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.transfers[0].userId).toBe(authenticatedUser.id);
  });
});
