import { test, expect } from "@playwright/test";

import type { Contact, User } from "../../../src/models";
import { ApiClient } from "../../fixtures/apiClient";
import { loginByApi } from "../../fixtures/auth";
import { findTestData, getTestData, seedDatabase } from "../../fixtures/testData";

// Shared lowdb file — avoid parallel workers mutating seed data at once.
test.describe.configure({ mode: "serial" });

test.describe("Contacts API", () => {
  let authenticatedUser: User;
  let contact: Contact;

  test.beforeEach(async ({ request }) => {
    await seedDatabase(request);

    const users = await getTestData<User>(request, "users");
    authenticatedUser = users[0];
    await loginByApi(request, authenticatedUser.username);

    const seededContact = await findTestData<Contact>(request, "contacts", {});
    if (!seededContact) {
      throw new Error("Expected at least one seeded contact");
    }

    contact = seededContact;
  });

  test("GET /contacts/:username returns contacts by username", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.contacts.list(authenticatedUser.username);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.contacts[0]).toHaveProperty("userId");
  });

  test("POST /contacts creates a contact", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.contacts.create({ contactUserId: contact.contactUserId });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(typeof body.contact.id).toBe("string");
    expect(body.contact.userId).toBe(authenticatedUser.id);
  });

  test("POST /contacts returns validation error for invalid contactUserId", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.contacts.create({ contactUserId: "1234" });
    const body = await response.json();

    expect(response.status()).toBe(422);
    expect(body.errors).toHaveLength(1);
  });

  test("DELETE /contacts/:contactId deletes a contact", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.contacts.delete(contact.id);

    expect(response.status()).toBe(200);
  });
});
