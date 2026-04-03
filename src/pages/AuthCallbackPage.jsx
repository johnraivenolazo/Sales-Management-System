function AuthCallbackPage() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center px-6 py-12">
      <section className="w-full max-w-2xl rounded-[2.5rem] border border-slate-900/5 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900/5">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
        </div>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-sky-900">
          Auth callback
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
          Finishing sign-in
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600">
          Please wait while the application completes the authentication
          handshake and prepares your session. This loading page is ready for
          the real callback logic that will land in the auth wiring work.
        </p>
        <div className="mt-8 rounded-3xl bg-[#f7f1e6] px-5 py-4 text-sm leading-6 text-slate-700">
          Expected next behavior once auth wiring is connected: validate the
          session, run the login guard, then redirect the user to the
          appropriate page.
        </div>
      </section>
    </main>
  );
}

export default AuthCallbackPage;
