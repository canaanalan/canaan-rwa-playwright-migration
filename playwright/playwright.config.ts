import { defineConfig, devices } from "@playwright/test";

// Use 127.0.0.1 — Node fetch often prefers IPv6 (::1) for "localhost", but the API may only listen on IPv4.
const API_URL = process.env.API_URL ?? "http://127.0.0.1:3001";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ["list"],
        ["json", { outputFile: "test-results/results.json" }],
        ["./reporters/reliabilityReporter.ts"],
      ]
    : [["list"], ["./reporters/reliabilityReporter.ts"]],
  use: {
    baseURL: APP_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "api",
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: API_URL,
      },
    },
    {
      name: "ui",
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  webServer: [
    {
      // Avoid nyc instrumentation here; it crashes in newer Node versions before tests start.
      command:
        "corepack yarn db:seed:dev && NODE_ENV=development corepack yarn tsnode:not-instrumented --files backend/app.ts",
      cwd: "..",
      url: `${API_URL}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "NODE_ENV=development corepack yarn start:react",
      cwd: "..",
      url: APP_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
