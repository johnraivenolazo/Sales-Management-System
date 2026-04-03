import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

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
      navigate("/sales", { replace: true });
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

    const { data, error } = await signUpWithEmail({
      email: formData.email.trim(),
      password: formData.password,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim(),
    });

    if (error) {
      setAuthError(error.message);
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

    const { error } = await signInWithGoogle();

    if (error) {
      setAuthError(error.message);
      setIsGoogleSubmitting(false);
      return;
    }

    setSuccessMessage("Redirecting to Google sign-up...");
    setIsGoogleSubmitting(false);
  }

  const inputClassName = (hasError) =>
    `rounded-2xl border px-4 py-3 text-base outline-none transition ${
      hasError
        ? "border-red-400 bg-red-50"
        : "border-slate-200 bg-slate-50 focus:border-slate-900"
    }`;

  return (
    <main className="min-h-screen bg-[#f7f1e6] px-6 py-10 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2.5rem] border border-slate-900/5 bg-white p-8 shadow-sm">
          <span className="inline-flex rounded-full border border-amber-700/15 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">
            New user setup
          </span>
          <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl">
            Create your Hope SMS account.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
            This registration UI is ready for the upcoming auth integration. It
            already captures the fields required by the project docs and keeps
            validation close to the user.
          </p>
          <div className="mt-10 grid gap-4">
            <article className="rounded-3xl bg-slate-900 p-5 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                Included now
              </p>
              <p className="mt-3 text-sm leading-6 text-white/75">
                First Name, Last Name, Username, Email, Password, and Google
                register action.
              </p>
            </article>
            <article className="rounded-3xl bg-[#f3ede0] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
                Team handoff
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                M4 can connect this form to the real sign-up flow without
                redesigning the screen.
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-slate-900/5 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
                Register
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Sign up
              </h2>
            </div>
            <Link
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              to="/login"
            >
              Back to login
            </Link>
          </div>

          <form className="mt-8 grid gap-5" noValidate onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  First Name
                </span>
                <input
                  className={inputClassName(errors.firstName)}
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
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Last Name
                </span>
                <input
                  className={inputClassName(errors.lastName)}
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
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Username
              </span>
              <input
                className={inputClassName(errors.username)}
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
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                className={inputClassName(errors.email)}
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
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Password
              </span>
              <input
                className={inputClassName(errors.password)}
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
                  Use a password with at least 8 characters.
                </span>
              )}
            </label>

            {!isSupabaseConfigured ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                Supabase is not configured yet. Add your project URL and anon
                key before testing sign-up.
              </div>
            ) : null}

            {authError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {authError}
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
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>

            <button
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isGoogleSubmitting || isAuthLoading || !isSupabaseConfigured}
              onClick={() => void handleGoogleRegister()}
              type="button"
            >
              {isGoogleSubmitting ? "Redirecting..." : "Register with Google"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default RegisterPage;
