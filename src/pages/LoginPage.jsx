import { Link } from "react-router-dom";

function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-900/5 bg-white p-8 shadow-sm">
        <span className="inline-flex rounded-full border border-sky-700/15 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-900">
          Login Placeholder
        </span>
        <h1 className="mt-5 text-4xl font-black tracking-tight">Login</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          This page is intentionally simple for now. The real email and Google
          authentication flow will be added in the authentication sprint work.
        </p>
        <Link
          className="mt-8 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          to="/sales"
        >
          Continue to protected placeholders
        </Link>
      </div>
    </main>
  );
}

export default LoginPage;
