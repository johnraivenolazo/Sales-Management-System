import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

function ProtectedRoute() {
  const location = useLocation();
  const { currentUser, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f1e6] px-6 py-12">
        <section className="w-full max-w-xl rounded-[2rem] border border-slate-900/5 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-sky-900">
            Checking session
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Please wait while the app confirms your session and activation
            status.
          </p>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
