import { expect, test } from "@playwright/test";
import { loginAs, logout } from "./utils/auth.js";

test.describe("Sprint 3 docs coverage: admin activation workflow", () => {
  test("ADMIN can deactivate and reactivate a USER account from User Management", async ({ page }) => {
    await loginAs(page, "admin");

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Manage users" })).toBeVisible();
    await page.getByPlaceholder("Name, email, or user ID").fill("user@gmail.com");

    const userRow = page.locator("tbody tr").filter({ hasText: "user@gmail.com" }).first();
    await expect(userRow).toBeVisible();
    await expect(userRow.getByText("ACTIVE", { exact: true })).toBeVisible();

    await userRow.getByRole("button", { name: "Deactivate", exact: true }).click();
    await expect(userRow.getByText("INACTIVE", { exact: true })).toBeVisible();
    await expect(userRow.getByRole("button", { name: "Activate", exact: true })).toBeEnabled();

    await userRow.getByRole("button", { name: "Activate", exact: true }).click();
    await expect(userRow.getByText("ACTIVE", { exact: true })).toBeVisible();

    await logout(page);
  });
});
