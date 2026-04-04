import { Navigate, Outlet, useLocation } from "react-router-dom";
import PageLoadingState from "./PageLoadingState.jsx";
import { useRights } from "../hooks/useRights.js";

function AdminRouteGuard() {
  const location = useLocation();
  const { canAccessAdmin, isRightsLoading } = useRights();

  if (isRightsLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Admin access"
        title="Checking admin access"
        description="Confirming permissions."
      />
    );
  }

  if (!canAccessAdmin) {
    return <Navigate replace state={{ from: location }} to="/sales" />;
  }

  return <Outlet />;
}

export default AdminRouteGuard;
