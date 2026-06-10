import type { APIRequestContext } from "@playwright/test";

import { API_URL } from "../testData";

export class BankAccountsApi {
  private readonly path = `${API_URL}/bankAccounts`;

  constructor(private readonly request: APIRequestContext) {}

  list() {
    return this.request.get(this.path);
  }

  get(id: string) {
    return this.request.get(`${this.path}/${id}`);
  }

  create(body: { bankName: string; accountNumber: string; routingNumber: string }) {
    return this.request.post(this.path, { data: body });
  }

  delete(id: string) {
    return this.request.delete(`${this.path}/${id}`);
  }
}
