function PlaceholderPage({ title, routePath, summary }) {
  return (
    <article className="rounded-[2rem] border border-slate-900/5 bg-white p-8 shadow-sm">
      <span className="inline-flex rounded-full border border-emerald-700/15 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
        Placeholder Page
      </span>
      <h2 className="mt-5 text-4xl font-black tracking-tight">{title}</h2>
      <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
        {routePath}
      </p>
      <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600">
        {summary}
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-[#f7f1e6] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Why it exists now
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            This route is already wired so the page hierarchy and protected
            navigation are ready before CRUD and role-specific UI land.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-900 p-5 text-white">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Planned next
          </h3>
          <p className="mt-3 text-sm leading-6 text-white/80">
            Replace this placeholder with the fully implemented module for the
            corresponding sprint issue.
          </p>
        </div>
      </div>
    </article>
  );
}

export default PlaceholderPage;
