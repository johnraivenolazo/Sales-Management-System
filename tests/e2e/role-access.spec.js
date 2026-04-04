import { expect, test } from "@playwright/test";
import { loginAs, logout } from "./utils/auth.js";

test.describe("Sprint 3 M5 role access", () => {
  test("USER can use sales and reports but is blocked from admin and deleted items", async ({ page }) => {
    await loginAs(page, "user");

    await expect(page.getByRole("link", { name: "Transactions" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Reports" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Deleted Items" })).toHaveCount(0);

    await page.goto("/sales/TR000001");
    await expect(page).toHaveURL(/\/sales\/TR000001$/);
    await expect(page.getByRole("heading", { name: "Sales Detail", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "TR000001", exact: true })).toBeVisible();

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/sales$/);
    await expect(page.getByRole("heading", { name: "Transactions", exact: true }).first()).toBeVisible();

    await page.goto("/deleted-items");
    await expect(page).toHaveURL(/\/sales$/);
    await expect(page.getByRole("heading", { name: "Transactions", exact: true }).first()).toBeVisible();

    await logout(page);
  });

  test("ADMIN can access admin and deleted items", async ({ page }) => {
    await loginAs(page, "admin");

    await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Deleted Items" })).toBeVisible();

    await page.getByRole("link", { name: "Admin" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Manage users" })).toBeVisible();

    await page.goto("/deleted-items");
    await expect(page.getByRole("heading", { name: "Recover inactive records" })).toBeVisible();

    await logout(page);
  });

  test("SUPERADMIN can access admin and deleted items", async ({ page }) => {
    await loginAs(page, "superadmin");

    await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Deleted Items" })).toBeVisible();

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Manage users" })).toBeVisible();

    await page.goto("/deleted-items");
    await expect(page.getByRole("heading", { name: "Recover inactive records" })).toBeVisible();

    await logout(page);
  });
});
