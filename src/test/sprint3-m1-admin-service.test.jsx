import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  activateUser,
  deactivateUser,
  getUsers,
  getUserRights,
  saveUserRights,
  saveUserRole,
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

  it("loads the current rights rows for a selected user", async () => {
    const userMaybeSingle = vi.fn(() =>
      Promise.resolve({
        data: {
          userId: "user3",
          userType: "USER",
        },
        error: null,
      }),
    );
    const rightsOrder = vi.fn(() =>
      Promise.resolve({
        data: [
          {
            rightCode: "SALES_VIEW",
            rightValue: 1,
          },
        ],
        error: null,
      }),
    );
    const userEq = vi.fn(() => ({
      maybeSingle: userMaybeSingle,
    }));
    const rightsEq = vi.fn(() => ({
      order: rightsOrder,
    }));
    const select = vi
      .fn()
      .mockReturnValueOnce({
        eq: userEq,
      })
      .mockReturnValueOnce({
        eq: rightsEq,
      });

    mockSupabaseState.supabase = {
      from: vi.fn(() => ({
        select,
      })),
    };

    const result = await getUserRights("user3");

    expect(result).toEqual([
      {
        rightCode: "SALES_VIEW",
        rightValue: 1,
      },
    ]);
    expect(mockSupabaseState.supabase.from).toHaveBeenNthCalledWith(1, "user");
    expect(mockSupabaseState.supabase.from).toHaveBeenNthCalledWith(2, "user_module_rights");
  });

  it("bulk-saves rights for a normal user and returns the updated rights rows", async () => {
    const userMaybeSingle = vi.fn(() =>
      Promise.resolve({
        data: {
          userId: "user3",
          userType: "USER",
        },
        error: null,
      }),
    );
    const userEq = vi.fn(() => ({
      maybeSingle: userMaybeSingle,
    }));
    const upsertSelect = vi.fn(() =>
      Promise.resolve({
        data: [
          {
            rightCode: "SALES_ADD",
            rightValue: 1,
          },
        ],
        error: null,
      }),
    );
    const upsert = vi.fn(() => ({
      select: upsertSelect,
    }));
    const select = vi.fn(() => ({
      eq: userEq,
    }));

    mockSupabaseState.supabase = {
      from: vi
        .fn()
        .mockReturnValueOnce({
          select,
        })
        .mockReturnValueOnce({
          upsert,
        }),
    };

    const result = await saveUserRights(
      "user3",
      {
        SALES_ADD: true,
        SALES_EDIT: false,
      },
      "RIGHTS SAVE",
    );

    expect(upsert).toHaveBeenCalledWith(
      [
        {
          userid: "user3",
          right_code: "SALES_ADD",
          right_value: 1,
          record_status: "ACTIVE",
          stamp: "RIGHTS SAVE",
        },
        {
          userid: "user3",
          right_code: "SALES_EDIT",
          right_value: 0,
          record_status: "ACTIVE",
          stamp: "RIGHTS SAVE",
        },
      ],
      { onConflict: "userid,right_code" },
    );
    expect(result).toEqual([
      {
        rightCode: "SALES_ADD",
        rightValue: 1,
      },
    ]);
  });

  it("updates a normal user's role when requested by superadmin tooling", async () => {
    const userMaybeSingle = vi.fn(() =>
      Promise.resolve({
        data: {
          userId: "user3",
          userType: "USER",
        },
        error: null,
      }),
    );
    const userEq = vi.fn(() => ({
      maybeSingle: userMaybeSingle,
    }));
    const updateSingle = vi.fn(() =>
      Promise.resolve({
        data: {
          userId: "user3",
          userType: "ADMIN",
          stamp: "ROLE SAVE",
        },
        error: null,
      }),
    );
    const updateEq = vi.fn(() => ({
      select: vi.fn(() => ({
        single: updateSingle,
      })),
    }));
    const update = vi.fn(() => ({
      eq: updateEq,
    }));
    const select = vi.fn(() => ({
      eq: userEq,
    }));

    mockSupabaseState.supabase = {
      from: vi
        .fn()
        .mockReturnValueOnce({
          select,
        })
        .mockReturnValueOnce({
          update,
        }),
    };

    const result = await saveUserRole("user3", "ADMIN", "ROLE SAVE");

    expect(update).toHaveBeenCalledWith({
      user_type: "ADMIN",
      stamp: "ROLE SAVE",
    });
    expect(updateEq).toHaveBeenCalledWith("userid", "user3");
    expect(result).toEqual({
      userId: "user3",
      userType: "ADMIN",
      stamp: "ROLE SAVE",
    });
  });
});
