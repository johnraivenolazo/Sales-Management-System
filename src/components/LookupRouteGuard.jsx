import { Navigate, Outlet, useLocation } from "react-router-dom";
import PageLoadingState from "./PageLoadingState.jsx";
import { useRights } from "../hooks/useRights.js";

function LookupRouteGuard({ requiredRight, title }) {
  const location = useLocation();
  const { hasRight, isRightsLoading } = useRights();

  if (isRightsLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Lookup access"
        title={`Checking ${title} access`}
        description="Verifying the current rights map before loading the lookup route."
      />
    );
  }

  if (!hasRight(requiredRight)) {
    return <Navigate replace state={{ from: location }} to="/sales" />;
  }

  return <Outlet />;
}

export default LookupRouteGuard;
