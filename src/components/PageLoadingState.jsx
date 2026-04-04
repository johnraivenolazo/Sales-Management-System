function PageLoadingState({
  eyebrow = "Loading",
  title = "Preparing the page",
  description = "Please wait while the app finishes loading the next state.",
  compact = false,
}) {
  return (
    <main
      className={`flex items-center justify-center px-6 py-12 ${
        compact ? "min-h-[40vh]" : "min-h-screen bg-[#f7f1e6]"
      }`}
    >
      <section className="w-full max-w-2xl rounded-[2rem] border border-slate-900/5 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-sky-900">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      </section>
    </main>
  );
}

export default PageLoadingState;
