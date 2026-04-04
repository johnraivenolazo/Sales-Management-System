import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useRights } from "../hooks/useRights.js";

function DeletedItemsRouteGuard() {
  const location = useLocation();
  const { canAccessDeletedItems, isRightsLoading } = useRights();

  if (isRightsLoading) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center px-6 py-12">
        <section className="w-full max-w-xl rounded-[2rem] border border-slate-900/5 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-sky-900">
            Checking access
          </p>
        </section>
      </main>
    );
  }

  if (!canAccessDeletedItems) {
    return <Navigate replace state={{ from: location }} to="/sales" />;
  }

  return <Outlet />;
}

export default DeletedItemsRouteGuard;
