import { supabase } from "../lib/supabaseClient.js";

const adminUserSelectClause =
  "userId:userid, username, email, firstName:first_name, lastName:last_name, userType:user_type, recordStatus:record_status, stamp";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.",
    );
  }

  return supabase;
}

function normalizeUserId(userId) {
  return userId?.trim();
}

function cleanStamp(stamp) {
  const nextStamp = stamp?.trim();
  return nextStamp ? nextStamp : null;
}

async function readUserForAdmin(client, userId) {
  const normalizedUserId = normalizeUserId(userId);

  if (!normalizedUserId) {
    throw new Error("A user ID is required for the admin workflow.");
  }

  const { data, error } = await client
    .from("user")
    .select(adminUserSelectClause)
    .eq("userid", normalizedUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(`User ${normalizedUserId} was not found.`);
  }

  return data;
}

async function updateUserStatus(userId, recordStatus, fallbackStamp) {
  const client = requireSupabase();
  const targetUser = await readUserForAdmin(client, userId);

  if (String(targetUser.userType ?? "").toUpperCase() === "SUPERADMIN") {
    throw new Error("SUPERADMIN accounts cannot be modified.");
  }

  const { data, error } = await client
    .from("user")
    .update({
      record_status: recordStatus,
      stamp: cleanStamp(fallbackStamp) ?? fallbackStamp,
    })
    .eq("userid", targetUser.userId)
    .select(adminUserSelectClause)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUsers() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("user")
    .select(adminUserSelectClause)
    .order("user_type", { ascending: true })
    .order("username", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function activateUser(userId, stamp = "ACTIVATED") {
  return updateUserStatus(userId, "ACTIVE", stamp);
}

export async function deactivateUser(userId, stamp = "DEACTIVATED") {
  return updateUserStatus(userId, "INACTIVE", stamp);
}
