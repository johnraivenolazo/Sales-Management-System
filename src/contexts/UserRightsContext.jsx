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

function hasEnabledRight(rightsMap, rightCode) {
  return Boolean(rightsMap[rightCode]);
}

export function UserRightsProvider({ children }) {
  const { currentUser, isAuthLoading } = useAuth();
  const [rights, setRights] = useState({});
  const [rightsError, setRightsError] = useState("");
  const [isRightsLoading, setIsRightsLoading] = useState(true);
  const currentUserId = getCurrentUserId(currentUser);

  useEffect(() => {
    let active = true;

    async function loadRights() {
      if (isAuthLoading) {
        if (active) {
          setIsRightsLoading(true);
        }
        return;
      }

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
  }, [currentUserId, isAuthLoading]);

  const userType = String(currentUser?.user_type ?? "").toUpperCase();
  const isUser = userType === "USER";
  const isAdmin = userType === "ADMIN";
  const isSuperadmin = userType === "SUPERADMIN";
  const value = useMemo(
    () => ({
      rights,
      userType,
      isUser,
      isAdmin,
      isSuperadmin,
      isRightsLoading: isAuthLoading || isRightsLoading,
      rightsError,
      hasRight: (rightCode) => hasEnabledRight(rights, rightCode),
      canViewSales: hasEnabledRight(rights, "SALES_VIEW"),
      canCreateSales: hasEnabledRight(rights, "SALES_ADD"),
      canEditSales: hasEnabledRight(rights, "SALES_EDIT"),
      canDeleteSales: hasEnabledRight(rights, "SALES_DEL"),
      canViewSalesDetail: hasEnabledRight(rights, "SD_VIEW"),
      canCreateSalesDetail: hasEnabledRight(rights, "SD_ADD"),
      canEditSalesDetail: hasEnabledRight(rights, "SD_EDIT"),
      canDeleteSalesDetail: hasEnabledRight(rights, "SD_DEL"),
      canAccessAdmin: hasEnabledRight(rights, "ADM_USER"),
      canViewCustomerLookup: hasEnabledRight(rights, "CUST_LOOKUP"),
      canViewEmployeeLookup: hasEnabledRight(rights, "EMP_LOOKUP"),
      canViewProductLookup: hasEnabledRight(rights, "PROD_LOOKUP"),
      canViewPriceLookup: hasEnabledRight(rights, "PRICE_LOOKUP"),
      canAccessDeletedItems: hasEnabledRight(rights, "DELETED_VIEW"),
      canSeeStamp: !isUser,
    }),
    [isAdmin, isAuthLoading, isRightsLoading, isSuperadmin, isUser, rights, rightsError, userType],
  );

  return (
    <UserRightsContext.Provider value={value}>
      {children}
    </UserRightsContext.Provider>
  );
}
