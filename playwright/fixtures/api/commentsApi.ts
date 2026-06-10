import type { APIRequestContext } from "@playwright/test";

import { API_URL } from "../testData";

export class CommentsApi {
  private readonly path = `${API_URL}/comments`;

  constructor(private readonly request: APIRequestContext) {}

  list(transactionId: string) {
    return this.request.get(`${this.path}/${transactionId}`);
  }

  create(transactionId: string, body: { content: string }) {
    return this.request.post(`${this.path}/${transactionId}`, { data: body });
  }
}
