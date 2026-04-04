function MetricTile({ label, value }) {
  return (
    <article className="rounded-[1.25rem] border border-slate-900/6 bg-white/95 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
        {label}
      </p>
      <p className="mt-3 text-[1.75rem] font-black tracking-tight text-slate-900">
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
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-[2.1rem] border border-slate-900/6 bg-white shadow-sm">
        <div className="border-b border-slate-900/6 bg-[linear-gradient(135deg,#0f172a_0%,#1a2842_45%,#274567_100%)] px-5 py-6 text-white sm:px-6">
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
              {eyebrow}
            </span>
            <span className="inline-flex rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
              {readOnlyLabel}
            </span>
          </div>
          <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-[2.4rem]">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
            {summary}
          </p>
        </div>

        <div className="grid gap-3 bg-[#f1e6d2] px-5 py-4 sm:grid-cols-2 sm:px-6">
          {metrics.map((metric) => (
            <MetricTile key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </section>

      {children}
    </div>
  );
}
