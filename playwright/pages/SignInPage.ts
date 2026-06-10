import { expect, type Page } from "@playwright/test";

export class SignInPage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole("heading", { name: "Sign in" });
  }

  get usernameInput() {
    return this.page.locator("[data-test=signin-username] input");
  }

  get passwordInput() {
    return this.page.locator("[data-test=signin-password] input");
  }

  get submitButton() {
    return this.page.locator("[data-test=signin-submit]");
  }

  get errorMessage() {
    return this.page.locator("[data-test=signin-error]");
  }

  async goto() {
    await this.page.goto("/signin");
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/signin$/);
    await expect(this.heading).toBeVisible();
  }

  async fillCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async submitAndWaitForLogin() {
    await Promise.all([
      this.page.waitForResponse((response) =>
        response.url().includes("/login") && response.request().method() === "POST"
      ),
      this.submitButton.click(),
    ]);
  }

  async login(username: string, password: string) {
    await this.goto();
    await this.fillCredentials(username, password);
    await this.submitAndWaitForLogin();
  }

  async expectInvalidCredentialsError() {
    await expect(this.errorMessage).toHaveText("Username or password is invalid");
  }

  async expectRequiredUsernameValidation() {
    await this.usernameInput.fill("User");
    await this.usernameInput.clear();
    await this.usernameInput.blur();

    await expect(this.page.locator("#username-helper-text")).toContainText("Username is required");
  }

  async expectShortPasswordValidation() {
    await this.passwordInput.fill("abc");
    await this.passwordInput.blur();

    await expect(this.page.locator("#password-helper-text")).toContainText(
      "Password must contain at least 4 characters"
    );
  }
}
