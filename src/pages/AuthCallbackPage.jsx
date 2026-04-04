import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import PageLoadingState from "../components/PageLoadingState.jsx";
import { logAuthDebug } from "../lib/authDebug.js";

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { authError, currentUser, guardReason, isAuthLoading } = useAuth();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const providerError =
      hashParams.get("error_description") || hashParams.get("error");

    logAuthDebug("auth.callback.enter", {
      href: window.location.href,
      hash: window.location.hash,
      providerError,
      isAuthLoading,
      hasCurrentUser: Boolean(currentUser),
      guardReason,
      authError,
    });

    if (providerError) {
      logAuthDebug("auth.callback.redirect.providerError", { providerError });
      navigate(
        `/login?error=oauth_failed&message=${encodeURIComponent(providerError)}`,
        { replace: true },
      );
      return;
    }

    if (isAuthLoading) {
      logAuthDebug("auth.callback.waitingForSession", {});
      return;
    }

    if (currentUser) {
      logAuthDebug("auth.callback.redirect.sales", {
        currentUserId: currentUser.id ?? currentUser.userid ?? null,
      });
      navigate("/sales", { replace: true });
      return;
    }

    if (guardReason === "not_activated") {
      logAuthDebug("auth.callback.redirect.notActivated", {});
      navigate("/login?error=not_activated", { replace: true });
      return;
    }

    if (authError) {
      logAuthDebug("auth.callback.redirect.oauthFailed", { authError });
      navigate("/login?error=oauth_failed", { replace: true });
      return;
    }

    logAuthDebug("auth.callback.redirect.login", {});
    navigate("/login", { replace: true });
  }, [authError, currentUser, guardReason, isAuthLoading, navigate]);

  return (
    <PageLoadingState
      compact
      description="Please wait while the application completes the authentication handshake, checks your activation status, and redirects you to the correct page."
      eyebrow="Auth callback"
      title="Finishing sign-in"
    />
  );
}

export default AuthCallbackPage;
