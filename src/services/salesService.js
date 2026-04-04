import { supabase } from "../lib/supabaseClient.js";

const salesSelectClause =
  "transNo:transno, salesDate:salesdate, custNo:custno, empNo:empno, record_status, stamp";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.",
    );
  }

  return supabase;
}

function normalizeUserType(userType) {
  return String(userType ?? "").trim().toUpperCase();
}

function cleanSalePayload({ transNo, salesDate, custNo, empNo }) {
  const payload = {
    salesdate: salesDate,
    custno: custNo?.trim() || null,
    empno: empNo?.trim() || null,
  };

  if (transNo?.trim()) {
    payload.transno = transNo.trim();
  }

  return payload;
}

function cleanStamp(stamp) {
  const nextStamp = stamp?.trim();
  return nextStamp ? nextStamp : null;
}

export async function getSales(userType) {
  const client = requireSupabase();
  let query = client
    .from("sales")
    .select(salesSelectClause)
    .order("salesdate", { ascending: false })
    .order("transno", { ascending: false });

  if (normalizeUserType(userType) === "USER") {
    query = query.eq("record_status", "ACTIVE");
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createSale(payload) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("sales")
    .insert(cleanSalePayload(payload))
    .select(salesSelectClause)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateSale(transNo, payload) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("sales")
    .update(cleanSalePayload(payload))
    .eq("transno", transNo)
    .select(salesSelectClause)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function softDeleteSale(transNo, stamp = "INACTIVE") {
  const client = requireSupabase();
  const { data, error } = await client
    .from("sales")
    .update({
      record_status: "INACTIVE",
      stamp: cleanStamp(stamp) ?? "INACTIVE",
    })
    .eq("transno", transNo)
    .select(salesSelectClause)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function recoverSale(transNo, stamp = "RECOVERED") {
  const client = requireSupabase();
  const { data, error } = await client
    .from("sales")
    .update({
      record_status: "ACTIVE",
      stamp: cleanStamp(stamp) ?? "RECOVERED",
    })
    .eq("transno", transNo)
    .select(salesSelectClause)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
