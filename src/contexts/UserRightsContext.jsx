import { useEffect, useMemo, useState } from "react";
import { UserRightsContext } from "./user-rights-context.js";
import { useAuth } from "../hooks/useAuth.js";
import { supabase } from "../lib/supabaseClient.js";

function mapRights(rows) {
  return (rows ?? []).reduce((rightsMap, row) => {
    rightsMap[row.right_code] = row.right_value === 1;
    return rightsMap;
  }, {});
}

function getCurrentUserId(currentUser) {
  return currentUser?.userid ?? currentUser?.userId ?? currentUser?.id ?? null;
}

export function UserRightsProvider({ children }) {
  const { currentUser, isAuthLoading } = useAuth();
  const [rights, setRights] = useState({});
  const [rightsError, setRightsError] = useState("");
  const [isRightsLoading, setIsRightsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadRights() {
      if (isAuthLoading) {
        if (active) {
          setIsRightsLoading(true);
        }
        return;
      }

      const currentUserId = getCurrentUserId(currentUser);

      if (!supabase || !currentUserId) {
        if (active) {
          setRights({});
          setRightsError("");
          setIsRightsLoading(false);
        }
        return;
      }

      try {
        if (active) {
          setIsRightsLoading(true);
          setRightsError("");
        }

        const { data, error } = await supabase
          .from("user_module_rights")
          .select("right_code, right_value")
          .eq("userid", currentUserId);

        if (error) {
          throw error;
        }

        if (active) {
          setRights(mapRights(data));
          setIsRightsLoading(false);
        }
      } catch (error) {
        if (active) {
          setRights({});
          setRightsError(error.message ?? "Unable to load user rights.");
          setIsRightsLoading(false);
        }
      }
    }

    void loadRights();

    return () => {
      active = false;
    };
  }, [currentUser, isAuthLoading]);

  const userType = String(currentUser?.user_type ?? "").toUpperCase();
  const value = useMemo(
    () => ({
      rights,
      userType,
      isRightsLoading: isAuthLoading || isRightsLoading,
      rightsError,
      hasRight: (rightCode) => Boolean(rights[rightCode]),
      canAccessDeletedItems:
        userType === "ADMIN" || userType === "SUPERADMIN",
    }),
    [isAuthLoading, isRightsLoading, rights, rightsError, userType],
  );

  return (
    <UserRightsContext.Provider value={value}>
      {children}
    </UserRightsContext.Provider>
  );
}
