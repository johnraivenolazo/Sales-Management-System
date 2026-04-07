import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { cn } from "@/lib/utils.js";
import { getUserRights, saveUserRights, saveUserRole } from "../../services/adminService.js";
import { canManageUserRights, canManageUserRole, createEmptyRightsMap, RIGHTS_SECTIONS } from "./userRightsConfig.js";

function normalizeUserType(userType) {
  return String(userType ?? "USER").toUpperCase();
}

function ToggleSwitch({ ariaLabel, checked, disabled, onToggle }) {
  return (
    <button
      aria-checked={checked}
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border p-1 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/15 focus-visible:ring-offset-2",
        checked
          ? "border-emerald-500/25 bg-emerald-500 shadow-[inset_0_1px_3px_rgba(15,23,42,0.24)]"
          : "border-slate-900/10 bg-slate-300 shadow-[inset_0_1px_3px_rgba(15,23,42,0.12)]",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
      disabled={disabled}
      onClick={onToggle}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          "size-6 rounded-full bg-white shadow-[0_4px_14px_rgba(15,23,42,0.18)] transition-transform duration-200 ease-out",
          checked ? "translate-x-6" : "translate-x-0",
        )}
      />
    </button>
  );
}

function RightsToggle({ disabled, enabled, onToggle, right }) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-[1.4rem] border px-4 py-4 text-left transition",
        enabled
          ? "border-emerald-700/15 bg-emerald-50/70"
          : "border-slate-900/8 bg-white",
        disabled ? "opacity-70" : "",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{right.label}</span>
          <Badge className="rounded-full border border-slate-900/10 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 hover:bg-white">
            {right.code}
          </Badge>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">{right.description}</p>
      </div>
      <ToggleSwitch
        ariaLabel={`Toggle ${right.label}`}
        checked={enabled}
        disabled={disabled}
        onToggle={onToggle}
      />
    </div>
  );
}

function RoleToggle({ disabled, enabled, onToggle, userType }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-900/5 bg-slate-50/90 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Role</p>
          <p className="mt-1 text-sm text-slate-500">
            Superadmin can flip this account between USER and ADMIN.
          </p>
        </div>
        <Badge className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white hover:bg-slate-950">
          {userType}
        </Badge>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span
          className={cn(
            "rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] transition",
            enabled
              ? "border-slate-900/10 bg-white text-slate-500"
              : "border-slate-950 bg-slate-950 text-white",
          )}
        >
          USER
        </span>
        <ToggleSwitch
          ariaLabel="Toggle user role between USER and ADMIN"
          checked={enabled}
          disabled={disabled}
          onToggle={onToggle}
        />
        <span
          className={cn(
            "rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] transition",
            enabled
              ? "border-slate-950 bg-slate-950 text-white"
              : "border-slate-900/10 bg-white text-slate-500",
          )}
        >
          ADMIN
        </span>
      </div>
    </div>
  );
}

function RoleStatusChip({ status }) {
  if (status === "saving") {
    return (
      <Badge className="rounded-full border border-amber-900/10 bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-900 hover:bg-amber-100">
        Saving
      </Badge>
    );
  }

  if (status === "saved") {
    return (
      <Badge className="rounded-full border border-emerald-700/15 bg-emerald-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-800 hover:bg-emerald-100">
        Saved
      </Badge>
    );
  }

  return null;
}

function getDisplayName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.username || user?.email || user?.userId || "Unknown user";
}

export function UserRightsEditor({ onClose, onSaved, user, viewerUserType }) {
  const [draftRights, setDraftRights] = useState(() => createEmptyRightsMap());
  const [draftUserType, setDraftUserType] = useState(() => normalizeUserType(user?.userType));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRoleSaving, setIsRoleSaving] = useState(false);
  const [roleStatus, setRoleStatus] = useState("idle");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setDraftUserType(normalizeUserType(user?.userType));
  }, [user?.userType]);

  useEffect(() => {
    if (roleStatus !== "saved") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setRoleStatus("idle");
    }, 1400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [roleStatus]);

  useEffect(() => {
    let active = true;

    async function loadRights() {
      if (!user?.userId) {
        if (active) {
          setDraftRights(createEmptyRightsMap());
          setError("");
          setIsLoading(false);
          setSuccessMessage("");
        }
        return;
      }

      try {
        if (active) {
          setIsLoading(true);
          setError("");
          setSuccessMessage("");
        }

        const rows = await getUserRights(user.userId);
        const nextRights = createEmptyRightsMap();

        rows.forEach((row) => {
          nextRights[row.rightCode] = row.rightValue === 1;
        });

        if (active) {
          setDraftRights(nextRights);
          setIsLoading(false);
        }
      } catch (nextError) {
        if (active) {
          setDraftRights(createEmptyRightsMap());
          setError(nextError.message ?? "Unable to load rights.");
          setIsLoading(false);
        }
      }
    }

    void loadRights();

    return () => {
      active = false;
    };
  }, [user?.userId]);

  const enabledCount = useMemo(
    () => Object.values(draftRights).filter(Boolean).length,
    [draftRights],
  );

  const normalizedUserType = normalizeUserType(user?.userType);
  const isLocked = normalizedUserType === "SUPERADMIN";
  const canManageTarget = canManageUserRights(viewerUserType, normalizedUserType);
  const canManageRole = canManageUserRole(viewerUserType, normalizedUserType);

  async function handleRoleToggle() {
    if (!user?.userId || isLocked || !canManageRole || isSaving || isRoleSaving) {
      return;
    }

    const nextUserType = draftUserType === "ADMIN" ? "USER" : "ADMIN";
    const previousUserType = draftUserType;

    setDraftUserType(nextUserType);
    setIsRoleSaving(true);
    setRoleStatus("saving");
    setError("");
    setSuccessMessage("");

    try {
      await saveUserRole(user.userId, nextUserType, `ROLE ${user.userId} ${new Date().toISOString()}`);
      setSuccessMessage(`Role updated to ${nextUserType}.`);
      setRoleStatus("saved");
      onSaved?.();
    } catch (nextError) {
      setDraftUserType(previousUserType);
      setRoleStatus("idle");
      setError(nextError.message ?? "Unable to save role.");
    } finally {
      setIsRoleSaving(false);
    }
  }

  async function handleSave() {
    if (!user?.userId || isLocked || !canManageTarget || isRoleSaving) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await saveUserRights(
        user.userId,
        draftRights,
        `RIGHTS ${user.userId} ${new Date().toISOString()}`,
      );
      setSuccessMessage("Permissions saved.");
      onSaved?.();
    } catch (nextError) {
      setError(nextError.message ?? "Unable to save rights.");
    } finally {
      setIsSaving(false);
    }
  }

  function toggleRight(rightCode) {
    if (isLocked || !canManageTarget || isRoleSaving) {
      return;
    }

    setDraftRights((currentRights) => ({
      ...currentRights,
      [rightCode]: !currentRights[rightCode],
    }));
  }

  if (!user) {
    return null;
  }

  if (!canManageTarget) {
    return (
      <Card className="rounded-[2rem] border-slate-900/5 bg-white/95 shadow-sm">
        <CardContent className="grid gap-4 p-5 sm:p-6">
          <div>
            <Badge className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white hover:bg-slate-950">
              Permission editor
            </Badge>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
              {getDisplayName(user)}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {user.email || "No email saved"} · {user.userId}
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-rose-900/10 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            You do not have permission to edit this account's rights.
          </div>

          <div className="flex justify-end">
            <Button
              className="rounded-full border border-slate-900/10 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900/20 hover:bg-white"
              onClick={onClose}
              type="button"
              variant="outline"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] border-slate-900/5 bg-white/95 shadow-sm">
      <CardContent className="grid gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white hover:bg-slate-950">
              Permission editor
            </Badge>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
              {getDisplayName(user)}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {user.email || "No email saved"} · {user.userId}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-100">
              {String(user.userType ?? "USER").toUpperCase()}
            </Badge>
            <Badge className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-900 hover:bg-amber-100">
              {enabledCount} enabled
            </Badge>
          </div>
        </div>

        {successMessage ? (
          <Alert className="rounded-[1.4rem] border-emerald-200 bg-emerald-50 text-emerald-900">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert className="rounded-[1.4rem] border-rose-200 bg-rose-50 text-rose-900" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {isLocked ? (
          <div className="rounded-[1.4rem] border border-violet-900/10 bg-violet-50 px-4 py-3 text-sm text-violet-900">
            SUPERADMIN accounts are locked and cannot be edited.
          </div>
        ) : null}

        {canManageRole && !isLocked ? (
          <RoleToggle
            disabled={isLoading || isSaving || isRoleSaving}
            enabled={draftUserType === "ADMIN"}
            onToggle={() => void handleRoleToggle()}
            userType={draftUserType}
          />
        ) : null}

        {canManageRole && !isLocked ? (
          <div className="flex justify-end pr-1">
            <RoleStatusChip status={roleStatus} />
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-[1.4rem] border border-slate-900/5 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Loading rights...
          </div>
        ) : (
          <div className="grid gap-4">
            {RIGHTS_SECTIONS.map((section) => (
              <section
                className="rounded-[1.6rem] border border-slate-900/5 bg-slate-50/80 p-4"
                key={section.key}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      {section.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Toggle the actions available to this account.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {section.rights.map((right) => (
                    <RightsToggle
                      disabled={isSaving || isLocked}
                      enabled={Boolean(draftRights[right.code])}
                      key={right.code}
                      onToggle={() => toggleRight(right.code)}
                      right={right}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            className="rounded-full border border-slate-900/10 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900/20 hover:bg-white"
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Close
          </Button>
          <Button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isSaving || isLoading || isLocked || isRoleSaving}
            onClick={() => void handleSave()}
            type="button"
          >
            {isSaving ? "Saving..." : "Save permissions"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
