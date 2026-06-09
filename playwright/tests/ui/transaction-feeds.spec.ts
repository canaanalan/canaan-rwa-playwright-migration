/**
 * First feeds slice: list rendering, tab navigation, and drawer behavior.
 */
import { test, expect } from "@playwright/test";

import { loginSeededUser } from "../../fixtures/uiAuth";

test.describe.configure({ mode: "serial" });

test.describe("Transaction Feeds", () => {
  test.beforeEach(async ({ context, page, request }) => {
    await loginSeededUser(page, context, request);
  });

  test("renders the public transaction feed by default", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("[data-test=nav-public-tab]")).toHaveClass(/Mui-selected/);
    await expect(page.locator("[data-test=transaction-list]")).toBeVisible();
    await expect(page.locator("[data-test^=transaction-item-]").first()).toBeVisible();
  });

  test("switches between public, contacts, and personal feeds", async ({ page }) => {
    const feeds = [
      { tab: "nav-public-tab", url: /\/$/, label: "Everyone" },
      { tab: "nav-contacts-tab", url: /\/contacts$/, label: "Friends" },
      { tab: "nav-personal-tab", url: /\/personal$/, label: "Mine" },
    ];

    await page.goto("/");

    for (const feed of feeds) {
      await page.locator(`[data-test=${feed.tab}]`).click();

      await expect(page).toHaveURL(feed.url);
      await expect(page.locator(`[data-test=${feed.tab}]`)).toHaveClass(/Mui-selected/);
      await expect(page.locator(`[data-test=${feed.tab}]`)).toContainText(feed.label);
      await expect(page.locator("[data-test=transaction-list]")).toBeVisible();
      await expect(page.locator("[data-test^=transaction-item-]").first()).toBeVisible();
    }
  });

  test("toggles the side navigation drawer", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("[data-test=sidenav-home]")).toBeVisible();
    await page.locator("[data-test=sidenav-toggle]").click();
    await expect(page.locator("[data-test=sidenav-home]")).toBeHidden();

    await page.locator("[data-test=sidenav-toggle]").click();
    await expect(page.locator("[data-test=sidenav-home]")).toBeVisible();
  });
});
