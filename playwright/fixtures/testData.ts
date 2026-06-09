import type { APIRequestContext } from "@playwright/test";

export const API_URL = process.env.API_URL ?? "http://127.0.0.1:3001";

/** Resets the local lowdb database to a known seed state. */
export async function seedDatabase(request: APIRequestContext): Promise<void> {
  const response = await request.post(`${API_URL}/testData/seed`);
  if (!response.ok()) {
    throw new Error(`seed failed: ${response.status()} ${await response.text()}`);
  }
}

/** Reads seeded lowdb data by collection and optional query. */
export async function getTestData<T>(
  request: APIRequestContext,
  entity: string
): Promise<T[]> {
  const response = await request.get(`${API_URL}/testData/${entity}`);
  if (!response.ok()) {
    throw new Error(`testData/${entity} failed: ${response.status()}`);
  }
  const body = (await response.json()) as { results: T[] };
  return body.results;
}

export async function findTestData<T>(
  request: APIRequestContext,
  entity: string,
  attrs: Partial<T>
): Promise<T | undefined> {
  const results = await getTestData<T>(request, entity);
  return results.find((row) =>
    Object.entries(attrs).every(([key, value]) => (row as Record<string, unknown>)[key] === value)
  );
}
