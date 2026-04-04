import { expect } from "@playwright/test";
import { credentials } from "./env.js";

async function resetClientAuth(page) {
  await page.goto("/login");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.context().clearCookies();
  await page.reload();
}

export async function loginAs(page, role) {
  const account = credentials[role];

  if (!account) {
    throw new Error(`Unknown E2E role: ${role}`);
  }

  await resetClientAuth(page);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  await page.getByTestId("login-email").or(page.getByLabel("Email")).fill(account.email);
  await page.getByTestId("login-password").or(page.getByLabel("Password")).fill(account.password);
  await page.getByTestId("login-email-submit").or(page.getByRole("button", { name: "Sign in with email" })).click();

  await page.waitForURL((url) => !url.pathname.startsWith("/login") && !url.pathname.startsWith("/auth/callback"), {
    timeout: 30_000,
  });

  await expect(page).toHaveURL(/\/sales(?:\/.*)?$/);
  await expect(page.getByRole("heading", { name: /Transactions|Sales Detail|Reports|Admin|Deleted Items/ })).toBeVisible();
}

export async function logout(page) {
  await resetClientAuth(page);
  await expect(page.getByRole("heading", { name: /Welcome back|Sign up/i })).toBeVisible();
}
