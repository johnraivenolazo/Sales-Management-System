import { supabase } from "../lib/supabaseClient.js";

const oldTransactionHistorySelectClause =
  "transNo:transno, salesDate:salesdate, custNo:custno, customerName:custname, empNo:empno, employeeName:employee_name, prodCode:prodcode, description, unit, quantity, unitPrice:unitprice_snapshot, lineTotal:line_total";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.",
    );
  }

  return supabase;
}

export async function getOldTransactionHistory() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("old_transaction_history")
    .select(oldTransactionHistorySelectClause)
    .order("salesdate", { ascending: true })
    .order("transno", { ascending: true })
    .order("prodcode", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}