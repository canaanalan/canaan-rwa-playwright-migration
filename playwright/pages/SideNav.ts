import { expect, type Page } from "@playwright/test";

export class SideNav {
  constructor(private readonly page: Page) {}

  get username() {
    return this.page.locator("[data-test=sidenav-username]");
  }

  get signOutButton() {
    return this.page.locator("[data-test=sidenav-signout]");
  }

  async expectSignedInAs(username: string) {
    await expect(this.username).toContainText(`@${username}`);
  }

  async signOut() {
    await this.signOutButton.click();
  }
}
