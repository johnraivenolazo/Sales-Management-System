import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  activateUser,
  deactivateUser,
  getUsers,
} from "../services/adminService.js";

const mockSupabaseState = vi.hoisted(() => ({
  supabase: null,
}));

vi.mock("../lib/supabaseClient.js", () => ({
  get supabase() {
    return mockSupabaseState.supabase;
  },
}));

function createOrderedSelectResult(data) {
  return {
    order: vi.fn().mockReturnThis(),
    then: (onFulfilled, onRejected) =>
      Promise.resolve({ data, error: null }).then(onFulfilled, onRejected),
  };
}

describe("Sprint 3 M1 admin service", () => {
  beforeEach(() => {
    mockSupabaseState.supabase = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads admin users through the user table", async () => {
    const orderedResult = createOrderedSelectResult([
      {
        userId: "user2",
        username: "admin1",
        userType: "ADMIN",
      },
    ]);
    const select = vi.fn(() => orderedResult);

    mockSupabaseState.supabase = {
      from: vi.fn(() => ({
        select,
      })),
    };

    const result = await getUsers();

    expect(mockSupabaseState.supabase.from).toHaveBeenCalledWith("user");
    expect(select).toHaveBeenCalledWith(
      "userId:userid, username, email, firstName:first_name, lastName:last_name, userType:user_type, recordStatus:record_status, stamp",
    );
    expect(orderedResult.order).toHaveBeenNthCalledWith(
      1,
      "user_type",
      { ascending: true },
    );
    expect(orderedResult.order).toHaveBeenNthCalledWith(
      2,
      "username",
      { ascending: true },
    );
    expect(result).toEqual([
      {
        userId: "user2",
        username: "admin1",
        userType: "ADMIN",
      },
    ]);
  });

  it("blocks activating a SUPERADMIN account before issuing the update", async () => {
    const maybeSingle = vi.fn(() =>
      Promise.resolve({
        data: {
          userId: "user1",
          userType: "SUPERADMIN",
        },
        error: null,
      })
    );
    const eq = vi.fn(() => ({
      maybeSingle,
    }));
    const select = vi.fn(() => ({
      eq,
    }));

    mockSupabaseState.supabase = {
      from: vi.fn(() => ({
        select,
      })),
    };

    await expect(activateUser("user1")).rejects.toThrow(
      "SUPERADMIN accounts cannot be modified.",
    );
    expect(mockSupabaseState.supabase.from).toHaveBeenCalledTimes(1);
  });

  it("deactivates a normal user and returns the updated row", async () => {
    const preflightMaybeSingle = vi.fn(() =>
      Promise.resolve({
        data: {
          userId: "user3",
          userType: "USER",
        },
        error: null,
      })
    );
    const preflightEq = vi.fn(() => ({
      maybeSingle: preflightMaybeSingle,
    }));
    const preflightSelect = vi.fn(() => ({
      eq: preflightEq,
    }));

    const updateSingle = vi.fn(() =>
      Promise.resolve({
        data: {
          userId: "user3",
          recordStatus: "INACTIVE",
          stamp: "DEACTIVATED",
        },
        error: null,
      })
    );
    const updateEq = vi.fn(() => ({
      select: vi.fn(() => ({
        single: updateSingle,
      })),
    }));
    const update = vi.fn(() => ({
      eq: updateEq,
    }));

    mockSupabaseState.supabase = {
      from: vi
        .fn()
        .mockReturnValueOnce({
          select: preflightSelect,
        })
        .mockReturnValueOnce({
          update,
        }),
    };

    const result = await deactivateUser("user3");

    expect(update).toHaveBeenCalledWith({
      record_status: "INACTIVE",
      stamp: "DEACTIVATED",
    });
    expect(updateEq).toHaveBeenCalledWith("userid", "user3");
    expect(result).toEqual({
      userId: "user3",
      recordStatus: "INACTIVE",
      stamp: "DEACTIVATED",
    });
  });
});
