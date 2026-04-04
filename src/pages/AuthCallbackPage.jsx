import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import PageLoadingState from "../components/PageLoadingState.jsx";

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { authError, currentUser, guardReason, isAuthLoading } = useAuth();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const providerError =
      hashParams.get("error_description") || hashParams.get("error");

    if (providerError) {
      navigate(
        `/login?error=oauth_failed&message=${encodeURIComponent(providerError)}`,
        { replace: true },
      );
      return;
    }

    if (isAuthLoading) {
      return;
    }

    if (currentUser) {
      navigate("/sales", { replace: true });
      return;
    }

    if (guardReason === "not_activated") {
      navigate("/login?error=not_activated", { replace: true });
      return;
    }

    if (authError) {
      navigate("/login?error=oauth_failed", { replace: true });
      return;
    }

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
