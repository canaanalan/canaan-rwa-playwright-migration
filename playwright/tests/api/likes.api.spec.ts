import { test, expect } from "@playwright/test";

import type { Like, User } from "../../../src/models";
import { ApiClient } from "../../fixtures/apiClient";
import { loginByApi } from "../../fixtures/auth";
import { findTestData, getTestData, seedDatabase } from "../../fixtures/testData";

// Shared lowdb file — avoid parallel workers mutating seed data at once.
test.describe.configure({ mode: "serial" });

test.describe("Likes API", () => {
  let transactionId: string;

  test.beforeEach(async ({ request }) => {
    await seedDatabase(request);

    const users = await getTestData<User>(request, "users");
    await loginByApi(request, users[0].username);

    const like = await findTestData<Like>(request, "likes", {});
    if (!like) {
      throw new Error("Expected at least one seeded like");
    }

    transactionId = like.transactionId;
  });

  test("GET /likes/:transactionId returns likes for a transaction", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.likes.list(transactionId);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.likes).toHaveLength(1);
  });

  test("POST /likes/:transactionId creates a like", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.likes.create(transactionId, { transactionId });

    expect(response.status()).toBe(200);
  });
});
