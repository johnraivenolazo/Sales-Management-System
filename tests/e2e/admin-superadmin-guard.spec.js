import { expect, test } from "@playwright/test";
import { loginAs, logout } from "./utils/auth.js";

test.describe("Sprint 3 M5 admin safeguards", () => {
  test("SUPERADMIN row stays locked in Admin user management", async ({ page }) => {
    await loginAs(page, "admin");

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Manage users" })).toBeVisible();

    const superadminRow = page.locator("tbody tr").filter({ hasText: "adminsuper@gmail.com" }).first();
    await expect(superadminRow).toBeVisible();
    await expect(superadminRow.getByRole("button", { name: "Activate", exact: true })).toBeDisabled();
    await expect(superadminRow.getByRole("button", { name: "Deactivate", exact: true })).toBeDisabled();
    await expect(superadminRow.getByText(/Locked/i)).toBeVisible();

    await logout(page);
  });
});
