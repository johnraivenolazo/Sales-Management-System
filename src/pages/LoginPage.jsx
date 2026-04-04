import { motion as Motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx";
import BrandMark from "@/components/BrandMark.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Separator } from "@/components/ui/separator.jsx";
import { useAuth } from "../hooks/useAuth.js";
import {
  consumeAuthRedirectTarget,
  getSafeAuthRedirectTarget,
  storeAuthRedirectTarget,
} from "../lib/authRedirect.js";
import { fadeUp, scaleIn, staggerContainer } from "../lib/motion.js";

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
      const redirectTarget = location.state?.from
        ? getSafeAuthRedirectTarget(location.state.from)
        : consumeAuthRedirectTarget();
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
    storeAuthRedirectTarget(location.state?.from);

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
    storeAuthRedirectTarget(location.state?.from);

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

  const loginError =
    queryError === "oauth_failed" && callbackMessage
      ? callbackMessage
      : queryError === "oauth_failed"
        ? "Google sign-in could not be completed. Please try again."
        : queryError === "missing_profile" || guardReason === "missing_profile"
          ? "Your auth account exists, but there is no matching app profile in the system yet. Ask a Sales Manager to provision or activate your account."
        : queryError === "not_activated" || guardReason === "not_activated"
          ? "Your account is pending activation by a Sales Manager."
          : authError;

  const errorTitle =
    queryError === "missing_profile" || guardReason === "missing_profile"
      ? "Account not provisioned"
      : queryError === "not_activated" || guardReason === "not_activated"
      ? "Account pending activation"
      : "Sign-in issue";

  return (
    <main className="min-h-screen bg-[#f7f1e6] px-6 py-10 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Motion.section
          animate="show"
          className="rounded-[2.5rem] bg-[linear-gradient(145deg,#0b1324_0%,#17283f_45%,#234664_100%)] px-8 py-10 text-white shadow-xl"
          initial="hidden"
          variants={scaleIn}
        >
          <Motion.div className="flex min-h-full flex-col justify-between gap-10" variants={staggerContainer}>
            <Motion.div variants={fadeUp}>
              <BrandMark imageClassName="h-14 w-14 rounded-[1.2rem]" tone="light" />
              <h1 className="mt-10 max-w-lg text-5xl font-black tracking-tight sm:text-6xl">
                Sign in
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-white/75">
                Use your Hope SMS account to continue.
              </p>
            </Motion.div>

            <Motion.div variants={fadeUp}>
              <div className="max-w-md border-t border-white/10 pt-5 text-sm leading-6 text-white/65">
                New accounts need activation before protected pages are available.
              </div>
            </Motion.div>
          </Motion.div>
        </Motion.section>

        <Motion.section animate="show" initial="hidden" variants={scaleIn}>
          <Card className="rounded-[2.5rem] border-white/80 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <CardContent className="p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-900">
                  Login
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  Welcome back
                </h2>
              </div>

              <Motion.form
                animate="show"
                className="mt-8 grid gap-5"
                initial="hidden"
                noValidate
                onSubmit={handleSubmit}
                variants={staggerContainer}
              >
                <Motion.label className="grid gap-2" variants={fadeUp}>
                  <span className="text-sm font-semibold text-slate-700">Email</span>
                  <Input
                    aria-invalid={Boolean(errors.email)}
                    autoComplete="email"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base focus-visible:border-slate-900 focus-visible:ring-slate-950/10"
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
                  ) : null}
                </Motion.label>

                <Motion.label className="grid gap-2" variants={fadeUp}>
                  <span className="text-sm font-semibold text-slate-700">
                    Password
                  </span>
                  <Input
                    aria-invalid={Boolean(errors.password)}
                    autoComplete="current-password"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base focus-visible:border-slate-900 focus-visible:ring-slate-950/10"
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
                  ) : null}
                </Motion.label>

                {!isSupabaseConfigured ? (
                  <Motion.div variants={fadeUp}>
                    <Alert className="rounded-2xl border-amber-200 bg-amber-50 text-amber-950">
                      <AlertTitle>Supabase not configured</AlertTitle>
                      <AlertDescription>
                        Add your project URL and anon key before testing sign-in.
                      </AlertDescription>
                    </Alert>
                  </Motion.div>
                ) : null}

                {loginError ? (
                  <Motion.div variants={fadeUp}>
                    <Alert
                      className="rounded-2xl border-red-200 bg-red-50 text-red-800"
                      variant="destructive"
                    >
                      <AlertTitle>{errorTitle}</AlertTitle>
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  </Motion.div>
                ) : null}

                {successMessage ? (
                  <Motion.div variants={fadeUp}>
                    <Alert className="rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-900">
                      <AlertTitle>Status update</AlertTitle>
                      <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                  </Motion.div>
                ) : null}

                <Motion.div className="grid gap-4" variants={fadeUp}>
                  <Button
                    className="h-12 rounded-full bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800"
                    disabled={isSubmitting || isAuthLoading}
                    size="lg"
                    type="submit"
                  >
                    {isSubmitting ? "Signing in..." : "Sign in with email"}
                  </Button>

                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Separator className="flex-1" />
                    or
                    <Separator className="flex-1" />
                  </div>

                  <Button
                    className="h-12 rounded-full border-slate-300 text-sm font-semibold text-slate-800 hover:border-slate-900 hover:bg-slate-50"
                    disabled={isGoogleSubmitting || isAuthLoading || !isSupabaseConfigured}
                    onClick={() => void handleGoogleSignIn()}
                    size="lg"
                    type="button"
                    variant="outline"
                  >
                    {isGoogleSubmitting ? "Redirecting..." : "Continue with Google"}
                  </Button>
                </Motion.div>

                <Motion.p className="text-center text-sm text-slate-500" variants={fadeUp}>
                  Need an account?{" "}
                  <Link
                    className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-900"
                    to="/register"
                  >
                    Create one here
                  </Link>
                  .
                </Motion.p>
              </Motion.form>
            </CardContent>
          </Card>
        </Motion.section>
      </div>
    </main>
  );
}

export default LoginPage;
