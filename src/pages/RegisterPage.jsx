import { motion as Motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import BrandMark from "@/components/BrandMark.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { consumeAuthRedirectTarget, storeAuthRedirectTarget } from "../lib/authRedirect.js";
import { fadeUp, scaleIn, staggerContainer } from "../lib/motion.js";

function RegisterPage() {
  const navigate = useNavigate();
  const {
    authError,
    currentUser,
    isAuthLoading,
    isSupabaseConfigured,
    setAuthError,
    signInWithGoogle,
    signUpWithEmail,
  } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (currentUser) {
      navigate(consumeAuthRedirectTarget(), { replace: true });
    }
  }, [currentUser, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSuccessMessage("");
    setAuthError("");
  }

  function validate() {
    const nextErrors = {};

    if (!formData.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!formData.username.trim()) {
      nextErrors.username = "Username is required.";
    } else if (formData.username.trim().length < 4) {
      nextErrors.username = "Username must be at least 4 characters.";
    }

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
    storeAuthRedirectTarget("/sales");

    const { data, error } = await signUpWithEmail({
      email: formData.email.trim(),
      password: formData.password,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim(),
    });

    if (error) {
      const nextMessage =
        error.code === "email_provider_disabled"
          ? "Email/password sign-up is disabled in Supabase. If you want email login without verification-email cost, re-enable the Email provider and turn Confirm Email off. Otherwise use Google registration."
          : error.message;
      setAuthError(nextMessage);
      setIsSubmitting(false);
      return;
    }

    if (data?.user) {
      setSuccessMessage(
        "Account created. Check your email if confirmation is enabled, then wait for activation by a Sales Manager.",
      );
    }

    setIsSubmitting(false);
  }

  async function handleGoogleRegister() {
    setAuthError("");
    setSuccessMessage("");
    setIsGoogleSubmitting(true);
    storeAuthRedirectTarget("/sales");

    const { error } = await signInWithGoogle();

    if (error) {
      setAuthError(error.message);
      setIsGoogleSubmitting(false);
      return;
    }

    setSuccessMessage("Redirecting to Google sign-up...");
    setIsGoogleSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f1e6] px-6 py-10 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Motion.section animate="show" initial="hidden" variants={scaleIn}>
          <Card className="rounded-[2.5rem] border-white/80 bg-[linear-gradient(145deg,#0f172a_0%,#17283f_45%,#21405d_100%)] text-white shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
            <CardContent className="p-8">
              <BrandMark imageClassName="h-14 w-14 rounded-[1.2rem]" tone="light" />
              <Badge className="mt-6 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300 hover:bg-white/10">
                Account setup
              </Badge>
              <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl">
                Create an account
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
                Enter your details to request access to Hope SMS.
              </p>
              <Motion.div animate="show" className="mt-10 border-t border-white/10 pt-5" initial="hidden" variants={staggerContainer}>
                <Motion.p className="max-w-md text-sm leading-6 text-white/65" variants={fadeUp}>
                  New accounts need activation before protected pages are available.
                </Motion.p>
              </Motion.div>
            </CardContent>
          </Card>
        </Motion.section>

        <Motion.section animate="show" initial="hidden" variants={scaleIn}>
          <Card className="rounded-[2.5rem] border-white/80 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <CardContent className="p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
                  Register
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  Sign up
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
                <div className="grid gap-5 md:grid-cols-2">
                  <Motion.label className="grid gap-2" variants={fadeUp}>
                    <span className="text-sm font-semibold text-slate-700">
                      First Name
                    </span>
                    <Input
                      aria-invalid={Boolean(errors.firstName)}
                      autoComplete="given-name"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base focus-visible:border-slate-900 focus-visible:ring-slate-950/10"
                      name="firstName"
                      placeholder="Jacques"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName ? (
                      <span className="text-sm font-medium text-red-600">
                        {errors.firstName}
                      </span>
                    ) : null}
                  </Motion.label>

                  <Motion.label className="grid gap-2" variants={fadeUp}>
                    <span className="text-sm font-semibold text-slate-700">
                      Last Name
                    </span>
                    <Input
                      aria-invalid={Boolean(errors.lastName)}
                      autoComplete="family-name"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base focus-visible:border-slate-900 focus-visible:ring-slate-950/10"
                      name="lastName"
                      placeholder="Carigma"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName ? (
                      <span className="text-sm font-medium text-red-600">
                        {errors.lastName}
                      </span>
                    ) : null}
                  </Motion.label>
                </div>

                <Motion.label className="grid gap-2" variants={fadeUp}>
                  <span className="text-sm font-semibold text-slate-700">
                    Username
                  </span>
                  <Input
                    aria-invalid={Boolean(errors.username)}
                    autoComplete="username"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base focus-visible:border-slate-900 focus-visible:ring-slate-950/10"
                    name="username"
                    placeholder="jax-rgb"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {errors.username ? (
                    <span className="text-sm font-medium text-red-600">
                      {errors.username}
                    </span>
                  ) : null}
                </Motion.label>

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
                    autoComplete="new-password"
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
                        Add your project URL and anon key before testing sign-up.
                      </AlertDescription>
                    </Alert>
                  </Motion.div>
                ) : null}

                {authError ? (
                  <Motion.div variants={fadeUp}>
                    <Alert
                      className="rounded-2xl border-red-200 bg-red-50 text-red-800"
                      variant="destructive"
                    >
                      <AlertTitle>Registration issue</AlertTitle>
                      <AlertDescription>{authError}</AlertDescription>
                    </Alert>
                  </Motion.div>
                ) : null}

                {successMessage ? (
                  <Motion.div variants={fadeUp}>
                    <Alert className="rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-900">
                      <AlertTitle>Account created</AlertTitle>
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
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Button>

                  <Button
                    className="h-12 rounded-full border-slate-300 text-sm font-semibold text-slate-800 hover:border-slate-900 hover:bg-slate-50"
                    disabled={isGoogleSubmitting || isAuthLoading || !isSupabaseConfigured}
                    onClick={() => void handleGoogleRegister()}
                    size="lg"
                    type="button"
                    variant="outline"
                    >
                    {isGoogleSubmitting ? "Redirecting..." : "Register with Google"}
                  </Button>
                </Motion.div>

                <Motion.p className="text-center text-sm text-slate-500" variants={fadeUp}>
                  Already have an account?{" "}
                  <Link
                    className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-900"
                    to="/login"
                  >
                    Back to login
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

export default RegisterPage;
