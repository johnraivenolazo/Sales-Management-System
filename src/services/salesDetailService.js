import { supabase } from "../lib/supabaseClient.js";

const salesDetailSelectClause =
  "transNo:transno, prodCode:prodcode, quantity, record_status, stamp";

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
    prodcode: prodCode?.trim(),
    quantity,
  };
}

export async function getDetailByTrans(transNo, userType) {
  const client = requireSupabase();
  let query = client
    .from("salesdetail")
    .select(salesDetailSelectClause)
    .eq("transno", transNo)
    .order("prodcode", { ascending: true });

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
    .from("salesdetail")
    .insert({
      transno: payload.transNo,
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
    .from("salesdetail")
    .update(cleanDetailPayload(payload))
    .eq("transno", transNo)
    .eq("prodcode", currentProdCode)
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
    .from("salesdetail")
    .update({
      record_status: "INACTIVE",
      stamp: cleanStamp(stamp) ?? "INACTIVE",
    })
    .eq("transno", transNo)
    .eq("prodcode", prodCode)
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
    .from("salesdetail")
    .update({
      record_status: "ACTIVE",
      stamp: cleanStamp(stamp) ?? "RECOVERED",
    })
    .eq("transno", transNo)
    .eq("prodcode", prodCode)
    .select(salesDetailSelectClause)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
