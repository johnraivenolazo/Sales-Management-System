import { useCallback, useEffect, useRef, useState } from "react";
import { AuthContext } from "./auth-context.js";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient.js";
import { logAuthDebug } from "../lib/authDebug.js";

function buildAuthCallbackUrl() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}/auth/callback`;
}

function isMissingRowError(error) {
  return error?.code === "PGRST116";
}

function summarizeSession(nextSession) {
  return {
    hasSession: Boolean(nextSession),
    authUserId: nextSession?.user?.id ?? null,
    email: nextSession?.user?.email ?? null,
  };
}

function summarizeProfile(profile) {
  return {
    userid: profile?.userid ?? null,
    email: profile?.email ?? null,
    user_type: profile?.user_type ?? null,
    record_status: profile?.record_status ?? null,
  };
}

async function readAppUser(authUser) {
  if (!supabase || !authUser) {
    logAuthDebug("readAppUser.skipped", {
      hasSupabase: Boolean(supabase),
      authUserId: authUser?.id ?? null,
    });
    return null;
  }

  const selectClause =
    "userid, username, email, first_name, last_name, user_type, record_status";

  logAuthDebug("readAppUser.start", {
    authUserId: authUser.id,
    email: authUser.email ?? null,
  });

  const byId = await supabase
    .from("user")
    .select(selectClause)
    .eq("userid", authUser.id)
    .maybeSingle();

  if (byId.error && !isMissingRowError(byId.error)) {
    logAuthDebug("readAppUser.byId.error", {
      authUserId: authUser.id,
      error: byId.error,
    });
    throw byId.error;
  }

  if (byId.data) {
    logAuthDebug("readAppUser.byId.hit", {
      authUserId: authUser.id,
      profile: summarizeProfile(byId.data),
    });
    return byId.data;
  }

  if (!authUser.email) {
    logAuthDebug("readAppUser.byEmail.skipped", {
      authUserId: authUser.id,
      reason: "missing_email",
    });
    return null;
  }

  const byEmail = await supabase
    .from("user")
    .select(selectClause)
    .eq("email", authUser.email)
    .maybeSingle();

  if (byEmail.error && !isMissingRowError(byEmail.error)) {
    logAuthDebug("readAppUser.byEmail.error", {
      authUserId: authUser.id,
      email: authUser.email,
      error: byEmail.error,
    });
    throw byEmail.error;
  }

  if (byEmail.data) {
    logAuthDebug("readAppUser.byEmail.hit", {
      authUserId: authUser.id,
      email: authUser.email,
      profile: summarizeProfile(byEmail.data),
    });
  } else {
    logAuthDebug("readAppUser.miss", {
      authUserId: authUser.id,
      email: authUser.email,
    });
  }

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
  const currentUserRef = useRef(null);
  const sessionRef = useRef(null);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const clearSessionState = useCallback(async () => {
    logAuthDebug("session.clear", {});
    setSession(null);
    setCurrentUser(null);
    sessionRef.current = null;
    currentUserRef.current = null;
  }, []);

  const syncSession = useCallback(async (
    nextSession,
    { blockUI = true, source = "unknown" } = {},
  ) => {
    logAuthDebug("session.sync.mode", {
      source,
      blockUI,
      currentUserId:
        currentUserRef.current?.id ?? currentUserRef.current?.userid ?? null,
    });
    logAuthDebug("session.sync.start", summarizeSession(nextSession));
    setSession(nextSession ?? null);
    sessionRef.current = nextSession ?? null;

    if (!supabase || !nextSession?.user) {
      logAuthDebug("session.sync.empty", {
        hasSupabase: Boolean(supabase),
        ...summarizeSession(nextSession),
      });
      setCurrentUser(null);
      currentUserRef.current = null;
      setIsAuthLoading(false);
      return;
    }

    try {
      const profile = await readAppUser(nextSession.user);

      if (!profile) {
        logAuthDebug("session.sync.missingProfile", summarizeSession(nextSession));
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
          ...summarizeSession(nextSession),
          profile: summarizeProfile(profile),
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

      const mergedUser = mergeAuthUser(nextSession.user, profile);

      logAuthDebug("session.sync.success", {
        ...summarizeSession(nextSession),
        profile: summarizeProfile(profile),
      });
      setCurrentUser(mergedUser);
      currentUserRef.current = mergedUser;
      setGuardReason("");
      setAuthError("");
      setIsAuthLoading(false);
    } catch (error) {
      logAuthDebug("session.sync.error", {
        ...summarizeSession(nextSession),
        error,
        source,
        blockUI,
      });

      if (!blockUI && currentUserRef.current) {
        setAuthError(error.message ?? "Unable to refresh the current user.");
        setGuardReason("profile_refresh_error");
        setIsAuthLoading(false);
        return;
      }

      setCurrentUser(null);
      currentUserRef.current = null;
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
        hasSupabase: Boolean(supabase),
      });

      if (!supabase) {
        if (active) {
          logAuthDebug("auth.initialize.noSupabase", {});
          setIsAuthLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (active) {
          logAuthDebug("auth.initialize.getSession.result", summarizeSession(data.session));
          await syncSession(data.session, {
            blockUI: true,
            source: "initialize:getSession",
          });
        }
      } catch (error) {
        if (active) {
          logAuthDebug("auth.initialize.error", { error });
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
          ...summarizeSession(nextSession),
        });

        if (event === "SIGNED_OUT") {
          await clearSessionState();
          setGuardReason("");
          setAuthError("");
          setIsAuthLoading(false);
          return;
        }

        const currentAuthUserId =
          currentUserRef.current?.id ?? currentUserRef.current?.userid ?? null;
        const nextAuthUserId = nextSession?.user?.id ?? null;
        const shouldBlock =
          event === "INITIAL_SESSION" ||
          !currentAuthUserId ||
          !nextAuthUserId ||
          currentAuthUserId !== nextAuthUserId;

        logAuthDebug("auth.stateChange.syncDecision", {
          event,
          currentAuthUserId,
          nextAuthUserId,
          shouldBlock,
        });

        if (shouldBlock) {
          setIsAuthLoading(true);
        }

        await syncSession(nextSession, {
          blockUI: shouldBlock,
          source: `state:${event}`,
        });
      },
    );

    void initializeAuth();

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, [syncSession, clearSessionState]);

  useEffect(() => {
    logAuthDebug("auth.stateSnapshot", {
      hasSession: Boolean(session),
      currentUserId: currentUser?.id ?? currentUser?.userid ?? null,
      isAuthLoading,
      authError,
      guardReason,
    });
  }, [authError, currentUser, guardReason, isAuthLoading, session]);

  useEffect(() => {
    if (!isAuthLoading) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      logAuthDebug("auth.loading.stalled", {
        hasSession: Boolean(session),
        currentUserId: currentUser?.id ?? currentUser?.userid ?? null,
        authError,
        guardReason,
        href: typeof window === "undefined" ? null : window.location.href,
      });
    }, 6000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [authError, currentUser, guardReason, isAuthLoading, session]);

  async function signUpWithEmail({
    email,
    password,
    firstName,
    lastName,
    username,
  }) {
    if (!supabase) {
      return {
        data: null,
        error: new Error(
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.",
        ),
      };
    }

    setAuthError("");
    setGuardReason("");
    setIsAuthLoading(true);

    logAuthDebug("auth.signUpEmail.start", {
      email,
      username,
    });

    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildAuthCallbackUrl(),
        data: {
          first_name: firstName,
          last_name: lastName,
          username,
        },
      },
    });
  }

  async function signInWithEmail({ email, password }) {
    if (!supabase) {
      return {
        data: null,
        error: new Error(
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.",
        ),
      };
    }

    setAuthError("");
    setGuardReason("");
    setIsAuthLoading(true);

    logAuthDebug("auth.signInEmail.start", { email });

    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async function signInWithGoogle() {
    if (!supabase) {
      return {
        data: null,
        error: new Error(
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.",
        ),
      };
    }

    setAuthError("");
    setGuardReason("");
    setIsAuthLoading(true);

    logAuthDebug("auth.signInGoogle.start", {
      redirectTo: buildAuthCallbackUrl(),
    });

    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildAuthCallbackUrl(),
      },
    });
  }

  async function signOutUser() {
    logAuthDebug("auth.signOut.start", {
      hasSupabase: Boolean(supabase),
      currentUserId: currentUser?.id ?? currentUser?.userid ?? null,
    });

    if (!supabase) {
      await clearSessionState();
      return;
    }

    await supabase.auth.signOut();
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
    refreshCurrentUser: () =>
      syncSession(sessionRef.current, {
        blockUI: false,
        source: "manual:refreshCurrentUser",
      }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
