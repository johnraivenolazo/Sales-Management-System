function App() {
  return (
    <main className="min-h-screen bg-[#f7f1e6] text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <span className="mb-6 inline-flex w-fit rounded-full border border-amber-700/20 bg-white px-4 py-2 text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase">
          Sprint 1 M1 Scaffold
        </span>
        <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-6xl">
          Sales Management System starter is now wired with Vite, React, and
          Tailwind.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
          This branch sets up the frontend baseline only. Supabase client
          wiring, protected routes, and placeholder pages land in the next M1
          branches so the sprint work stays split across separate PRs.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-900/5 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              Tooling
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Vite dev server and production build pipeline are ready for the
              capstone frontend.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-900/5 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              React
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              React app entry, root render, and lint configuration are in place
              for the next routing and auth passes.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-900/5 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
              Styling
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Tailwind is integrated using the official Vite plugin path from
              the current docs.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default App;
