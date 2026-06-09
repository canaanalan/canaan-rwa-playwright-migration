import type { APIRequestContext } from "@playwright/test";

import { API_URL } from "./testData";

export const defaultPassword =
  process.env.SEED_DEFAULT_USER_PASSWORD ?? "s3cret";

/** Logs in through the API and keeps the session cookie on the request context. */
export async function loginByApi(
  request: APIRequestContext,
  username: string,
  password: string = defaultPassword
) {
  const response = await request.post(`${API_URL}/login`, {
    data: { username, password },
  });
  return response;
}
