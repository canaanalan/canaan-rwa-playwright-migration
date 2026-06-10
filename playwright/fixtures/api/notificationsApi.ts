import type { APIRequestContext } from "@playwright/test";

import { API_URL } from "../testData";

export class NotificationsApi {
  private readonly path = `${API_URL}/notifications`;

  constructor(private readonly request: APIRequestContext) {}

  list() {
    return this.request.get(this.path);
  }

  createBulk(body: { items: Record<string, unknown>[] }) {
    return this.request.post(`${this.path}/bulk`, { data: body });
  }

  update(notificationId: string, body: Record<string, unknown>) {
    return this.request.patch(`${this.path}/${notificationId}`, { data: body });
  }
}
