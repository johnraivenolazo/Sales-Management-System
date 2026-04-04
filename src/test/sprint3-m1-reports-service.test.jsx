import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMonthlySalesTrend,
  getSalesByCustomer,
  getSalesByEmployee,
  getTopProducts,
} from "../services/reportsService.js";

const mockSupabaseState = vi.hoisted(() => ({
  supabase: null,
}));

vi.mock("../lib/supabaseClient.js", () => ({
  get supabase() {
    return mockSupabaseState.supabase;
  },
}));

function createOrderedSelectResult(data) {
  return {
    order: vi.fn().mockReturnThis(),
    then: (onFulfilled, onRejected) =>
      Promise.resolve({ data, error: null }).then(onFulfilled, onRejected),
  };
}

describe("Sprint 3 M1 reports service", () => {
  beforeEach(() => {
    mockSupabaseState.supabase = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    [
      "sales_by_employee",
      getSalesByEmployee,
      "empNo:empno, employeeName:employee_name, totalTransactions:total_transactions, totalQuantity:total_quantity, totalRevenue:total_revenue",
    ],
    [
      "sales_by_customer",
      getSalesByCustomer,
      "custNo:custno, customerName:custname, payterm, totalTransactions:total_transactions, totalQuantity:total_quantity, totalRevenue:total_revenue",
    ],
    [
      "top_products_sold",
      getTopProducts,
      "prodCode:prodcode, description, unit, totalTransactions:total_transactions, totalQuantity:total_quantity, totalRevenue:total_revenue",
    ],
    [
      "monthly_sales_trend",
      getMonthlySalesTrend,
      "saleMonth:sale_month, monthStart:month_start, totalTransactions:total_transactions, totalQuantity:total_quantity, totalRevenue:total_revenue",
    ],
  ])("loads %s report rows through the matching view", async (viewName, getter, selectClause) => {
    const orderedResult = createOrderedSelectResult([{ viewName }]);
    const select = vi.fn(() => orderedResult);

    mockSupabaseState.supabase = {
      from: vi.fn(() => ({
        select,
      })),
    };

    const result = await getter();

    expect(mockSupabaseState.supabase.from).toHaveBeenCalledWith(viewName);
    expect(select).toHaveBeenCalledWith(selectClause);
    expect(result).toEqual([{ viewName }]);
  });
});
