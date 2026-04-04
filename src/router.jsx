import { Navigate, createBrowserRouter } from "react-router-dom";
import AdminRouteGuard from "./components/AdminRouteGuard.jsx";
import DeletedItemsRouteGuard from "./components/DeletedItemsRouteGuard.jsx";
import LookupRouteGuard from "./components/LookupRouteGuard.jsx";
import CustomerLookupPage from "./pages/CustomerLookupPage.jsx";
import DeletedItemsPage from "./pages/DeletedItemsPage.jsx";
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
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import SalesDetailPage from "./pages/SalesDetailPage.jsx";
import SalesListPage from "./pages/SalesListPage.jsx";

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
            element: <SalesDetailPage />,
          },
          {
            element: <LookupRouteGuard requiredRight="CUST_LOOKUP" title="customer lookup" />,
            children: [
              {
                path: "/lookups/customers",
                element: <CustomerLookupPage />,
              },
            ],
          },
          {
            element: <LookupRouteGuard requiredRight="EMP_LOOKUP" title="employee lookup" />,
            children: [
              {
                path: "/lookups/employees",
                element: <EmployeeLookupPage />,
              },
            ],
          },
          {
            element: <LookupRouteGuard requiredRight="PROD_LOOKUP" title="product lookup" />,
            children: [
              {
                path: "/lookups/products",
                element: <ProductLookupPage />,
              },
            ],
          },
          {
            element: <LookupRouteGuard requiredRight="PRICE_LOOKUP" title="price history" />,
            children: [
              {
                path: "/lookups/prices",
                element: <PriceHistoryPage />,
              },
            ],
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
            element: <AdminRouteGuard />,
            children: [
              {
                path: "/admin",
                element: <AdminUsersPage />,
              },
            ],
          },
          {
            element: <DeletedItemsRouteGuard />,
            children: [
              {
                path: "/deleted-items",
                element: <DeletedItemsPage />,
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
