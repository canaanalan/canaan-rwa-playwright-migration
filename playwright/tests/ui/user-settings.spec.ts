import { test, expect } from "@playwright/test";

import { loginSeededUser } from "../../fixtures/uiAuth";

test.describe("User Settings", () => {
  test.beforeEach(async ({ context, page, request }) => {
    await loginSeededUser(page, context, request);
    await page.goto("/user/settings");
  });

  test("renders the user settings form", async ({ page }) => {
    await expect(page).toHaveURL(/\/user\/settings$/);
    await expect(page.locator("[data-test=user-settings-form]")).toBeVisible();
  });

  test("displays user settings form validation errors", async ({ page }) => {
    for (const field of ["first", "last"]) {
      await page.locator(`[data-test=user-settings-${field}Name-input]`).fill("Abc");
      await page.locator(`[data-test=user-settings-${field}Name-input]`).clear();
      await page.locator(`[data-test=user-settings-${field}Name-input]`).blur();

      await expect(page.locator(`#user-settings-${field}Name-input-helper-text`)).toContainText(
        `Enter a ${field} name`
      );
    }

    await page.locator("[data-test=user-settings-email-input]").fill("abc");
    await page.locator("[data-test=user-settings-email-input]").clear();
    await page.locator("[data-test=user-settings-email-input]").blur();
    await expect(page.locator("#user-settings-email-input-helper-text")).toContainText(
      "Enter an email address"
    );

    await page.locator("[data-test=user-settings-email-input]").fill("abc@bob.");
    await page.locator("[data-test=user-settings-email-input]").blur();
    await expect(page.locator("#user-settings-email-input-helper-text")).toContainText(
      "Must contain a valid email address"
    );

    await page.locator("[data-test=user-settings-phoneNumber-input]").fill("abc");
    await page.locator("[data-test=user-settings-phoneNumber-input]").clear();
    await page.locator("[data-test=user-settings-phoneNumber-input]").blur();
    await expect(page.locator("#user-settings-phoneNumber-input-helper-text")).toContainText(
      "Enter a phone number"
    );

    await page.locator("[data-test=user-settings-phoneNumber-input]").fill("615-555-");
    await page.locator("[data-test=user-settings-phoneNumber-input]").blur();
    await expect(page.locator("#user-settings-phoneNumber-input-helper-text")).toContainText(
      "Phone number is not valid"
    );

    await expect(page.locator("[data-test=user-settings-submit]")).toBeDisabled();
  });

  test("updates first name, last name, email, and phone number", async ({ page }) => {
    await page.locator("[data-test=user-settings-firstName-input]").clear();
    await page.locator("[data-test=user-settings-firstName-input]").fill("New First Name");
    await page.locator("[data-test=user-settings-lastName-input]").clear();
    await page.locator("[data-test=user-settings-lastName-input]").fill("New Last Name");
    await page.locator("[data-test=user-settings-email-input]").clear();
    await page.locator("[data-test=user-settings-email-input]").fill("email@email.com");
    await page.locator("[data-test=user-settings-phoneNumber-input]").clear();
    await page.locator("[data-test=user-settings-phoneNumber-input]").fill("6155551212");
    await page.locator("[data-test=user-settings-phoneNumber-input]").blur();

    await expect(page.locator("[data-test=user-settings-submit]")).toBeEnabled();

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes("/users/") && response.request().method() === "PATCH"
      ),
      page.locator("[data-test=user-settings-submit]").click(),
    ]);

    await expect(page.locator("[data-test=sidenav-user-full-name]")).toContainText(
      "New First Name"
    );
  });
});
