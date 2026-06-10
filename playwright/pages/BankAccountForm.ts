import { expect, type Page } from "@playwright/test";

type BankAccountFormValues = {
  bankName: string;
  routingNumber: string;
  accountNumber: string;
};

export class BankAccountForm {
  constructor(private readonly page: Page) {}

  get bankNameInput() {
    return this.page.locator("[data-test=bankaccount-bankName-input] input");
  }

  get routingNumberInput() {
    return this.page.locator("[data-test=bankaccount-routingNumber-input] input");
  }

  get accountNumberInput() {
    return this.page.locator("[data-test=bankaccount-accountNumber-input] input");
  }

  get submitButton() {
    return this.page.locator("[data-test=bankaccount-submit]");
  }

  async fill(values: BankAccountFormValues) {
    await this.bankNameInput.fill(values.bankName);
    await this.routingNumberInput.fill(values.routingNumber);
    await this.accountNumberInput.fill(values.accountNumber);
  }

  async submitAndWaitForCreate() {
    await Promise.all([
      this.page.waitForResponse((response) =>
        response.url().includes("/bankAccounts") && response.request().method() === "POST"
      ),
      this.submitButton.click(),
    ]);
  }

  async create(values: BankAccountFormValues) {
    await this.fill(values);
    await this.submitAndWaitForCreate();
  }

  async expectValidationErrors() {
    await this.bankNameInput.fill("The");
    await this.bankNameInput.clear();
    await this.bankNameInput.blur();
    await expect(this.page.locator("#bankaccount-bankName-input-helper-text")).toContainText(
      "Enter a bank name"
    );

    await this.bankNameInput.fill("The");
    await this.bankNameInput.blur();
    await expect(this.page.locator("#bankaccount-bankName-input-helper-text")).toContainText(
      "Must contain at least 5 characters"
    );

    await this.routingNumberInput.focus();
    await this.routingNumberInput.blur();
    await expect(this.page.locator("#bankaccount-routingNumber-input-helper-text")).toContainText(
      "Enter a valid bank routing number"
    );

    await this.routingNumberInput.fill("12345678");
    await this.routingNumberInput.blur();
    await expect(this.page.locator("#bankaccount-routingNumber-input-helper-text")).toContainText(
      "Must contain a valid routing number"
    );

    await this.accountNumberInput.focus();
    await this.accountNumberInput.blur();
    await expect(this.page.locator("#bankaccount-accountNumber-input-helper-text")).toContainText(
      "Enter a valid bank account number"
    );

    await this.accountNumberInput.fill("12345678");
    await this.accountNumberInput.blur();
    await expect(this.page.locator("#bankaccount-accountNumber-input-helper-text")).toContainText(
      "Must contain at least 9 digits"
    );

    await this.accountNumberInput.clear();
    await this.accountNumberInput.fill("1234567891111");
    await this.accountNumberInput.blur();
    await expect(this.page.locator("#bankaccount-accountNumber-input-helper-text")).toContainText(
      "Must contain no more than 12 digits"
    );

    await expect(this.submitButton).toBeDisabled();
  }
}
