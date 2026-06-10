import type { APIRequestContext } from "@playwright/test";

import { API_URL } from "../testData";

type QueryParams = Record<string, string | number | boolean>;

export class TransactionsApi {
  private readonly path = `${API_URL}/transactions`;

  constructor(private readonly request: APIRequestContext) {}

  list(params?: QueryParams) {
    return this.request.get(this.path, { params });
  }

  listContacts(params?: QueryParams) {
    return this.request.get(`${this.path}/contacts`, { params });
  }

  listPublic(params?: QueryParams) {
    return this.request.get(`${this.path}/public`, { params });
  }

  create(body: Record<string, unknown>) {
    return this.request.post(this.path, { data: body });
  }

  update(transactionId: string, body: Record<string, unknown>) {
    return this.request.patch(`${this.path}/${transactionId}`, { data: body });
  }
}
