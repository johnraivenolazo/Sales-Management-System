import { supabase } from "../lib/supabaseClient.js";

const salesByEmployeeSelectClause =
  "empNo:empno, employeeName:employee_name, totalTransactions:total_transactions, totalQuantity:total_quantity, totalRevenue:total_revenue";
const salesByCustomerSelectClause =
  "custNo:custno, customerName:custname, payterm, totalTransactions:total_transactions, totalQuantity:total_quantity, totalRevenue:total_revenue";
const topProductsSelectClause =
  "prodCode:prodcode, description, unit, totalTransactions:total_transactions, totalQuantity:total_quantity, totalRevenue:total_revenue";
const monthlySalesTrendSelectClause =
  "saleMonth:sale_month, monthStart:month_start, totalTransactions:total_transactions, totalQuantity:total_quantity, totalRevenue:total_revenue";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.",
    );
  }

  return supabase;
}

async function readReportRows(viewName, selectClause, buildQuery) {
  const client = requireSupabase();
  let query = client.from(viewName).select(selectClause);

  if (buildQuery) {
    query = buildQuery(query);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getSalesByEmployee() {
  return readReportRows("sales_by_employee", salesByEmployeeSelectClause, (query) =>
    query
      .order("total_revenue", { ascending: false })
      .order("employee_name", { ascending: true }));
}

export async function getSalesByCustomer() {
  return readReportRows("sales_by_customer", salesByCustomerSelectClause, (query) =>
    query
      .order("total_revenue", { ascending: false })
      .order("custname", { ascending: true }));
}

export async function getTopProducts() {
  return readReportRows("top_products_sold", topProductsSelectClause, (query) =>
    query
      .order("total_quantity", { ascending: false })
      .order("description", { ascending: true }));
}

export async function getMonthlySalesTrend() {
  return readReportRows(
    "monthly_sales_trend",
    monthlySalesTrendSelectClause,
    (query) => query.order("month_start", { ascending: true }),
  );
}
