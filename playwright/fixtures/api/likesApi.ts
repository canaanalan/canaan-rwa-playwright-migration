import type { APIRequestContext } from "@playwright/test";

import { API_URL } from "../testData";

export class LikesApi {
  private readonly path = `${API_URL}/likes`;

  constructor(private readonly request: APIRequestContext) {}

  list(transactionId: string) {
    return this.request.get(`${this.path}/${transactionId}`);
  }

  create(transactionId: string, body: { transactionId: string }) {
    return this.request.post(`${this.path}/${transactionId}`, { data: body });
  }
}
