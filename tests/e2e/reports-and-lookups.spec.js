import { expect, test } from "@playwright/test";
import { loginAs, logout } from "./utils/auth.js";

const reportCases = [
  { path: "/reports/employees", tab: "By Employee", panelTitle: "Employee revenue leaderboard" },
  { path: "/reports/customers", tab: "By Customer", panelTitle: "Customer account ranking" },
  { path: "/reports/products", tab: "Top Products", panelTitle: "Top products sold" },
  { path: "/reports/monthly", tab: "Monthly Trend", panelTitle: "Monthly sales trend" },
];

const lookupCases = [
  { path: "/lookups/customers", heading: "Customers" },
  { path: "/lookups/employees", heading: "Employees" },
  { path: "/lookups/products", heading: "Product and current-price directory" },
  { path: "/lookups/prices", heading: "Price history ledger" },
];

test.describe("Sprint 3 M5 reports and lookup coverage", () => {
  test("USER can open all report views", async ({ page }) => {
    await loginAs(page, "user");

    for (const reportCase of reportCases) {
      await page.goto(reportCase.path);
      await expect(page.getByRole("link", { name: reportCase.tab })).toBeVisible();
      await expect(page.getByText(reportCase.panelTitle, { exact: true })).toBeVisible();
    }

    await logout(page);
  });

  test("lookup pages stay read-only for USER", async ({ page }) => {
    await loginAs(page, "user");

    for (const lookupCase of lookupCases) {
      await page.goto(lookupCase.path);
      await expect(page.getByRole("heading", { name: lookupCase.heading })).toBeVisible();
      await expect(page.getByRole("button", { name: /Add|Create|Edit|Delete|Recover/i })).toHaveCount(0);
      await expect(page.getByRole("link", { name: /Add|Create|Edit|Delete|Recover/i })).toHaveCount(0);
    }

    await logout(page);
  });
});
