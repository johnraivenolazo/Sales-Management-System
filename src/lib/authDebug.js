const STORAGE_KEY = "hope_sms_auth_debug_log";
const MAX_ENTRIES = 50;

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

function normalizeError(error) {
  if (!error) {
    return null;
  }

  return {
    name: error.name,
    message: error.message,
    status: error.status,
    code: error.code,
    details: error.details,
    hint: error.hint,
    cause:
      typeof error.cause === "object" && error.cause !== null
        ? String(error.cause)
        : error.cause,
  };
}

function serializePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  return JSON.parse(
    JSON.stringify(payload, (_, value) => {
      if (value instanceof Error) {
        return normalizeError(value);
      }

      return value;
    }),
  );
}

export function clearAuthDebugLog() {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function getAuthDebugLog() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawValue = window.sessionStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : [];
  } catch {
    return [];
  }
}

export function logAuthDebug(event, payload = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    payload: serializePayload(payload),
  };

  console.info(`[AuthDebug] ${event}`, entry.payload);

  if (!canUseStorage()) {
    return entry;
  }

  const nextEntries = [...getAuthDebugLog(), entry].slice(-MAX_ENTRIES);
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));

  return entry;
}

export function logAuthDebugError(event, error, payload = {}) {
  return logAuthDebug(event, {
    ...payload,
    error: normalizeError(error),
  });
}
