import { motion as Motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/motion.js";
import PageLoadingState from "../components/PageLoadingState.jsx";
import { useRights } from "../hooks/useRights.js";
import { activateUser, deactivateUser, getUsers } from "../services/adminService.js";
import { UserRightsEditor } from "../features/admin/UserRightsEditor.jsx";
import { canManageUserRights } from "../features/admin/userRightsConfig.js";

function StatusPill({ value }) {
  const normalizedValue = String(value ?? "ACTIVE").toUpperCase();
  const className =
    normalizedValue === "ACTIVE"
      ? "border-emerald-700/15 bg-emerald-50 text-emerald-800 hover:bg-emerald-50"
      : "border-amber-900/15 bg-amber-50 text-amber-900 hover:bg-amber-50";

  return (
    <Badge className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${className}`}>
      {normalizedValue}
    </Badge>
  );
}

function UserTypePill({ value }) {
  const normalizedValue = String(value ?? "USER").toUpperCase();
  const className =
    normalizedValue === "SUPERADMIN"
      ? "border-violet-900/15 bg-violet-50 text-violet-800 hover:bg-violet-50"
      : normalizedValue === "ADMIN"
        ? "border-sky-900/15 bg-sky-50 text-sky-800 hover:bg-sky-50"
        : "border-slate-900/10 bg-slate-100 text-slate-700 hover:bg-slate-100";

  return (
    <Badge className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${className}`}>
      {normalizedValue}
    </Badge>
  );
}

function MetricCard({ label, value, note, tone = "default" }) {
  const toneClassName =
    tone === "accent"
      ? "border-slate-950 bg-slate-950 text-white"
      : tone === "warm"
        ? "border-amber-900/10 bg-[#f1e5cf] text-slate-900"
        : "border-white/80 bg-white text-slate-900";
  const badgeClassName = tone === "accent"
    ? "bg-amber-300/15 text-amber-200 hover:bg-amber-300/15"
    : "bg-amber-100 text-amber-900 hover:bg-amber-100";
  const noteClassName = tone === "accent" ? "text-white/75" : "text-slate-600";

  return (
    <Motion.div variants={fadeUp}>
      <Card className={`rounded-[1.4rem] shadow-sm ${toneClassName}`}>
        <CardContent className="space-y-3 p-4">
          <Badge className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${badgeClassName}`}>
            {label}
          </Badge>
          <p className="text-2xl font-black tracking-tight sm:text-3xl">{value}</p>
          {note ? <p className={`text-xs leading-5 sm:text-sm ${noteClassName}`}>{note}</p> : null}
        </CardContent>
      </Card>
    </Motion.div>
  );
}

function AccessDeniedState() {
  return (
    <Card className="rounded-[2rem] border-amber-900/10 bg-white/94 shadow-sm">
      <CardContent className="p-8">
        <Badge className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-900 hover:bg-amber-100">
          Admin access
        </Badge>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
          You do not have access to user management.
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Only admin-capable roles can manage users.
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="rounded-[2rem] border-dashed border-slate-900/10 bg-white/94 shadow-sm">
      <CardContent className="p-10 text-center">
        <Badge className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-900 hover:bg-amber-100">
          No users found
        </Badge>
        <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
          No accounts matched the current filters.
        </h3>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Change the search query, status, or role filter to widen the visible admin user set.
        </p>
      </CardContent>
    </Card>
  );
}

function getDisplayName(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.username || user.email || user.userId;
}

function AdminUsersPage() {
  const { canAccessAdmin, canSeeStamp, isRightsLoading, userType } = useRights();
  const currentUserType = String(userType ?? "").toUpperCase();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [processingKey, setProcessingKey] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        if (active) {
          setIsLoading(true);
          setError("");
        }

        const rows = await getUsers();

        if (!active) {
          return;
        }

        setUsers(rows);
        setIsLoading(false);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setUsers([]);
        setError(nextError.message ?? "Unable to load the admin user list.");
        setIsLoading(false);
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, [refreshToken]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        getDisplayName(user).toLowerCase().includes(normalizedQuery) ||
        String(user.email ?? "").toLowerCase().includes(normalizedQuery) ||
        String(user.userId ?? "").toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === "ALL" || user.userType === roleFilter;
      const matchesStatus = statusFilter === "ALL" || user.recordStatus === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, users]);

  const metrics = useMemo(
    () => ({
      total: filteredUsers.length,
      active: filteredUsers.filter((user) => user.recordStatus === "ACTIVE").length,
      inactive: filteredUsers.filter((user) => user.recordStatus !== "ACTIVE").length,
      locked: filteredUsers.filter((user) => user.userType === "SUPERADMIN").length,
    }),
    [filteredUsers],
  );

  const selectedUser = useMemo(
    () => users.find((user) => user.userId === selectedUserId) ?? null,
    [selectedUserId, users],
  );
  const canManageSelectedUser = canManageUserRights(currentUserType, selectedUser?.userType);

  async function handleStatusChange(user, nextStatus) {
    const actionKey = `${user.userId}-${nextStatus}`;
    setProcessingKey(actionKey);
    setError("");

    try {
      if (nextStatus === "ACTIVE") {
        await activateUser(user.userId, `ACTIVATE ${user.userId}`);
      } else {
        await deactivateUser(user.userId, `DEACTIVATE ${user.userId}`);
      }

      setRefreshToken((currentValue) => currentValue + 1);
    } catch (nextError) {
      setError(nextError.message ?? `Unable to update ${user.userId}.`);
    } finally {
      setProcessingKey("");
    }
  }

  function openRightsEditor(user) {
    setSelectedUserId(user.userId);
  }

  function closeRightsEditor() {
    setSelectedUserId("");
  }

  if (isRightsLoading || isLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Admin users"
        title="Loading users"
        description="Getting the latest account list."
      />
    );
  }

  if (!canAccessAdmin) {
    return <AccessDeniedState />;
  }

  return (
    <Motion.div
      animate="show"
      className="grid min-w-0 gap-4 xl:min-h-[calc(100dvh-8.5rem)] xl:grid-rows-[auto_auto_minmax(24rem,1fr)]"
      initial="hidden"
      variants={staggerContainer}
    >
      <Motion.section className="min-w-0" variants={scaleIn}>
        <Card className="overflow-hidden rounded-[2.6rem] border-white/80 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0">
            <div className="border-b border-slate-900/6 bg-[linear-gradient(135deg,#0d1220_0%,#1c2439_42%,#2f425f_100%)] px-5 py-5 text-white sm:px-7">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300 hover:bg-white/10">
                  Admin
                </Badge>
                <Badge className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72 hover:bg-white/8">
                  SUPERADMIN locked
                </Badge>
              </div>
              <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,25rem)] xl:items-end">
                <div className="min-w-0 max-w-2xl">
                  <h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-[2.6rem]">
                    Manage users
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 sm:text-[15px]">
                    Activate, deactivate, and audit account status. SUPERADMIN rows stay locked.
                  </p>
                </div>
                <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/8 px-4 py-3 text-sm leading-6 text-white/72 backdrop-blur-sm">
                    Search and update account status from one workspace.
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/8 px-4 py-3 text-sm leading-6 text-white/72 backdrop-blur-sm">
                    SUPERADMIN rows stay visible for audits and remain locked.
                  </div>
                </div>
              </div>
            </div>

            <Motion.div
              className="grid min-w-0 gap-3 bg-[#efe3cd] px-5 py-4 sm:grid-cols-2 xl:grid-cols-4 xl:px-7"
              variants={staggerContainer}
            >
              <MetricCard label="Users in view" value={metrics.total} />
              <MetricCard label="Active" note="Can sign in" tone="warm" value={metrics.active} />
              <MetricCard label="Inactive" note="Needs activation" tone="warm" value={metrics.inactive} />
              <MetricCard label="Locked rows" note="SUPERADMIN" tone="accent" value={metrics.locked} />
            </Motion.div>
          </div>
        </Card>
      </Motion.section>

      {selectedUser && canManageSelectedUser ? (
        <Motion.section className="min-w-0" variants={fadeUp}>
          <UserRightsEditor
            onClose={closeRightsEditor}
            onSaved={() => setRefreshToken((currentValue) => currentValue + 1)}
            viewerUserType={currentUserType}
            user={selectedUser}
          />
        </Motion.section>
      ) : null}

      <Motion.section className="min-w-0" variants={fadeUp}>
        <Card className="rounded-[2rem] border-white/80 bg-white/94 shadow-sm">
          <CardContent className="grid gap-3 p-4 xl:grid-cols-[1.5fr_0.8fr_0.8fr]">
            <label className="grid gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Search
              </span>
              <Input
                className="h-11 rounded-2xl border-slate-200 bg-slate-50 px-4 text-sm focus-visible:border-slate-900 focus-visible:ring-slate-950/10"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, email, or user ID"
                type="search"
                value={query}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Role
              </span>
              <select
                className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                onChange={(event) => setRoleFilter(event.target.value)}
                value={roleFilter}
              >
                <option value="ALL">All roles</option>
                <option value="SUPERADMIN">SUPERADMIN</option>
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Status
              </span>
              <select
                className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                onChange={(event) => setStatusFilter(event.target.value)}
                value={statusFilter}
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
          </CardContent>
        </Card>
      </Motion.section>

      {error ? (
        <Motion.div variants={fadeUp}>
          <Alert className="rounded-[1.6rem] border-rose-200 bg-rose-50 text-rose-900" variant="destructive">
            <AlertTitle>Admin update issue</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Motion.div>
      ) : null}

      {filteredUsers.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-4 xl:hidden">
            {filteredUsers.map((user) => {
              const isSuperadmin = user.userType === "SUPERADMIN";
              const isActive = user.recordStatus === "ACTIVE";
              const isBusy =
                processingKey === `${user.userId}-ACTIVE` ||
                processingKey === `${user.userId}-INACTIVE`;

              return (
                <Motion.article key={user.userId} variants={fadeUp}>
                  <Card className="rounded-[1.8rem] border-white/80 bg-white/95 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <Badge className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-900 hover:bg-amber-100">
                            {user.userId}
                          </Badge>
                          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                            {getDisplayName(user)}
                          </h3>
                          <p className="mt-2 text-sm text-slate-600">{user.email || "No email saved"}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <UserTypePill value={user.userType} />
                          <StatusPill value={user.recordStatus} />
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                        <p>
                          Username:{" "}
                          <span className="font-semibold text-slate-900">{user.username || "N/A"}</span>
                        </p>
                        {canSeeStamp ? (
                          <p>
                            Stamp:{" "}
                            <span className="font-semibold text-slate-900">{user.stamp || "N/A"}</span>
                          </p>
                        ) : null}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button
                          className="rounded-full border-emerald-700/15 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          disabled={isSuperadmin || isActive || isBusy}
                          onClick={() => handleStatusChange(user, "ACTIVE")}
                          type="button"
                          variant="outline"
                        >
                          {isBusy && !isActive ? "Updating..." : "Activate"}
                        </Button>
                        <Button
                          className="rounded-full border-rose-900/15 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          disabled={isSuperadmin || !isActive || isBusy}
                          onClick={() => handleStatusChange(user, "INACTIVE")}
                          type="button"
                          variant="outline"
                        >
                          {isBusy && isActive ? "Updating..." : "Deactivate"}
                        </Button>
                        {canManageUserRights(currentUserType, user.userType) ? (
                          <Button
                            className="rounded-full border-slate-900/10 bg-slate-100 text-slate-800 hover:bg-slate-200"
                            onClick={() => openRightsEditor(user)}
                            type="button"
                            variant="outline"
                          >
                            Permissions
                          </Button>
                        ) : null}
                        {currentUserType === "SUPERADMIN" ? (
                          <Badge className="rounded-full border-violet-900/15 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-800 hover:bg-violet-50">
                            Locked account
                          </Badge>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </Motion.article>
              );
            })}
          </div>

          <Motion.section className="hidden min-h-0 min-w-0 xl:block" variants={fadeUp}>
            <Card className="flex min-h-[24rem] min-w-0 overflow-hidden rounded-[2rem] border-white/80 bg-white/95 shadow-sm xl:h-full">
              <CardContent className="flex min-h-0 flex-1 p-0">
                <div className="app-scrollbar workspace-table-scroll min-h-0 min-w-0 flex-1">
                  <Table className="table-fixed [&_td]:break-words [&_td]:whitespace-normal [&_th]:whitespace-normal">
                  <TableHeader className="sticky top-0 z-10 bg-slate-950">
                    <TableRow className="border-slate-900/5 hover:bg-slate-950">
                      <TableHead className="w-[30%] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">User</TableHead>
                      <TableHead className="w-[12%] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">Role</TableHead>
                      <TableHead className="w-[12%] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">Status</TableHead>
                      <TableHead className="w-[14%] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">Username</TableHead>
                      {canSeeStamp ? (
                        <TableHead className="w-[16%] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">Stamp</TableHead>
                      ) : null}
                      <TableHead className="w-[16%] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const isSuperadmin = user.userType === "SUPERADMIN";
                      const isActive = user.recordStatus === "ACTIVE";
                      const isBusy =
                        processingKey === `${user.userId}-ACTIVE` ||
                        processingKey === `${user.userId}-INACTIVE`;

                      return (
                        <TableRow key={user.userId}>
                          <TableCell className="px-4 py-3 align-top">
                            <p className="font-black tracking-tight text-slate-900">{getDisplayName(user)}</p>
                            <p className="mt-1 break-all text-sm text-slate-600">{user.email || user.userId}</p>
                            <p className="mt-1 break-all text-[11px] uppercase tracking-[0.18em] text-slate-400">
                              {user.userId}
                            </p>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <UserTypePill value={user.userType} />
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <StatusPill value={user.recordStatus} />
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top text-sm text-slate-600">
                            {user.username || "N/A"}
                          </TableCell>
                          {canSeeStamp ? (
                            <TableCell className="px-4 py-3 align-top break-words text-sm text-slate-500">
                              {user.stamp || "N/A"}
                            </TableCell>
                          ) : null}
                          <TableCell className="px-4 py-3 align-top">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                className="rounded-full border-emerald-700/15 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                disabled={isSuperadmin || isActive || isBusy}
                                onClick={() => handleStatusChange(user, "ACTIVE")}
                                type="button"
                                variant="outline"
                              >
                                {isBusy && !isActive ? "Updating..." : "Activate"}
                              </Button>
                              <Button
                                className="rounded-full border-rose-900/15 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                disabled={isSuperadmin || !isActive || isBusy}
                                onClick={() => handleStatusChange(user, "INACTIVE")}
                                type="button"
                                variant="outline"
                              >
                                {isBusy && isActive ? "Updating..." : "Deactivate"}
                              </Button>
                              {canManageUserRights(currentUserType, user.userType) ? (
                                <Button
                                  className="rounded-full border-slate-900/10 bg-slate-100 text-slate-800 hover:bg-slate-200"
                                  onClick={() => openRightsEditor(user)}
                                  type="button"
                                  variant="outline"
                                >
                                  Permissions
                                </Button>
                              ) : null}
                              {currentUserType === "SUPERADMIN" ? (
                                <Badge className="rounded-full border-violet-900/15 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-50">
                                  Locked
                                </Badge>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </Motion.section>
        </>
      )}
    </Motion.div>
  );
}

export default AdminUsersPage;
