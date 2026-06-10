import type { APIRequestContext } from "@playwright/test";

import { API_URL } from "../testData";

export class BankTransfersApi {
  private readonly path = `${API_URL}/bankTransfers`;

  constructor(private readonly request: APIRequestContext) {}

  list() {
    return this.request.get(this.path);
  }
}
