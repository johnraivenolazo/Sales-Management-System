import { Navigate, createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ShellPlaceholderLayout from "./layouts/ShellPlaceholderLayout.jsx";
import AuthCallbackPage from "./pages/AuthCallbackPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
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
    element: <ProtectedRoute />,
    children: [
      {
        element: <ShellPlaceholderLayout />,
        children: [
          {
            path: "/sales",
            element: (
              <PlaceholderPage
                title="Sales"
                routePath="/sales"
                summary="Transactions landing page placeholder for the upcoming sales list implementation."
              />
            ),
          },
          {
            path: "/sales/:transNo",
            element: <SalesDetailPlaceholderPage />,
          },
          {
            path: "/lookups/customers",
            element: (
              <PlaceholderPage
                title="Customer Lookup"
                routePath="/lookups/customers"
                summary="Read-only customer lookup page placeholder."
              />
            ),
          },
          {
            path: "/lookups/employees",
            element: (
              <PlaceholderPage
                title="Employee Lookup"
                routePath="/lookups/employees"
                summary="Read-only employee lookup page placeholder."
              />
            ),
          },
          {
            path: "/lookups/products",
            element: (
              <PlaceholderPage
                title="Product Lookup"
                routePath="/lookups/products"
                summary="Read-only product lookup page placeholder."
              />
            ),
          },
          {
            path: "/lookups/prices",
            element: (
              <PlaceholderPage
                title="Price Lookup"
                routePath="/lookups/prices"
                summary="Read-only price history page placeholder."
              />
            ),
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
            path: "/deleted-items",
            element: (
              <PlaceholderPage
                title="Deleted Items"
                routePath="/deleted-items"
                summary="Deleted items placeholder for recovery tooling in Sprint 2."
              />
            ),
          },
          {
            path: "/auth/callback",
            element: <AuthCallbackPage />,
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
