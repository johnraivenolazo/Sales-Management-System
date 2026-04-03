import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./auth-context.js";
import {
  clearAuthDebugLog,
  logAuthDebug,
  logAuthDebugError,
} from "../lib/authDebug.js";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient.js";

function buildAuthCallbackUrl() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}/auth/callback`;
}

function isMissingRowError(error) {
  return error?.code === "PGRST116";
}

async function readAppUser(authUser) {
  if (!supabase || !authUser) {
    logAuthDebug("readAppUser.skipped", {
      hasSupabase: Boolean(supabase),
      hasAuthUser: Boolean(authUser),
    });
    return null;
  }

  logAuthDebug("readAppUser.start", {
    authUserId: authUser.id,
    email: authUser.email,
  });

  const selectClause =
    "userId, username, email, first_name, last_name, user_type, record_status";

  const byId = await supabase
    .from("user")
    .select(selectClause)
    .eq("userId", authUser.id)
    .maybeSingle();

  if (byId.error && !isMissingRowError(byId.error)) {
    logAuthDebugError("readAppUser.byId.error", byId.error, {
      authUserId: authUser.id,
    });
    throw byId.error;
  }

  if (byId.data) {
    logAuthDebug("readAppUser.byId.hit", {
      authUserId: authUser.id,
      profileUserId: byId.data.userId,
      recordStatus: byId.data.record_status,
    });
    return byId.data;
  }

  if (!authUser.email) {
    logAuthDebug("readAppUser.noEmailFallback", {
      authUserId: authUser.id,
    });
    return null;
  }

  const byEmail = await supabase
    .from("user")
    .select(selectClause)
    .eq("email", authUser.email)
    .maybeSingle();

  if (byEmail.error && !isMissingRowError(byEmail.error)) {
    logAuthDebugError("readAppUser.byEmail.error", byEmail.error, {
      authUserId: authUser.id,
      email: authUser.email,
    });
    throw byEmail.error;
  }

  logAuthDebug("readAppUser.byEmail.result", {
    authUserId: authUser.id,
    email: authUser.email,
    found: Boolean(byEmail.data),
    recordStatus: byEmail.data?.record_status ?? null,
  });

  return byEmail.data ?? null;
}

function mergeAuthUser(authUser, profile) {
  return {
    id: authUser.id,
    email: authUser.email,
    user_metadata: authUser.user_metadata,
    app_metadata: authUser.app_metadata,
    ...profile,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [guardReason, setGuardReason] = useState("");

  const clearSessionState = useCallback(async () => {
    logAuthDebug("session.clear");
    setSession(null);
    setCurrentUser(null);
  }, []);

  const syncSession = useCallback(async (nextSession) => {
    logAuthDebug("session.sync.start", {
      hasSession: Boolean(nextSession),
      authUserId: nextSession?.user?.id ?? null,
      email: nextSession?.user?.email ?? null,
    });
    setSession(nextSession ?? null);

    if (!supabase || !nextSession?.user) {
      logAuthDebug("session.sync.noSession", {
        hasSupabase: Boolean(supabase),
      });
      setCurrentUser(null);
      setIsAuthLoading(false);
      return;
    }

    try {
      const profile = await readAppUser(nextSession.user);

      if (!profile) {
        logAuthDebug("session.sync.missingProfile", {
          authUserId: nextSession.user.id,
          email: nextSession.user.email,
        });
        setGuardReason("missing_profile");
        setAuthError(
          "Your account profile is not provisioned yet. Please contact a Sales Manager.",
        );
        await supabase.auth.signOut();
        await clearSessionState();
        setIsAuthLoading(false);
        return;
      }

      if (profile.record_status !== "ACTIVE") {
        logAuthDebug("session.sync.inactiveProfile", {
          authUserId: nextSession.user.id,
          email: nextSession.user.email,
          recordStatus: profile.record_status,
        });
        setGuardReason("not_activated");
        setAuthError(
          "Your account is pending activation by a Sales Manager.",
        );
        await supabase.auth.signOut();
        await clearSessionState();
        setIsAuthLoading(false);
        return;
      }

      logAuthDebug("session.sync.success", {
        authUserId: nextSession.user.id,
        email: nextSession.user.email,
        profileUserId: profile.userId,
        recordStatus: profile.record_status,
      });
      setCurrentUser(mergeAuthUser(nextSession.user, profile));
      setGuardReason("");
      setAuthError("");
      setIsAuthLoading(false);
    } catch (error) {
      logAuthDebugError("session.sync.error", error, {
        authUserId: nextSession?.user?.id ?? null,
        email: nextSession?.user?.email ?? null,
      });
      setCurrentUser(null);
      setAuthError(error.message ?? "Unable to load the current user.");
      setGuardReason("profile_error");
      setIsAuthLoading(false);
    }
  }, [clearSessionState]);

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      logAuthDebug("auth.initialize.start", {
        isSupabaseConfigured,
      });
      if (!supabase) {
        if (active) {
          logAuthDebug("auth.initialize.noSupabase");
          setIsAuthLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          logAuthDebugError("auth.initialize.getSession.error", error);
          throw error;
        }

        if (active) {
          logAuthDebug("auth.initialize.getSession.result", {
            hasSession: Boolean(data.session),
            authUserId: data.session?.user?.id ?? null,
            email: data.session?.user?.email ?? null,
          });
          await syncSession(data.session);
        }
      } catch (error) {
        if (active) {
          logAuthDebugError("auth.initialize.error", error);
          setAuthError(
            error.message ?? "Unable to initialize the authentication session.",
          );
          setIsAuthLoading(false);
        }
      }
    }

    const subscription = supabase?.auth.onAuthStateChange(
      async (event, nextSession) => {
        if (!active) {
          return;
        }

        logAuthDebug("auth.stateChange", {
          event,
          hasSession: Boolean(nextSession),
          authUserId: nextSession?.user?.id ?? null,
          email: nextSession?.user?.email ?? null,
        });

        if (event === "SIGNED_OUT") {
          await clearSessionState();
          setGuardReason("");
          setAuthError("");
          setIsAuthLoading(false);
          return;
        }

        setIsAuthLoading(true);
        await syncSession(nextSession);
      },
    );

    void initializeAuth();

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, [syncSession, clearSessionState]);

  async function signUpWithEmail({
    email,
    password,
    firstName,
    lastName,
    username,
  }) {
    if (!supabase) {
      logAuthDebug("auth.signUp.noSupabase", {
        email,
      });
      return {
        data: null,
        error: new Error(
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.",
        ),
      };
    }

    setAuthError("");
    setGuardReason("");

    const redirectTo = buildAuthCallbackUrl();
    logAuthDebug("auth.signUp.start", {
      email,
      username,
      redirectTo,
    });

    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          first_name: firstName,
          last_name: lastName,
          username,
        },
      },
    });

    if (result.error) {
      logAuthDebugError("auth.signUp.error", result.error, {
        email,
        username,
        redirectTo,
      });
    } else {
      logAuthDebug("auth.signUp.result", {
        email,
        username,
        hasUser: Boolean(result.data?.user),
        hasSession: Boolean(result.data?.session),
      });
    }

    return result;
  }

  async function signInWithEmail({ email, password }) {
    if (!supabase) {
      logAuthDebug("auth.signInEmail.noSupabase", {
        email,
      });
      return {
        data: null,
        error: new Error(
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.",
        ),
      };
    }

    setAuthError("");
    setGuardReason("");

    logAuthDebug("auth.signInEmail.start", {
      email,
    });

    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (result.error) {
      logAuthDebugError("auth.signInEmail.error", result.error, {
        email,
      });
    } else {
      logAuthDebug("auth.signInEmail.result", {
        email,
        hasUser: Boolean(result.data?.user),
        hasSession: Boolean(result.data?.session),
      });
    }

    return result;
  }

  async function signInWithGoogle() {
    if (!supabase) {
      logAuthDebug("auth.signInGoogle.noSupabase");
      return {
        data: null,
        error: new Error(
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.",
        ),
      };
    }

    setAuthError("");
    setGuardReason("");
    clearAuthDebugLog();

    const redirectTo = buildAuthCallbackUrl();
    logAuthDebug("auth.signInGoogle.start", {
      redirectTo,
      origin:
        typeof window !== "undefined" ? window.location.origin : null,
      href: typeof window !== "undefined" ? window.location.href : null,
    });

    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (result.error) {
      logAuthDebugError("auth.signInGoogle.error", result.error, {
        redirectTo,
      });
    } else {
      logAuthDebug("auth.signInGoogle.result", {
        redirectTo,
        hasProviderUrl: Boolean(result.data?.url),
        providerUrl: result.data?.url ?? null,
      });
    }

    return result;
  }

  async function signOutUser() {
    if (!supabase) {
      logAuthDebug("auth.signOut.noSupabase");
      await clearSessionState();
      return;
    }

    logAuthDebug("auth.signOut.start", {
      currentUserId: currentUser?.id ?? null,
      email: currentUser?.email ?? null,
    });

    const { error } = await supabase.auth.signOut();

    if (error) {
      logAuthDebugError("auth.signOut.error", error, {
        currentUserId: currentUser?.id ?? null,
        email: currentUser?.email ?? null,
      });
    } else {
      logAuthDebug("auth.signOut.result", {
        currentUserId: currentUser?.id ?? null,
        email: currentUser?.email ?? null,
      });
    }

    await clearSessionState();
    setGuardReason("");
    setAuthError("");
  }

  const value = {
    session,
    currentUser,
    isAuthLoading,
    authError,
    guardReason,
    isSupabaseConfigured,
    setAuthError,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    refreshCurrentUser: () => syncSession(session),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
