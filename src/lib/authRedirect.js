const AUTH_REDIRECT_KEY = "sms_auth_redirect";
const FALLBACK_REDIRECT = "/sales";
const disallowedPaths = new Set(["/login", "/register", "/auth/callback"]);

function buildTarget(pathname, search = "", hash = "") {
  if (!pathname || disallowedPaths.has(pathname) || !pathname.startsWith("/")) {
    return FALLBACK_REDIRECT;
  }

  return `${pathname}${search}${hash}`;
}

export function getSafeAuthRedirectTarget(locationLike) {
  if (!locationLike) {
    return FALLBACK_REDIRECT;
  }

  if (typeof locationLike === "string") {
    return buildTarget(locationLike);
  }

  return buildTarget(
    locationLike.pathname,
    locationLike.search ?? "",
    locationLike.hash ?? "",
  );
}

export function storeAuthRedirectTarget(locationLike) {
  if (typeof window === "undefined") {
    return;
  }

  const target = getSafeAuthRedirectTarget(locationLike);
  window.sessionStorage.setItem(AUTH_REDIRECT_KEY, target);
}

export function consumeAuthRedirectTarget() {
  if (typeof window === "undefined") {
    return FALLBACK_REDIRECT;
  }

  const storedTarget = window.sessionStorage.getItem(AUTH_REDIRECT_KEY);

  if (storedTarget) {
    window.sessionStorage.removeItem(AUTH_REDIRECT_KEY);
  }

  return getSafeAuthRedirectTarget(storedTarget);
}
