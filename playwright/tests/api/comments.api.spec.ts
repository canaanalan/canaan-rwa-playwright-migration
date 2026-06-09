import { test, expect } from "@playwright/test";

import type { Comment, User } from "../../../src/models";
import { ApiClient } from "../../fixtures/apiClient";
import { loginByApi } from "../../fixtures/auth";
import { findTestData, getTestData, seedDatabase } from "../../fixtures/testData";

// Shared lowdb file — avoid parallel workers mutating seed data at once.
test.describe.configure({ mode: "serial" });

test.describe("Comments API", () => {
  let transactionId: string;

  test.beforeEach(async ({ request }) => {
    await seedDatabase(request);

    const users = await getTestData<User>(request, "users");
    await loginByApi(request, users[0].username);

    const comment = await findTestData<Comment>(request, "comments", {});
    if (!comment) {
      throw new Error("Expected at least one seeded comment");
    }

    transactionId = comment.transactionId;
  });

  test("GET /comments/:transactionId returns comments for a transaction", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.listComments(transactionId);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.comments).toHaveLength(1);
  });

  test("POST /comments/:transactionId creates a comment", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.createComment(transactionId, {
      content: "This is my comment",
    });

    expect(response.status()).toBe(200);
  });
});
