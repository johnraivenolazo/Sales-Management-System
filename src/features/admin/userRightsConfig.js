export const RIGHTS_SECTIONS = [
  {
    key: "sales",
    label: "Sales",
    rights: [
      {
        code: "SALES_VIEW",
        label: "View transactions",
        description: "Open the transaction workspace and browse sales records.",
      },
      {
        code: "SALES_ADD",
        label: "Create transaction",
        description: "Create new sales headers.",
      },
      {
        code: "SALES_EDIT",
        label: "Edit transaction",
        description: "Update sales headers before they are finalized.",
      },
      {
        code: "SALES_DEL",
        label: "Soft delete transaction",
        description: "Move a transaction to inactive status.",
      },
    ],
  },
  {
    key: "sales-detail",
    label: "Sales detail",
    rights: [
      {
        code: "SD_VIEW",
        label: "View sales detail",
        description: "Open transaction line items.",
      },
      {
        code: "SD_ADD",
        label: "Add line item",
        description: "Attach a new line item to a transaction.",
      },
      {
        code: "SD_EDIT",
        label: "Edit line item",
        description: "Change line item quantity or product.",
      },
      {
        code: "SD_DEL",
        label: "Soft delete line item",
        description: "Move a line item to inactive status.",
      },
    ],
  },
  {
    key: "lookups",
    label: "Lookups",
    rights: [
      {
        code: "CUST_LOOKUP",
        label: "View customers",
        description: "Browse customer lookup data.",
      },
      {
        code: "EMP_LOOKUP",
        label: "View employees",
        description: "Browse employee lookup data.",
      },
      {
        code: "PROD_LOOKUP",
        label: "View products",
        description: "Browse product lookup data.",
      },
      {
        code: "PRICE_LOOKUP",
        label: "View price history",
        description: "Open the price history ledger.",
      },
    ],
  },
  {
    key: "workspace",
    label: "Workspace access",
    rights: [
      {
        code: "DELETED_VIEW",
        label: "View deleted items",
        description: "Open the deleted-items recovery workspace.",
      },
      {
        code: "ADM_USER",
        label: "Manage users",
        description: "Open the admin user-management workspace.",
      },
    ],
  },
];

export const ALL_RIGHT_CODES = RIGHTS_SECTIONS.flatMap((section) =>
  section.rights.map((right) => right.code),
);

export function createEmptyRightsMap() {
  return ALL_RIGHT_CODES.reduce((rightsMap, rightCode) => {
    rightsMap[rightCode] = false;
    return rightsMap;
  }, {});
}

export function canManageUserRights(viewerUserType, targetUserType) {
  const normalizedViewerType = String(viewerUserType ?? "").toUpperCase();
  const normalizedTargetType = String(targetUserType ?? "").toUpperCase();

  if (normalizedTargetType === "SUPERADMIN") {
    return false;
  }

  if (normalizedViewerType === "SUPERADMIN") {
    return normalizedTargetType === "ADMIN" || normalizedTargetType === "USER";
  }

  if (normalizedViewerType === "ADMIN") {
    return normalizedTargetType === "USER";
  }

  return false;
}

export function canManageUserRole(viewerUserType, targetUserType) {
  const normalizedViewerType = String(viewerUserType ?? "").toUpperCase();
  const normalizedTargetType = String(targetUserType ?? "").toUpperCase();

  if (normalizedViewerType !== "SUPERADMIN") {
    return false;
  }

  return normalizedTargetType === "ADMIN" || normalizedTargetType === "USER";
}
