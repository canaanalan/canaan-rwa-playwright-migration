import { test, expect } from "@playwright/test";

import type { User } from "../../../src/models";
import { loginByApi } from "../../fixtures/auth";
import { getTestData, seedDatabase } from "../../fixtures/testData";

// Shared lowdb file — avoid parallel workers mutating seed data at once.
test.describe.configure({ mode: "serial" });

test.describe("Test Data API", () => {
  const entities = [
    "users",
    "contacts",
    "bankaccounts",
    "notifications",
    "transactions",
    "likes",
    "comments",
    "banktransfers",
  ];

  test.beforeEach(async ({ request }) => {
    await seedDatabase(request);

    const users = await getTestData<User>(request, "users");
    await loginByApi(request, users[0].username);
  });

  for (const entity of entities) {
    test(`GET /testData/${entity} returns seeded mock data`, async ({ request }) => {
      const results = await getTestData(request, entity);

      expect(results.length).toBeGreaterThan(1);
    });
  }
});
