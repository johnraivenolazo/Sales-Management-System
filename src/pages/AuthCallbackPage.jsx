import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { logAuthDebug } from "../lib/authDebug.js";

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { authError, currentUser, guardReason, isAuthLoading } = useAuth();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const providerError =
      hashParams.get("error_description") || hashParams.get("error");
    const providerErrorCode = hashParams.get("error_code");

    logAuthDebug("auth.callback.enter", {
      href: window.location.href,
      search: window.location.search,
      hash: window.location.hash,
      providerError,
      providerErrorCode,
      isAuthLoading,
      hasCurrentUser: Boolean(currentUser),
      guardReason,
      authError,
    });

    if (providerError) {
      logAuthDebug("auth.callback.providerError", {
        providerError,
        providerErrorCode,
      });
      navigate(
        `/login?error=oauth_failed&message=${encodeURIComponent(providerError)}`,
        { replace: true },
      );
      return;
    }

    if (isAuthLoading) {
      logAuthDebug("auth.callback.waitingForSession");
      return;
    }

    if (currentUser) {
      logAuthDebug("auth.callback.redirectSales", {
        currentUserId: currentUser.id,
        email: currentUser.email,
      });
      navigate("/sales", { replace: true });
      return;
    }

    if (guardReason === "not_activated") {
      logAuthDebug("auth.callback.redirectInactive");
      navigate("/login?error=not_activated", { replace: true });
      return;
    }

    if (authError) {
      logAuthDebug("auth.callback.redirectOauthFailed", {
        authError,
      });
      navigate("/login?error=oauth_failed", { replace: true });
      return;
    }

    logAuthDebug("auth.callback.redirectLogin");
    navigate("/login", { replace: true });
  }, [authError, currentUser, guardReason, isAuthLoading, navigate]);

  return (
    <main className="flex min-h-[65vh] items-center justify-center px-6 py-12">
      <section className="w-full max-w-2xl rounded-[2.5rem] border border-slate-900/5 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900/5">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
        </div>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-sky-900">
          Auth callback
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
          Finishing sign-in
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600">
          Please wait while the application completes the authentication
          handshake, checks your activation status, and redirects you to the
          correct page.
        </p>
        <div className="mt-8 rounded-3xl bg-[#f7f1e6] px-5 py-4 text-sm leading-6 text-slate-700">
          Google OAuth and email-confirmation redirects both land here before
          the login guard decides whether the user should continue to the app or
          return to login.
        </div>
      </section>
    </main>
  );
}

export default AuthCallbackPage;
