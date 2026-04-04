import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LookupRouteGuard from "../components/LookupRouteGuard.jsx";
import { LineItemFormDialog } from "../features/sales/LineItemFormDialog.jsx";
import CustomerLookupPage from "../pages/CustomerLookupPage.jsx";
import EmployeeLookupPage from "../pages/EmployeeLookupPage.jsx";
import PriceHistoryPage from "../pages/PriceHistoryPage.jsx";
import ProductLookupPage from "../pages/ProductLookupPage.jsx";

const mockLookupState = vi.hoisted(() => ({
  rights: {
    hasRight: () => false,
    isRightsLoading: false,
  },
  getCurrentPrice: vi.fn(),
  getCustomers: vi.fn(),
  getEmployees: vi.fn(),
  getProducts: vi.fn(),
  getPriceHistory: vi.fn(),
}));

vi.mock("../hooks/useRights.js", () => ({
  useRights: () => mockLookupState.rights,
}));

vi.mock("../services/lookupService.js", () => ({
  getCurrentPrice: (...args) => mockLookupState.getCurrentPrice(...args),
  getCustomers: (...args) => mockLookupState.getCustomers(...args),
  getEmployees: (...args) => mockLookupState.getEmployees(...args),
  getProducts: (...args) => mockLookupState.getProducts(...args),
  getPriceHistory: (...args) => mockLookupState.getPriceHistory(...args),
}));

function renderLookupRoute() {
  const router = createMemoryRouter(
    [
      {
        path: "/sales",
        element: <div>Sales landing</div>,
      },
      {
        element: <LookupRouteGuard requiredRight="CUST_LOOKUP" title="customer lookup" />,
        children: [
          {
            path: "/lookups/customers",
            element: <div>Customer lookup route</div>,
          },
        ],
      },
    ],
    {
      initialEntries: ["/lookups/customers"],
    },
  );

  return render(<RouterProvider router={router} />);
}

function LineItemDialogHarness() {
  const [form, setForm] = useState({
    prodCode: "",
    quantity: "2",
  });

  return (
    <LineItemFormDialog
      error=""
      form={form}
      isSaving={false}
      mode="create"
      onChange={(event) => {
        const { name, value } = event.target;
        setForm((currentForm) => ({
          ...currentForm,
          [name]: value,
        }));
      }}
      onClose={() => {}}
      onSubmit={(event) => event.preventDefault()}
      productOptions={[
        {
          value: "AM0002",
          label: "AM0002 - Logitech 910-002696",
        },
      ]}
    />
  );
}

const lookupPages = [
  {
    name: "Customer lookup",
    renderPage: () => <CustomerLookupPage />,
    setupMocks: () => {
      mockLookupState.getCustomers.mockResolvedValue([
        {
          custno: "C0001",
          custname: "Hope Customer",
          address: "Sample Address",
          payterm: "COD",
        },
      ]);
    },
  },
  {
    name: "Employee lookup",
    renderPage: () => <EmployeeLookupPage />,
    setupMocks: () => {
      mockLookupState.getEmployees.mockResolvedValue([
        {
          empno: "E0001",
          lastname: "Dela Cruz",
          firstname: "Maria",
          gender: "F",
          birthdate: "2000-01-01",
          hiredate: "2024-01-01",
          sepDate: null,
        },
      ]);
    },
  },
  {
    name: "Product lookup",
    renderPage: () => <ProductLookupPage />,
    setupMocks: () => {
      mockLookupState.getProducts.mockResolvedValue([
        {
          prodCode: "AM0002",
          description: "Logitech 910-002696",
          unit: "pc",
        },
      ]);
      mockLookupState.getPriceHistory.mockResolvedValue([
        {
          prodCode: "AM0002",
          effDate: "2010-08-16",
          unitPrice: 72.72,
        },
      ]);
    },
  },
  {
    name: "Price history",
    renderPage: () => <PriceHistoryPage />,
    setupMocks: () => {
      mockLookupState.getProducts.mockResolvedValue([
        {
          prodCode: "AM0002",
          description: "Logitech 910-002696",
          unit: "pc",
        },
      ]);
      mockLookupState.getPriceHistory.mockResolvedValue([
        {
          prodCode: "AM0002",
          effDate: "2010-08-16",
          unitPrice: 72.72,
        },
      ]);
    },
  },
];

describe("Sprint 2 lookup-only and price autofill coverage", () => {
  beforeEach(() => {
    mockLookupState.rights = {
      hasRight: () => false,
      isRightsLoading: false,
    };
    mockLookupState.getCurrentPrice.mockReset();
    mockLookupState.getCustomers.mockReset();
    mockLookupState.getEmployees.mockReset();
    mockLookupState.getProducts.mockReset();
    mockLookupState.getPriceHistory.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects users away from lookup routes when the matching lookup right is missing", async () => {
    mockLookupState.rights = {
      hasRight: () => false,
      isRightsLoading: false,
    };

    renderLookupRoute();

    expect(await screen.findByText("Sales landing")).toBeInTheDocument();
    expect(screen.queryByText("Customer lookup route")).not.toBeInTheDocument();
  });

  it("allows lookup routes to render when the matching right exists", async () => {
    mockLookupState.rights = {
      hasRight: () => true,
      isRightsLoading: false,
    };

    renderLookupRoute();

    expect(await screen.findByText("Customer lookup route")).toBeInTheDocument();
  });

  it("auto-fills the latest unit price and recomputes the estimated row total in the line-item dialog", async () => {
    const user = userEvent.setup();
    mockLookupState.getCurrentPrice.mockResolvedValue({
      prodCode: "AM0002",
      effDate: "2010-08-16",
      unitPrice: 72.72,
    });

    render(<LineItemDialogHarness />);

    await user.selectOptions(screen.getByLabelText("Product"), "AM0002");

    await waitFor(() => {
      expect(screen.getByText("$72.72")).toBeInTheDocument();
    });

    expect(screen.getByText("$145.44")).toBeInTheDocument();
  });

  it.each(lookupPages)(
    "$name stays mutation-free in the rendered UI",
    async ({ renderPage, setupMocks }) => {
      setupMocks();

      render(renderPage());

      expect(await screen.findByText("Lookup only")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /add|edit|delete|recover/i })).not.toBeInTheDocument();
    },
  );
});
