/**
 * First notifications slice: list, dismiss, and empty-state behavior.
 */
import { test, expect } from "@playwright/test";

import { loginSeededUser } from "../../fixtures/uiAuth";

test.describe("Notifications", () => {
  test("renders notifications for the current user", async ({ context, page, request }) => {
    await loginSeededUser(page, context, request);
    await page.goto("/notifications");

    await expect(page).toHaveURL(/\/notifications$/);
    await expect(page.locator("[data-test=notifications-list]")).toBeVisible();
    await expect(page.locator("[data-test^=notification-list-item-]").first()).toBeVisible();
  });

  test("marks a notification as read", async ({ context, page, request }) => {
    await loginSeededUser(page, context, request);
    await page.goto("/notifications");

    const notificationItems = page.locator("[data-test^=notification-list-item-]");
    await expect(notificationItems.first()).toBeVisible();
    const initialCount = await notificationItems.count();

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("/notifications/") && response.request().method() === "PATCH"
      ),
      notificationItems.first().locator("[data-test^=notification-mark-read-]").click(),
    ]);

    await expect(notificationItems).toHaveCount(initialCount - 1);
  });

  test("renders an empty notifications state", async ({ context, page, request }) => {
    await page.route("http://localhost:3001/notifications**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: [] }),
      });
    });

    await loginSeededUser(page, context, request);
    await page.goto("/notifications");

    await expect(page.locator("[data-test=notifications-list]")).toHaveCount(0);
    await expect(page.locator("[data-test=empty-list-header]")).toContainText("No Notifications");
  });
});
