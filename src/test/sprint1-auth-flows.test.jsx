import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { AuthProvider } from "../contexts/AuthContext.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";

const mockSupabaseState = vi.hoisted(() => ({
  isSupabaseConfigured: true,
  supabase: null,
}));

vi.mock("../lib/supabaseClient.js", () => ({
  get isSupabaseConfigured() {
    return mockSupabaseState.isSupabaseConfigured;
  },
  get supabase() {
    return mockSupabaseState.supabase;
  },
}));

function createQueryResponse(data = null, error = null) {
  return Promise.resolve({ data, error });
}

function createSupabaseMock({
  session = null,
  profileById = null,
  profileByEmail = null,
  signUpResult = { data: { user: { id: "new-user-id" } }, error: null },
  signInWithPasswordResult = { data: { session: null }, error: null },
  signInWithOAuthResult = { data: { provider: "google" }, error: null },
} = {}) {
  const unsubscribe = vi.fn();

  const from = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn((column) => ({
        maybeSingle: vi.fn(() => {
          if (column === "userid") {
            return createQueryResponse(profileById, null);
          }

          if (column === "email") {
            return createQueryResponse(profileByEmail, null);
          }

          return createQueryResponse(null, null);
        }),
      })),
    })),
  }));

  return {
    from,
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe,
          },
        },
      })),
      signInWithOAuth: vi.fn().mockResolvedValue(signInWithOAuthResult),
      signInWithPassword: vi.fn().mockResolvedValue(signInWithPasswordResult),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue(signUpResult),
    },
  };
}

function renderWithAuth(routes, initialEntries) {
  const router = createMemoryRouter(routes, { initialEntries });

  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
}

describe("Sprint 1 auth flows", () => {
  beforeEach(() => {
    mockSupabaseState.isSupabaseConfigured = true;
    mockSupabaseState.supabase = createSupabaseMock();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
  });

  it("submits the email registration flow with the required profile fields", async () => {
    const user = userEvent.setup();

    renderWithAuth(
      [
        {
          path: "/register",
          element: <RegisterPage />,
        },
      ],
      ["/register"],
    );

    await user.type(screen.getByLabelText("First Name"), "Prince");
    await user.type(screen.getByLabelText("Last Name"), "Ang");
    await user.type(screen.getByLabelText("Username"), "princecyrus");
    await user.type(
      screen.getByLabelText(/^Email$/),
      "princecyrusang99@gmail.com",
    );
    await user.type(
      screen.getByPlaceholderText("Minimum 8 characters"),
      "StrongPass123",
    );
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockSupabaseState.supabase.auth.signUp).toHaveBeenCalledTimes(1);
    });

    expect(mockSupabaseState.supabase.auth.signUp).toHaveBeenCalledWith({
      email: "princecyrusang99@gmail.com",
      password: "StrongPass123",
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          first_name: "Prince",
          last_name: "Ang",
          username: "princecyrus",
        },
      },
    });

    expect(await screen.findByText("Account created")).toBeInTheDocument();
    expect(
      await screen.findByText(
        /check your email only if confirmation is enabled, then wait for activation by a sales manager/i,
      ),
    ).toBeInTheDocument();
  }, 20000);

  it("starts the Google OAuth flow for a new user from the register screen", async () => {
    const user = userEvent.setup();

    renderWithAuth(
      [
        {
          path: "/register",
          element: <RegisterPage />,
        },
      ],
      ["/register"],
    );

    await user.click(screen.getByRole("button", { name: "Register with Google" }));

    await waitFor(() => {
      expect(
        mockSupabaseState.supabase.auth.signInWithOAuth,
      ).toHaveBeenCalledTimes(1);
    });

    expect(mockSupabaseState.supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    expect(
      await screen.findByText("Redirecting to Google sign-up..."),
    ).toBeInTheDocument();
  });

  it("blocks an inactive user with the login guard and returns them to login", async () => {
    mockSupabaseState.supabase = createSupabaseMock({
      session: {
        user: {
          id: "inactive-user-id",
          email: "inactive@example.com",
          user_metadata: {},
          app_metadata: {},
        },
      },
      profileById: {
        userid: "inactive-user-id",
        username: "inactive_user",
        email: "inactive@example.com",
        first_name: "Inactive",
        last_name: "User",
        user_type: "USER",
        record_status: "INACTIVE",
      },
    });

    renderWithAuth(
      [
        {
          path: "/login",
          element: <LoginPage />,
        },
        {
          element: <ProtectedRoute />,
          children: [
            {
              path: "/sales",
              element: <div>Protected sales area</div>,
            },
          ],
        },
      ],
      ["/sales"],
    );

    expect(
      await screen.findByText("Your account is pending activation by a Sales Manager."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Protected sales area")).not.toBeInTheDocument();
    expect(mockSupabaseState.supabase.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it("allows an active user through the login guard into protected routes", async () => {
    mockSupabaseState.supabase = createSupabaseMock({
      session: {
        user: {
          id: "active-user-id",
          email: "active@example.com",
          user_metadata: {},
          app_metadata: {},
        },
      },
      profileById: {
        userid: "active-user-id",
        username: "active_user",
        email: "active@example.com",
        first_name: "Active",
        last_name: "User",
        user_type: "USER",
        record_status: "ACTIVE",
      },
    });

    renderWithAuth(
      [
        {
          path: "/login",
          element: <LoginPage />,
        },
        {
          element: <ProtectedRoute />,
          children: [
            {
              path: "/sales",
              element: <div>Protected sales area</div>,
            },
          ],
        },
      ],
      ["/sales"],
    );

    expect(await screen.findByText("Protected sales area")).toBeInTheDocument();
    expect(mockSupabaseState.supabase.auth.signOut).not.toHaveBeenCalled();
  });
});
