import { useContext } from "react";
import { UserRightsContext } from "../contexts/user-rights-context.js";

export function useRights() {
  const context = useContext(UserRightsContext);

  if (!context) {
    throw new Error("useRights must be used within a UserRightsProvider.");
  }

  return context;
}
