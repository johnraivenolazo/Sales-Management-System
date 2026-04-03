import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

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
    "userId, username, email, first_name, last_name, user_type, record_status";

  const byId = await supabase
    .from("user")
    .select(selectClause)
    .eq("userId", authUser.id)
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

  const clearSessionState = useCallback(async () => {
    setSession(null);
    setCurrentUser(null);
  }, []);

  const syncSession = useCallback(async (nextSession) => {
    setSession(nextSession ?? null);

    if (!supabase || !nextSession?.user) {
      setCurrentUser(null);
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

      setCurrentUser(mergeAuthUser(nextSession.user, profile));
      setGuardReason("");
      setAuthError("");
      setIsAuthLoading(false);
    } catch (error) {
      setCurrentUser(null);
      setAuthError(error.message ?? "Unable to load the current user.");
      setGuardReason("profile_error");
      setIsAuthLoading(false);
    }
  }, [clearSessionState]);

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
          await syncSession(data.session);
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
      async (event, nextSession) => {
        if (!active) {
          return;
        }

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
      return {
        data: null,
        error: new Error(
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.",
        ),
      };
    }

    setAuthError("");
    setGuardReason("");

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
    refreshCurrentUser: () => syncSession(session),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
