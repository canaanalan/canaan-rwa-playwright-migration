import type { APIRequestContext } from "@playwright/test";

import { API_URL } from "../testData";

export class HealthApi {
  private readonly path = `${API_URL}/health`;

  constructor(private readonly request: APIRequestContext) {}

  get() {
    return this.request.get(this.path);
  }
}
