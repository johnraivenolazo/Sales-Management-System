import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import DeletedItemsRouteGuard from "../components/DeletedItemsRouteGuard.jsx";
import { getSales, softDeleteSale } from "../services/salesService.js";
import { getDetailByTrans, softDeleteDetailLine } from "../services/salesDetailService.js";

const mockGuardState = vi.hoisted(() => ({
  rights: {
    canAccessDeletedItems: false,
    isRightsLoading: false,
  },
  supabase: null,
  builders: [],
}));

vi.mock("../hooks/useRights.js", () => ({
  useRights: () => mockGuardState.rights,
}));

vi.mock("../lib/supabaseClient.js", () => ({
  get supabase() {
    return mockGuardState.supabase;
  },
}));

function createQueryBuilder(result = { data: [], error: null }) {
  const builder = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    update: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };

  return builder;
}

function createSupabaseMock(result = { data: [], error: null }) {
  mockGuardState.builders = [];

  return {
    from: vi.fn(() => {
      const builder = createQueryBuilder(result);
      mockGuardState.builders.push(builder);
      return builder;
    }),
  };
}

function renderDeletedItemsRoute() {
  const router = createMemoryRouter(
    [
      {
        path: "/sales",
        element: <div>Sales landing</div>,
      },
      {
        element: <DeletedItemsRouteGuard />,
        children: [
          {
            path: "/deleted-items",
            element: <div>Deleted Items Workspace</div>,
          },
        ],
      },
    ],
    {
      initialEntries: ["/deleted-items"],
    },
  );

  return render(<RouterProvider router={router} />);
}

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const repoRoot = path.resolve(currentDirectory, "..", "..");

function collectFiles(rootDirectory, fileList = []) {
  const entries = fs.readdirSync(rootDirectory, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(rootDirectory, entry.name);

    if (entry.isDirectory()) {
      collectFiles(fullPath, fileList);
      return;
    }

    fileList.push(fullPath);
  });

  return fileList;
}

describe("Sprint 2 cascade and visibility coverage", () => {
  beforeEach(() => {
    mockGuardState.rights = {
      canAccessDeletedItems: false,
      isRightsLoading: false,
    };
    mockGuardState.supabase = createSupabaseMock();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects USER traffic away from Deleted Items", async () => {
    mockGuardState.rights = {
      canAccessDeletedItems: false,
      isRightsLoading: false,
    };

    renderDeletedItemsRoute();

    expect(await screen.findByText("Sales landing")).toBeInTheDocument();
    expect(screen.queryByText("Deleted Items Workspace")).not.toBeInTheDocument();
  });

  it("allows admin-capable roles into Deleted Items", async () => {
    mockGuardState.rights = {
      canAccessDeletedItems: true,
      isRightsLoading: false,
    };

    renderDeletedItemsRoute();

    expect(await screen.findByText("Deleted Items Workspace")).toBeInTheDocument();
  });

  it("filters inactive sales rows for USER visibility queries", async () => {
    mockGuardState.supabase = createSupabaseMock({ data: [], error: null });

    await getSales("USER");

    const salesBuilder = mockGuardState.builders[0];
    expect(salesBuilder.eq).toHaveBeenCalledWith("record_status", "ACTIVE");
  });

  it("filters inactive detail rows for USER visibility queries", async () => {
    mockGuardState.supabase = createSupabaseMock({ data: [], error: null });

    await getDetailByTrans("TR000001", "USER");

    const detailBuilder = mockGuardState.builders[0];
    expect(detailBuilder.eq).toHaveBeenCalledWith("transNo", "TR000001");
    expect(detailBuilder.eq).toHaveBeenCalledWith("record_status", "ACTIVE");
  });

  it("uses updates instead of hard deletes for sales recovery flows", async () => {
    mockGuardState.supabase = createSupabaseMock({ data: {}, error: null });

    await softDeleteSale("TR000001", "SOFT-DEL TEST");
    await softDeleteDetailLine("TR000001", "AM0002", "SOFT-DEL DETAIL");

    const [salesBuilder, detailBuilder] = mockGuardState.builders;
    expect(salesBuilder.update).toHaveBeenCalledWith({
      record_status: "INACTIVE",
      stamp: "SOFT-DEL TEST",
    });
    expect(detailBuilder.update).toHaveBeenCalledWith({
      record_status: "INACTIVE",
      stamp: "SOFT-DEL DETAIL",
    });
  });

  it("contains no hard-delete statements in service or migration files", () => {
    const targetFiles = [
      ...collectFiles(path.join(repoRoot, "src", "services")),
      ...collectFiles(path.join(repoRoot, "db", "migrations")),
    ];
    const forbiddenPatterns = [/\bDELETE\s+FROM\b/i, /\.delete\s*\(/i];

    targetFiles.forEach((filePath) => {
      const fileContents = fs.readFileSync(filePath, "utf8");

      forbiddenPatterns.forEach((pattern) => {
        expect(fileContents).not.toMatch(pattern);
      });
    });
  });
});
