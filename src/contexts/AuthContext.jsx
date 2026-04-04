import { useCallback, useEffect, useRef, useState } from "react";
import { AuthContext } from "./auth-context.js";
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
    return null;
  }

  const selectClause =
    "userid, username, email, first_name, last_name, user_type, record_status";

  const byId = await supabase
    .from("user")
    .select(selectClause)
    .eq("userid", authUser.id)
    .maybeSingle();

  if (byId.error && !isMissingRowError(byId.error)) {
    throw byId.error;
  }

  if (byId.data) {
    return byId.data;
  }

  if (!authUser.email) {
    return null;
  }

  const byEmail = await supabase
    .from("user")
    .select(selectClause)
    .eq("email", authUser.email)
    .maybeSingle();

  if (byEmail.error && !isMissingRowError(byEmail.error)) {
    throw byEmail.error;
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
  const scheduledSyncIdRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const clearSessionState = useCallback(async () => {
    setSession(null);
    setCurrentUser(null);
    sessionRef.current = null;
    currentUserRef.current = null;
  }, []);

  const syncSession = useCallback(async (
    nextSession,
    { blockUI = true } = {},
  ) => {
    setSession(nextSession ?? null);
    sessionRef.current = nextSession ?? null;

    if (!supabase || !nextSession?.user) {
      setCurrentUser(null);
      currentUserRef.current = null;
      setIsAuthLoading(false);
      return;
    }

    try {
      const profile = await readAppUser(nextSession.user);

      if (!profile) {
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

      setCurrentUser(mergedUser);
      currentUserRef.current = mergedUser;
      setGuardReason("");
      setAuthError("");
      setIsAuthLoading(false);
    } catch (error) {
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

  const scheduleSessionSync = useCallback((nextSession, options) => {
    scheduledSyncIdRef.current += 1;
    const syncId = scheduledSyncIdRef.current;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;

      if (syncId !== scheduledSyncIdRef.current) {
        return;
      }

      void syncSession(nextSession, options);
    }, 0);
  }, [syncSession]);

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      if (!supabase) {
        if (active) {
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
          scheduleSessionSync(data.session, {
            blockUI: true,
            source: "initialize:getSession",
          });
        }
      } catch (error) {
        if (active) {
          setAuthError(
            error.message ?? "Unable to initialize the authentication session.",
          );
          setIsAuthLoading(false);
        }
      }
    }

    const subscription = supabase?.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!active) {
          return;
        }

        if (event === "SIGNED_OUT") {
          void clearSessionState();
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

        if (shouldBlock) {
          setIsAuthLoading(true);
        }

        scheduleSessionSync(nextSession, {
          blockUI: shouldBlock,
          source: `state:${event}`,
        });
      },
    );

    void initializeAuth();

    return () => {
      active = false;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      subscription?.data.subscription.unsubscribe();
    };
  }, [scheduleSessionSync, clearSessionState]);

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

    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildAuthCallbackUrl(),
      },
    });
  }

  async function signOutUser() {
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
