import fs from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const envProcess = globalThis.process;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!(key in envProcess.env)) {
      envProcess.env[key] = value;
    }
  }
}

const rootDir = path.resolve(".");
loadEnvFile(path.join(rootDir, ".env.local"));
loadEnvFile(path.join(rootDir, ".env.e2e.local"));

const baseURL = envProcess.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173";
const usesLocalServer = /127\.0\.0\.1|localhost/.test(baseURL);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(envProcess.env.CI),
  retries: envProcess.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1440, height: 1100 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: usesLocalServer
    ? {
        command: "pnpm vite --host 127.0.0.1 --port 4173",
        url: baseURL,
        reuseExistingServer: !envProcess.env.CI,
        timeout: 120_000,
      }
    : undefined,
});
