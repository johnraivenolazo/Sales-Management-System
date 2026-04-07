import { supabase } from "../lib/supabaseClient.js";

const adminUserSelectClause =
  "userId:userid, username, email, firstName:first_name, lastName:last_name, userType:user_type, recordStatus:record_status, stamp";
const adminUserRightsSelectClause =
  "rightCode:right_code, rightValue:right_value, recordStatus:record_status, stamp";

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

function normalizeRightCode(rightCode) {
  return rightCode?.trim();
}

function normalizeUserType(userType) {
  return String(userType ?? "").toUpperCase();
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

async function updateUserRole(userId, userType, fallbackStamp) {
  const client = requireSupabase();
  const targetUser = await readUserForAdmin(client, userId);
  const nextUserType = normalizeUserType(userType);

  if (String(targetUser.userType ?? "").toUpperCase() === "SUPERADMIN") {
    throw new Error("SUPERADMIN accounts cannot be modified.");
  }

  if (nextUserType !== "ADMIN" && nextUserType !== "USER") {
    throw new Error("User role must be ADMIN or USER.");
  }

  if (String(targetUser.userType ?? "").toUpperCase() === nextUserType) {
    return targetUser;
  }

  const { data, error } = await client
    .from("user")
    .update({
      user_type: nextUserType,
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

async function readUserRightsForAdmin(client, userId) {
  const targetUser = await readUserForAdmin(client, userId);

  const { data, error } = await client
    .from("user_module_rights")
    .select(adminUserRightsSelectClause)
    .eq("userid", targetUser.userId)
    .order("right_code", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

function buildUserRightsPayload(userId, rightsMap, fallbackStamp) {
  const normalizedUserId = normalizeUserId(userId);

  return Object.entries(rightsMap ?? {}).map(([rightCode, rightValue]) => ({
    userid: normalizedUserId,
    right_code: normalizeRightCode(rightCode),
    right_value: rightValue ? 1 : 0,
    record_status: "ACTIVE",
    stamp: cleanStamp(fallbackStamp) ?? fallbackStamp,
  }));
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

export async function saveUserRole(userId, userType, stamp = "ROLE UPDATED") {
  return updateUserRole(userId, userType, stamp);
}

export async function getUserRights(userId) {
  const client = requireSupabase();
  return readUserRightsForAdmin(client, userId);
}

export async function saveUserRights(userId, rightsMap, stamp = "RIGHTS UPDATED") {
  const client = requireSupabase();
  const targetUser = await readUserForAdmin(client, userId);

  if (String(targetUser.userType ?? "").toUpperCase() === "SUPERADMIN") {
    throw new Error("SUPERADMIN accounts cannot be modified.");
  }

  const payload = buildUserRightsPayload(targetUser.userId, rightsMap, stamp);

  const { data, error } = await client
    .from("user_module_rights")
    .upsert(payload, { onConflict: "userid,right_code" })
    .select(adminUserRightsSelectClause);

  if (error) {
    throw error;
  }

  return data ?? [];
}
