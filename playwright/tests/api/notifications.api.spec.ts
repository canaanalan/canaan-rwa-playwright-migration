import { test, expect } from "@playwright/test";

import type { Comment, Like, NotificationType, Transaction, User } from "../../../src/models";
import { ApiClient } from "../../fixtures/apiClient";
import { loginByApi } from "../../fixtures/auth";
import { findTestData, getTestData, seedDatabase } from "../../fixtures/testData";

// Shared lowdb file — avoid parallel workers mutating seed data at once.
test.describe.configure({ mode: "serial" });

test.describe("Notifications API", () => {
  let transactionId: string;
  let notificationId: string;
  let likeId: string;
  let commentId: string;

  test.beforeEach(async ({ request }) => {
    await seedDatabase(request);

    const users = await getTestData<User>(request, "users");
    await loginByApi(request, users[0].username);

    const transaction = await findTestData<Transaction>(request, "transactions", {});
    const notification = await findTestData<NotificationType>(request, "notifications", {});
    const like = await findTestData<Like>(request, "likes", {});
    const comment = await findTestData<Comment>(request, "comments", {});

    if (!transaction || !notification || !like || !comment) {
      throw new Error("Expected seeded transaction, notification, like, and comment");
    }

    transactionId = transaction.id;
    notificationId = notification.id;
    likeId = like.transactionId;
    commentId = comment.transactionId;
  });

  test("GET /notifications returns notifications for a user", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.listNotifications();
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.results.length).toBeGreaterThan(0);
  });

  test("POST /notifications/bulk creates transaction, like, and comment notifications", async ({
    request,
  }) => {
    const api = new ApiClient(request);
    const response = await api.createNotifications({
      items: [
        {
          type: "payment",
          transactionId,
          status: "received",
        },
        {
          type: "like",
          transactionId,
          likeId,
        },
        {
          type: "comment",
          transactionId,
          commentId,
        },
      ],
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.results).toHaveLength(3);
    expect(body.results[0].transactionId).toBe(transactionId);
  });

  test("PATCH /notifications/:notificationId updates a notification", async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.updateNotification(notificationId, { isRead: true });

    expect(response.status()).toBe(204);
  });

  test("PATCH /notifications/:notificationId returns validation error for invalid field", async ({
    request,
  }) => {
    const api = new ApiClient(request);
    const response = await api.updateNotification(notificationId, {
      notANotificationField: "not a notification field",
    });
    const body = await response.json();

    expect(response.status()).toBe(422);
    expect(body.errors).toHaveLength(1);
  });
});
