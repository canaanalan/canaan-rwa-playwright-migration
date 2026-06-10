import type { APIRequestContext } from "@playwright/test";

import { API_URL } from "../testData";

export class ContactsApi {
  private readonly path = `${API_URL}/contacts`;

  constructor(private readonly request: APIRequestContext) {}

  list(username: string) {
    return this.request.get(`${this.path}/${username}`);
  }

  create(body: { contactUserId: string }) {
    return this.request.post(this.path, { data: body });
  }

  delete(contactId: string) {
    return this.request.delete(`${this.path}/${contactId}`);
  }
}
