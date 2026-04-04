import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminRouteGuard from "../components/AdminRouteGuard.jsx";
import AdminUsersPage from "../pages/AdminUsersPage.jsx";

const mockM4State = vi.hoisted(() => ({
  rights: {
    canAccessAdmin: false,
    canSeeStamp: true,
    isRightsLoading: false,
  },
  adminUsers: [],
}));

const getUsersMock = vi.fn();
const activateUserMock = vi.fn();
const deactivateUserMock = vi.fn();

vi.mock("../hooks/useRights.js", () => ({
  useRights: () => mockM4State.rights,
}));

vi.mock("../services/adminService.js", () => ({
  getUsers: (...args) => getUsersMock(...args),
  activateUser: (...args) => activateUserMock(...args),
  deactivateUser: (...args) => deactivateUserMock(...args),
}));

describe("Sprint 3 M4 admin gating and SUPERADMIN UI guard", () => {
  beforeEach(() => {
    mockM4State.rights = {
      canAccessAdmin: false,
      canSeeStamp: true,
      isRightsLoading: false,
    };
    mockM4State.adminUsers = [];
    getUsersMock.mockReset();
    activateUserMock.mockReset();
    deactivateUserMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects /admin to /sales when ADM_USER access is unavailable", async () => {
    const router = createMemoryRouter(
      [
        {
          element: <AdminRouteGuard />,
          children: [{ element: <div>Admin workspace</div>, path: "/admin" }],
        },
        {
          element: <div>Sales workspace</div>,
          path: "/sales",
        },
      ],
      {
        initialEntries: ["/admin"],
      },
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText("Sales workspace")).toBeInTheDocument();
    });
    expect(screen.queryByText("Admin workspace")).not.toBeInTheDocument();
  });

  it("allows /admin when ADM_USER access is available", async () => {
    mockM4State.rights = {
      canAccessAdmin: true,
      canSeeStamp: true,
      isRightsLoading: false,
    };

    const router = createMemoryRouter(
      [
        {
          element: <AdminRouteGuard />,
          children: [{ element: <div>Admin workspace</div>, path: "/admin" }],
        },
        {
          element: <div>Sales workspace</div>,
          path: "/sales",
        },
      ],
      {
        initialEntries: ["/admin"],
      },
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText("Admin workspace")).toBeInTheDocument();
    });
    expect(screen.queryByText("Sales workspace")).not.toBeInTheDocument();
  });

  it("disables SUPERADMIN actions in the admin workspace", async () => {
    mockM4State.rights = {
      canAccessAdmin: true,
      canSeeStamp: true,
      isRightsLoading: false,
    };
    getUsersMock.mockResolvedValue([
      {
        userId: "super-001",
        username: "superadmin",
        email: "superadmin@example.com",
        firstName: "System",
        lastName: "Owner",
        userType: "SUPERADMIN",
        recordStatus: "ACTIVE",
        stamp: "SEEDED",
      },
    ]);

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Manage users")).toBeInTheDocument();
    });

    const activateButtons = screen.getAllByRole("button", { name: "Activate" });
    const deactivateButtons = screen.getAllByRole("button", { name: "Deactivate" });

    expect(activateButtons.length).toBeGreaterThan(0);
    expect(deactivateButtons.length).toBeGreaterThan(0);
    activateButtons.forEach((button) => expect(button).toBeDisabled());
    deactivateButtons.forEach((button) => expect(button).toBeDisabled());
    expect(screen.getAllByText(/locked/i).length).toBeGreaterThan(0);
    expect(activateUserMock).not.toHaveBeenCalled();
    expect(deactivateUserMock).not.toHaveBeenCalled();
  });
});
