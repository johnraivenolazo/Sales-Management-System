const MAX_LOG_ENTRIES = 200;

function getAuthDebugStore() {
  if (typeof window === "undefined") {
    return null;
  }

  const currentEntries = Array.isArray(window.__smsAuthDebug)
    ? window.__smsAuthDebug
    : [];

  window.__smsAuthDebug = currentEntries;
  return currentEntries;
}

function sanitizeValue(value) {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        sanitizeValue(entryValue),
      ]),
    );
  }

  return value;
}

export function logAuthDebug(event, payload = {}) {
  const entry = {
    at: new Date().toISOString(),
    event,
    payload: sanitizeValue(payload),
  };

  const store = getAuthDebugStore();

  if (store) {
    store.push(entry);

    if (store.length > MAX_LOG_ENTRIES) {
      store.splice(0, store.length - MAX_LOG_ENTRIES);
    }
  }

  console.log(`[AuthDebug] ${event}`, entry.payload);
}

