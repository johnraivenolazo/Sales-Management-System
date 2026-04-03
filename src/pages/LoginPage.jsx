import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { getAuthDebugLog, logAuthDebug } from "../lib/authDebug.js";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {
    authError,
    currentUser,
    guardReason,
    isAuthLoading,
    isSupabaseConfigured,
    setAuthError,
    signInWithEmail,
    signInWithGoogle,
  } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (currentUser) {
      const redirectTarget = location.state?.from?.pathname || "/sales";
      logAuthDebug("login.redirectAuthenticatedUser", {
        redirectTarget,
        currentUserId: currentUser.id,
        email: currentUser.email,
      });
      navigate(redirectTarget, { replace: true });
    }
  }, [currentUser, location.state, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSuccessMessage("");
    setAuthError("");
  }

  function validate() {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    const { data, error } = await signInWithEmail({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (error) {
      setAuthError(error.message);
      setIsSubmitting(false);
      return;
    }

    if (data?.session) {
      setSuccessMessage("Login successful. Preparing your session...");
    }

    setIsSubmitting(false);
  }

  async function handleGoogleSignIn() {
    setAuthError("");
    setSuccessMessage("");
    setIsGoogleSubmitting(true);

    const { error } = await signInWithGoogle();

    if (error) {
      setAuthError(error.message);
      setIsGoogleSubmitting(false);
      return;
    }

    setSuccessMessage("Redirecting to Google sign-in...");
    setIsGoogleSubmitting(false);
  }

  const callbackMessage = searchParams.get("message");
  const queryError = searchParams.get("error");
  const latestDebugEntry = getAuthDebugLog().at(-1);

  const loginError =
    queryError === "oauth_failed" && callbackMessage
      ? callbackMessage
      : queryError === "oauth_failed"
        ? "Google sign-in could not be completed. Please try again."
        : queryError === "not_activated" || guardReason === "not_activated"
      ? "Your account is pending activation by a Sales Manager."
      : authError;

  return (
    <main className="min-h-screen bg-[#f7f1e6] px-6 py-10 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2.5rem] bg-slate-900 px-8 py-10 text-white shadow-xl">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
            Hope, Inc.
          </span>
          <h1 className="mt-8 max-w-xl text-5xl font-black tracking-tight sm:text-6xl">
            Sign in to the Sales Management System.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/75">
            Use your email credentials or continue with Google. Validation is
            already in place so the upcoming auth wiring can connect to a real
            form instead of a placeholder.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                Ready now
              </p>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Email and password fields with inline validation and visible
                error feedback.
              </p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Next step
              </p>
              <p className="mt-3 text-sm leading-6 text-white/70">
                M4 can wire these actions to Supabase auth without reworking the
                layout or states.
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-slate-900/5 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-900">
                Login
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Welcome back
              </h2>
            </div>
            <Link
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              to="/sales"
            >
              View skeleton
            </Link>
          </div>

          <form className="mt-8 grid gap-5" noValidate onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                className={`rounded-2xl border px-4 py-3 text-base outline-none transition ${
                  errors.email
                    ? "border-red-400 bg-red-50"
                    : "border-slate-200 bg-slate-50 focus:border-slate-900"
                }`}
                name="email"
                placeholder="name@company.com"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email ? (
                <span className="text-sm font-medium text-red-600">
                  {errors.email}
                </span>
              ) : (
                <span className="text-sm text-slate-500">
                  Use the email connected to your Hope SMS access.
                </span>
              )}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Password
              </span>
              <input
                className={`rounded-2xl border px-4 py-3 text-base outline-none transition ${
                  errors.password
                    ? "border-red-400 bg-red-50"
                    : "border-slate-200 bg-slate-50 focus:border-slate-900"
                }`}
                name="password"
                placeholder="Minimum 8 characters"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password ? (
                <span className="text-sm font-medium text-red-600">
                  {errors.password}
                </span>
              ) : (
                <span className="text-sm text-slate-500">
                  Password validation is already ready for auth integration.
                </span>
              )}
            </label>

            {!isSupabaseConfigured ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                Supabase is not configured yet. Add your project URL and anon
                key before testing sign-in.
              </div>
            ) : null}

            {loginError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {loginError}
              </div>
            ) : null}

            {queryError === "oauth_failed" ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-600">
                Open the browser console and look for <span className="font-semibold">[AuthDebug]</span> entries.
                Latest event: <span className="font-semibold">{latestDebugEntry?.event ?? "none"}</span>
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                {successMessage}
              </div>
            ) : null}

            <button
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              disabled={isSubmitting || isAuthLoading}
              type="submit"
            >
              {isSubmitting ? "Signing in..." : "Sign in with email"}
            </button>

            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="h-px flex-1 bg-slate-200"></span>
              or
              <span className="h-px flex-1 bg-slate-200"></span>
            </div>

            <button
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isGoogleSubmitting || isAuthLoading || !isSupabaseConfigured}
              onClick={() => void handleGoogleSignIn()}
              type="button"
            >
              {isGoogleSubmitting ? "Redirecting..." : "Continue with Google"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
