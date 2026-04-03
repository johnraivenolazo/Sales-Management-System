import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-900/5 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
          404
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Route not found
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          The requested page is not part of the current route skeleton.
        </p>
        <Link
          className="mt-8 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          to="/sales"
        >
          Back to sales
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;
