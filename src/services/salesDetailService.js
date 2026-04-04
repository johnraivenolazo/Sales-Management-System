import { supabase } from "../lib/supabaseClient.js";

const salesDetailSelectClause =
  "transNo, prodCode, quantity, record_status, stamp";

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

function cleanStamp(stamp) {
  const nextStamp = stamp?.trim();
  return nextStamp ? nextStamp : null;
}

function cleanDetailPayload({ prodCode, quantity }) {
  return {
    prodCode: prodCode?.trim(),
    quantity,
  };
}

export async function getDetailByTrans(transNo, userType) {
  const client = requireSupabase();
  let query = client
    .from("salesDetail")
    .select(salesDetailSelectClause)
    .eq("transNo", transNo)
    .order("prodCode", { ascending: true });

  if (normalizeUserType(userType) === "USER") {
    query = query.eq("record_status", "ACTIVE");
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function addDetailLine(payload) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("salesDetail")
    .insert({
      transNo: payload.transNo,
      ...cleanDetailPayload(payload),
    })
    .select(salesDetailSelectClause)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateDetailLine(
  transNo,
  currentProdCode,
  payload,
) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("salesDetail")
    .update(cleanDetailPayload(payload))
    .eq("transNo", transNo)
    .eq("prodCode", currentProdCode)
    .select(salesDetailSelectClause)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function softDeleteDetailLine(
  transNo,
  prodCode,
  stamp = "INACTIVE",
) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("salesDetail")
    .update({
      record_status: "INACTIVE",
      stamp: cleanStamp(stamp) ?? "INACTIVE",
    })
    .eq("transNo", transNo)
    .eq("prodCode", prodCode)
    .select(salesDetailSelectClause)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function recoverDetailLine(
  transNo,
  prodCode,
  stamp = "RECOVERED",
) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("salesDetail")
    .update({
      record_status: "ACTIVE",
      stamp: cleanStamp(stamp) ?? "RECOVERED",
    })
    .eq("transNo", transNo)
    .eq("prodCode", prodCode)
    .select(salesDetailSelectClause)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
