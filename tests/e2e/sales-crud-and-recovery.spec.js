import { expect, test } from "@playwright/test";
import { loginAs, logout } from "./utils/auth.js";
import {
  getDisabledInputValue,
  getSelectedOptionLabel,
  selectFirstRealOption,
} from "./utils/sales.js";

test.describe("Sprint 3 docs coverage: sales, detail, and recovery", () => {
  test("SUPERADMIN can run transaction and line-item lifecycle with recovery", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, "superadmin");

    await expect(page.getByRole("button", { name: "New transaction" })).toBeEnabled();
    await page.getByRole("button", { name: "New transaction" }).click();
    await expect(page.getByRole("heading", { name: "Create transaction" })).toBeVisible();

    const transactionNumber = await getDisabledInputValue(
      page.getByLabel("Transaction no").last(),
    );

    await page.getByLabel("Sales date").last().fill("2026-04-05");
    await selectFirstRealOption(page.getByLabel("Customer").last());
    await selectFirstRealOption(page.getByLabel("Employee").last());
    await page.getByRole("button", { name: "Create transaction" }).click();
    await expect(page.getByRole("button", { name: "New transaction" })).toBeVisible();

    await page.getByRole("searchbox", { name: "Search" }).fill(transactionNumber);
    await expect(page.locator("tbody tr").filter({ hasText: transactionNumber }).first()).toBeVisible();

    await page.goto(`/sales/${transactionNumber}`);
    await expect(page.getByRole("heading", { name: transactionNumber, exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add line item" })).toBeEnabled();

    await page.getByRole("button", { name: "Add line item" }).click();
    await expect(page.getByRole("heading", { name: "Add line item" })).toBeVisible();
    const productSelect = page.getByLabel("Product").last();
    const productCode = await selectFirstRealOption(productSelect);
    await getSelectedOptionLabel(productSelect);
    await page.getByLabel("Quantity").last().fill("2");
    await expect(page.getByText("Latest unit price")).toBeVisible();
    await page.locator("form").last().getByRole("button", { name: "Add line item", exact: true }).click();

    const detailRow = page.locator("tbody tr").filter({ hasText: productCode }).first();
    await expect(detailRow).toBeVisible();
    await detailRow.getByRole("button", { name: "Edit", exact: true }).click();
    await expect(page.getByRole("heading", { name: `Edit ${productCode}` })).toBeVisible();
    await page.getByLabel("Quantity").last().fill("3");
    await page.getByRole("button", { name: "Save line item" }).click();
    await expect(page.locator("tbody tr").filter({ hasText: productCode }).first()).toContainText("3");

    await page.goto("/sales");
    const transactionRow = page.locator("tbody tr").filter({ hasText: transactionNumber }).first();
    await expect(transactionRow).toBeVisible();
    await transactionRow.getByRole("button", { name: "Delete", exact: true }).click();
    await page.getByRole("button", { name: "Confirm change" }).click();
    const inactiveTransactionRow = page.locator("tbody tr").filter({ hasText: transactionNumber }).first();
    await expect(inactiveTransactionRow).toBeVisible();
    await expect(inactiveTransactionRow.getByText("INACTIVE", { exact: true })).toBeVisible();

    await logout(page);
    await loginAs(page, "user");
    await page.goto("/sales");
    await page.getByRole("searchbox", { name: "Search" }).fill(transactionNumber);
    await expect(page.locator("tbody tr").filter({ hasText: transactionNumber })).toHaveCount(0);

    await logout(page);
    await loginAs(page, "superadmin");
    await page.goto("/deleted-items");
    await expect(page.getByRole("heading", { name: "Recover inactive records" })).toBeVisible();
    const deletedTransactionCard = page.getByText(transactionNumber, { exact: true }).first();
    await expect(deletedTransactionCard).toBeVisible();
    const deletedTransactionArticle = page.locator("article").filter({ hasText: transactionNumber }).first();
    await deletedTransactionArticle.getByRole("button", { name: "Recover transaction" }).click();
    await expect(page.locator("article").filter({ hasText: transactionNumber })).toHaveCount(0);

    await page.goto("/sales");
    await page.getByRole("searchbox", { name: "Search" }).fill(transactionNumber);
    const recoveredTransactionRow = page.locator("tbody tr").filter({ hasText: transactionNumber }).first();
    await expect(recoveredTransactionRow).toBeVisible();
    await expect(recoveredTransactionRow.getByText("ACTIVE", { exact: true })).toBeVisible();

    await page.goto(`/sales/${transactionNumber}`);
    await expect(page.getByRole("heading", { name: transactionNumber, exact: true })).toBeVisible();
    await expect(page.locator("tbody tr").filter({ hasText: productCode }).first()).toBeVisible();

    await page.locator("tbody tr").filter({ hasText: productCode }).first()
      .getByRole("button", { name: "Delete", exact: true }).click();
    await page.getByRole("button", { name: "Confirm change" }).click();
    const inactiveDetailRow = page.locator("tbody tr").filter({ hasText: productCode }).first();
    await expect(inactiveDetailRow).toBeVisible();
    await expect(inactiveDetailRow.getByText("INACTIVE", { exact: true })).toBeVisible();

    await logout(page);
    await loginAs(page, "user");
    await page.goto("/sales");
    await page.getByRole("searchbox", { name: "Search" }).fill(transactionNumber);
    const userTransactionRow = page.locator("tbody tr").filter({ hasText: transactionNumber }).first();
    await expect(userTransactionRow).toBeVisible();
    await userTransactionRow.getByRole("link", { name: "View" }).click();
    await expect(page.getByRole("heading", { name: transactionNumber, exact: true })).toBeVisible();
    await expect(page.locator("tbody tr").filter({ hasText: productCode })).toHaveCount(0);

    await logout(page);
    await loginAs(page, "superadmin");
    await page.goto("/deleted-items");
    await page.getByRole("button", { name: "Line items" }).click();
    const deletedLineItemArticle = page.locator("article").filter({ hasText: `${transactionNumber}` }).first();
    await deletedLineItemArticle.getByRole("button", { name: "Recover line item" }).click();
    await expect(page.locator("article").filter({ hasText: `${transactionNumber}` })).toHaveCount(0);

    await page.goto(`/sales/${transactionNumber}`);
    await expect(page.locator("tbody tr").filter({ hasText: productCode }).first()).toBeVisible();

    await logout(page);
  });
});
