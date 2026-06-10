import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";

import type { User } from "../../../src/models";
import { ApiClient } from "../../fixtures/apiClient";
import { defaultPassword, loginByApi } from "../../fixtures/auth";
import { getTestData, seedDatabase } from "../../fixtures/testData";

// Shared lowdb file — avoid parallel workers mutating seed data at once.
test.describe.configure({ mode: "serial" });

test.describe("Users API", () => {
  let authenticatedUser: User;
  let searchUser: User;

  test.beforeEach(async ({ request }) => {
    await seedDatabase(request);

    const users = await getTestData<User>(request, "users");
    authenticatedUser = users[0];
    searchUser = users[1];

    await loginByApi(request, authenticatedUser.username);
  });

  test("GET /users returns users", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.users.list();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.results.length).toBeGreaterThan(1);
  });

  test("GET /users/:userId returns a user", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.users.get(authenticatedUser.id);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.user).toHaveProperty("firstName");
  });

  test("GET /users/:userId returns validation error for invalid userId", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.users.get("1234");
    const body = await response.json();

    expect(response.status()).toBe(422);
    expect(body.errors).toHaveLength(1);
  });

  test("GET /users/profile/:username returns a public user profile", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.users.getProfile(authenticatedUser.username);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.user).toEqual({
      firstName: authenticatedUser.firstName,
      lastName: authenticatedUser.lastName,
      avatar: authenticatedUser.avatar,
    });
    expect(body.user).not.toHaveProperty("balance");
  });

  test("GET /users/search returns users by email", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.users.search(searchUser.email);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.results[0]).toMatchObject({ firstName: searchUser.firstName });
  });

  test("GET /users/search returns users by phone number", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.users.search(searchUser.phoneNumber);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.results[0]).toMatchObject({ firstName: searchUser.firstName });
  });

  test("GET /users/search returns users by username", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.users.search(searchUser.username);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.results[0]).toMatchObject({ firstName: searchUser.firstName });
  });

  test("POST /users creates a new user", async ({ request }) => {
    const api = new ApiClient(request);
    const firstName = faker.name.firstName();
    const response = await api.users.create({
      firstName,
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      avatar: faker.internet.avatar(),
    });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.user).toMatchObject({ firstName });
  });

  test("POST /users creates a new user with an account balance in cents", async ({ request }) => {
    const api = new ApiClient(request);
    const firstName = faker.name.firstName();
    const response = await api.users.create({
      firstName,
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      avatar: faker.internet.avatar(),
      balance: 100_00,
    });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.user).toMatchObject({ firstName });
    expect(body.user.balance).toBe(100_00);
  });

  test("POST /users returns validation error for invalid field", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.users.create({
      notAUserField: "not a user field",
    });
    const body = await response.json();

    expect(response.status()).toBe(422);
    expect(body.errors).toHaveLength(1);
  });

  test("PATCH /users/:userId updates a user", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.users.update(authenticatedUser.id, {
      firstName: faker.name.firstName(),
    });

    expect(response.status()).toBe(204);
  });

  test("PATCH /users/:userId returns validation error for invalid field", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.users.update(authenticatedUser.id, {
      notAUserField: "not a user field",
    });
    const body = await response.json();

    expect(response.status()).toBe(422);
    expect(body.errors).toHaveLength(1);
  });

  test("POST /login logs in as a user", async ({ request }) => {
    const response = await loginByApi(request, authenticatedUser.username, defaultPassword);

    expect(response.status()).toBe(200);
  });
});
