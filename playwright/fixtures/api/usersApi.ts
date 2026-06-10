import type { APIRequestContext } from "@playwright/test";

import { API_URL } from "../testData";

export class UsersApi {
  private readonly path = `${API_URL}/users`;

  constructor(private readonly request: APIRequestContext) {}

  list() {
    return this.request.get(this.path);
  }

  get(userId: string) {
    return this.request.get(`${this.path}/${userId}`);
  }

  getProfile(username: string) {
    return this.request.get(`${this.path}/profile/${username}`);
  }

  search(query: string) {
    return this.request.get(`${this.path}/search`, { params: { q: query } });
  }

  create(body: Record<string, unknown>) {
    return this.request.post(this.path, { data: body });
  }

  update(userId: string, body: Record<string, unknown>) {
    return this.request.patch(`${this.path}/${userId}`, { data: body });
  }
}
