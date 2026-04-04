import { Navigate, createBrowserRouter } from "react-router-dom";
import DeletedItemsRouteGuard from "./components/DeletedItemsRouteGuard.jsx";
import CustomerLookupPage from "./pages/CustomerLookupPage.jsx";
import EmployeeLookupPage from "./pages/EmployeeLookupPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ShellPlaceholderLayout from "./layouts/ShellPlaceholderLayout.jsx";
import AuthCallbackPage from "./pages/AuthCallbackPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import PriceHistoryPage from "./pages/PriceHistoryPage.jsx";
import ProductLookupPage from "./pages/ProductLookupPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import SalesListPage from "./pages/SalesListPage.jsx";
import SalesDetailPlaceholderPage from "./pages/SalesDetailPlaceholderPage.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/sales" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <ShellPlaceholderLayout />,
        children: [
          {
            path: "/sales",
            element: <SalesListPage />,
          },
          {
            path: "/sales/:transNo",
            element: <SalesDetailPlaceholderPage />,
          },
          {
            path: "/lookups/customers",
            element: <CustomerLookupPage />,
          },
          {
            path: "/lookups/employees",
            element: <EmployeeLookupPage />,
          },
          {
            path: "/lookups/products",
            element: <ProductLookupPage />,
          },
          {
            path: "/lookups/prices",
            element: <PriceHistoryPage />,
          },
          {
            path: "/reports",
            element: (
              <PlaceholderPage
                title="Reports"
                routePath="/reports"
                summary="Reports module placeholder for Sprint 3 pages."
              />
            ),
          },
          {
            path: "/admin",
            element: (
              <PlaceholderPage
                title="Admin"
                routePath="/admin"
                summary="Admin module placeholder for Sprint 3 user management."
              />
            ),
          },
          {
            element: <DeletedItemsRouteGuard />,
            children: [
              {
                path: "/deleted-items",
                element: (
                  <PlaceholderPage
                    title="Deleted Items"
                    routePath="/deleted-items"
                    summary="Deleted items placeholder for recovery tooling in Sprint 2."
                  />
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
