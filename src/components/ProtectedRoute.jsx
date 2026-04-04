import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import PageLoadingState from "./PageLoadingState.jsx";

function ProtectedRoute() {
  const location = useLocation();
  const { currentUser, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <PageLoadingState
        description="Please wait while the app confirms your session and activation status."
        eyebrow="Checking session"
        title="Preparing the workspace"
      />
    );
  }

  if (!currentUser) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
