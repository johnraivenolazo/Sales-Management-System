import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserRightsProvider } from "../contexts/UserRightsContext.jsx";
import { useRights } from "../hooks/useRights.js";
import { canManageUserRole } from "../features/admin/userRightsConfig.js";

const RIGHT_CODES = [
  "SALES_VIEW",
  "SALES_ADD",
  "SALES_EDIT",
  "SALES_DEL",
  "SD_VIEW",
  "SD_ADD",
  "SD_EDIT",
  "SD_DEL",
  "CUST_LOOKUP",
  "EMP_LOOKUP",
  "PROD_LOOKUP",
  "PRICE_LOOKUP",
  "DELETED_VIEW",
  "ADM_USER",
];

const ROLE_DEFAULTS = {
  SUPERADMIN: Object.fromEntries(RIGHT_CODES.map((rightCode) => [rightCode, true])),
  ADMIN: {
    SALES_VIEW: true,
    SALES_ADD: true,
    SALES_EDIT: true,
    SALES_DEL: false,
    SD_VIEW: true,
    SD_ADD: true,
    SD_EDIT: true,
    SD_DEL: false,
    CUST_LOOKUP: true,
    EMP_LOOKUP: true,
    PROD_LOOKUP: true,
    PRICE_LOOKUP: true,
    DELETED_VIEW: true,
    ADM_USER: true,
  },
  USER: {
    SALES_VIEW: true,
    SALES_ADD: false,
    SALES_EDIT: false,
    SALES_DEL: false,
    SD_VIEW: true,
    SD_ADD: false,
    SD_EDIT: false,
    SD_DEL: false,
    CUST_LOOKUP: true,
    EMP_LOOKUP: true,
    PROD_LOOKUP: true,
    PRICE_LOOKUP: true,
    DELETED_VIEW: false,
    ADM_USER: false,
  },
};

const mockRightsState = vi.hoisted(() => ({
  auth: {
    currentUser: null,
    isAuthLoading: false,
  },
  supabase: null,
}));

vi.mock("../hooks/useAuth.js", () => ({
  useAuth: () => mockRightsState.auth,
}));

vi.mock("../lib/supabaseClient.js", () => ({
  get supabase() {
    return mockRightsState.supabase;
  },
}));

function buildRightsRows(role) {
  return RIGHT_CODES.map((rightCode) => ({
    right_code: rightCode,
    right_value: ROLE_DEFAULTS[role][rightCode] ? 1 : 0,
  }));
}

function createSupabaseMockFromRows(rightsRows) {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: rightsRows, error: null })),
      })),
    })),
  };
}

function createSupabaseMock(role) {
  return createSupabaseMockFromRows(buildRightsRows(role));
}

function buildRightsRowsFromMap(rightsMap) {
  return RIGHT_CODES.map((rightCode) => ({
    right_code: rightCode,
    right_value: rightsMap[rightCode] ? 1 : 0,
  }));
}

function RightsProbe({ rightCode }) {
  const {
    canAccessAdmin,
    canAccessDeletedItems,
    canSeeStamp,
    hasRight,
    isRightsLoading,
    userType,
  } = useRights();

  return (
    <div>
      <div data-testid="user-type">{userType}</div>
      <div data-testid="rights-loading">{String(isRightsLoading)}</div>
      <div data-testid="right-result">{String(hasRight(rightCode))}</div>
      <div data-testid="can-see-stamp">{String(canSeeStamp)}</div>
      <div data-testid="can-access-deleted-items">{String(canAccessDeletedItems)}</div>
      <div data-testid="can-access-admin">{String(canAccessAdmin)}</div>
    </div>
  );
}

function renderRightsMatrix(role, rightCode) {
  mockRightsState.auth = {
    currentUser: {
      userid: `${role.toLowerCase()}-user`,
      user_type: role,
    },
    isAuthLoading: false,
  };
  mockRightsState.supabase = createSupabaseMock(role);

  render(
    <UserRightsProvider>
      <RightsProbe rightCode={rightCode} />
    </UserRightsProvider>,
  );
}

function renderRightsProbe(userType, rightsMap, rightCode = "ADM_USER") {
  mockRightsState.auth = {
    currentUser: {
      userid: `${userType.toLowerCase()}-user`,
      user_type: userType,
    },
    isAuthLoading: false,
  };
  mockRightsState.supabase = createSupabaseMockFromRows(buildRightsRowsFromMap(rightsMap));

  render(
    <UserRightsProvider>
      <RightsProbe rightCode={rightCode} />
    </UserRightsProvider>,
  );
}

const rightsMatrixCases = Object.entries(ROLE_DEFAULTS).flatMap(([role, rights]) =>
  RIGHT_CODES.map((rightCode) => ({
    role,
    rightCode,
    expected: rights[rightCode],
  })),
);

describe("Sprint 2 rights matrix", () => {
  beforeEach(() => {
    mockRightsState.auth = {
      currentUser: null,
      isAuthLoading: false,
    };
    mockRightsState.supabase = null;
  });

  afterEach(() => {
    cleanup();
  });

  it.each(rightsMatrixCases)(
    "$role hasRight($rightCode) resolves to $expected",
    async ({ expected, rightCode, role }) => {
      renderRightsMatrix(role, rightCode);

      await waitFor(() => {
        expect(screen.getByTestId("rights-loading")).toHaveTextContent("false");
      });

      expect(screen.getByTestId("user-type")).toHaveTextContent(role);
      expect(screen.getByTestId("right-result")).toHaveTextContent(String(expected));
    },
  );

  it("keeps stamp visibility hidden for USER while leaving it visible for admin-capable roles", async () => {
    renderRightsMatrix("USER", "SALES_VIEW");

    await waitFor(() => {
      expect(screen.getByTestId("rights-loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("can-see-stamp")).toHaveTextContent("false");

    cleanup();

    renderRightsMatrix("ADMIN", "SALES_VIEW");

    await waitFor(() => {
      expect(screen.getByTestId("rights-loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("can-see-stamp")).toHaveTextContent("true");
  });

  it("requires DELETED_VIEW before exposing deleted items access and keeps SUPERADMIN admin access available", async () => {
    renderRightsProbe("ADMIN", {
      ...ROLE_DEFAULTS.ADMIN,
      DELETED_VIEW: false,
    }, "DELETED_VIEW");

    await waitFor(() => {
      expect(screen.getByTestId("rights-loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("can-access-deleted-items")).toHaveTextContent("false");

    cleanup();

    renderRightsMatrix("SUPERADMIN", "SALES_VIEW");

    await waitFor(() => {
      expect(screen.getByTestId("rights-loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("can-access-deleted-items")).toHaveTextContent("true");
    expect(screen.getByTestId("can-access-admin")).toHaveTextContent("true");
  });

  it("requires ADM_USER before exposing admin access", async () => {
    renderRightsProbe("ADMIN", {
      ...ROLE_DEFAULTS.ADMIN,
      ADM_USER: false,
    });

    await waitFor(() => {
      expect(screen.getByTestId("rights-loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("can-access-deleted-items")).toHaveTextContent("true");
    expect(screen.getByTestId("can-access-admin")).toHaveTextContent("false");

    cleanup();

    renderRightsProbe("ADMIN", ROLE_DEFAULTS.ADMIN);

    await waitFor(() => {
      expect(screen.getByTestId("rights-loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("can-access-admin")).toHaveTextContent("true");
  });

  it("only allows SUPERADMIN to manage USER and ADMIN roles", () => {
    expect(canManageUserRole("SUPERADMIN", "USER")).toBe(true);
    expect(canManageUserRole("SUPERADMIN", "ADMIN")).toBe(true);
    expect(canManageUserRole("SUPERADMIN", "SUPERADMIN")).toBe(false);
    expect(canManageUserRole("ADMIN", "USER")).toBe(false);
    expect(canManageUserRole("USER", "ADMIN")).toBe(false);
  });
});
