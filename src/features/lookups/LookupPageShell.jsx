function MetricTile({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-900/5 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
        {label}
      </p>
      <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">
        {value}
      </p>
    </article>
  );
}

export function LookupPageShell({
  children,
  eyebrow,
  metrics = [],
  readOnlyLabel = "Lookup only",
  summary,
  title,
}) {
  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-900/5 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.95fr]">
          <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1a2842_45%,#274567_100%)] px-6 py-7 text-white sm:px-8">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                {eyebrow}
              </span>
              <span className="inline-flex rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                {readOnlyLabel}
              </span>
            </div>
            <h2 className="mt-5 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              {summary}
            </p>
          </div>

          <div className="grid gap-4 bg-[#f1e6d2] px-6 py-7 sm:grid-cols-2 lg:grid-cols-1 lg:px-8">
            {metrics.map((metric) => (
              <MetricTile key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-emerald-900/10 bg-emerald-50 px-6 py-5 text-sm leading-6 text-emerald-900 shadow-sm">
        No create, edit, delete, or recovery controls are rendered on lookup pages. These routes are display-only by design.
      </section>

      {children}
    </div>
  );
}
