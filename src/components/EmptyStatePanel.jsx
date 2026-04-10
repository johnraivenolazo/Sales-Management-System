function EmptyStatePanel({ eyebrow = "No results", title, description }) {
  return (
    <section className="rounded-[2rem] border border-dashed border-slate-900/10 bg-white p-10 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
        {eyebrow}
      </p>
      <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
        {title}
      </h3>
      {description ? (
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      ) : null}
    </section>
  );
}

export default EmptyStatePanel;