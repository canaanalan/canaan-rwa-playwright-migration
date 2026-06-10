import { expect, test } from "@playwright/test";

import { ApiClient } from "../../fixtures/apiClient";

test.describe("Health API", () => {
  test("reports service readiness and seeded data checks", async ({ request }) => {
    const api = new ApiClient(request);

    const response = await api.health.get();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      service: "canaan-rwa-backend",
      environment: "development",
      checks: {
        database: "ok",
      },
    });
    expect(new Date(body.timestamp).toString()).not.toBe("Invalid Date");
    expect(body.checks.seededUsers).toBeGreaterThan(0);
    expect(body.checks.seededTransactions).toBeGreaterThan(0);
  });
});
