import { supabase } from "../lib/supabaseClient.js";

const customerSelectClause = "custno, custname, address, payterm";
const employeeSelectClause =
  "empno, lastname, firstname, gender, birthdate, hiredate, sepDate:sepdate";
const productSelectClause = "prodCode:prodcode, description, unit";
const priceHistorySelectClause = "prodCode:prodcode, effDate:effdate, unitPrice:unitprice";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.",
    );
  }

  return supabase;
}

function normalizeProductCode(prodCode) {
  return prodCode?.trim();
}

export async function getCustomers() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("customer")
    .select(customerSelectClause)
    .order("custname", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getEmployees() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("employee")
    .select(employeeSelectClause)
    .order("lastname", { ascending: true })
    .order("firstname", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getProducts() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("product")
    .select(productSelectClause)
    .order("prodcode", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getPriceHistory(prodCode) {
  const client = requireSupabase();
  const normalizedProdCode = normalizeProductCode(prodCode);
  let query = client
    .from("pricehist")
    .select(priceHistorySelectClause)
    .order("effdate", { ascending: false });

  if (normalizedProdCode) {
    query = query.eq("prodcode", normalizedProdCode);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getCurrentPrice(prodCode) {
  const client = requireSupabase();
  const normalizedProdCode = normalizeProductCode(prodCode);

  if (!normalizedProdCode) {
    throw new Error("A product code is required to load the current price.");
  }

  const { data, error } = await client
    .from("pricehist")
    .select(priceHistorySelectClause)
    .eq("prodcode", normalizedProdCode)
    .order("effdate", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
