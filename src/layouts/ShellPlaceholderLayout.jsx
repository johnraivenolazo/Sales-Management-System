import { motion as Motion } from "motion/react";
import {
  Archive,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  FileStack,
  LogOut,
  ReceiptText,
  ShieldUser,
  ShoppingBag,
  UserRound,
  Users2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import BrandMark from "@/components/BrandMark.jsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar.jsx";
import { cn } from "@/lib/utils.js";
import { useAuth } from "../hooks/useAuth.js";
import { useRights } from "../hooks/useRights.js";
import { fadeUp } from "../lib/motion.js";

function getWorkspaceTitle(pathname) {
  if (pathname.startsWith("/sales/history")) {
    return "Old Transactions";
  }

  if (pathname.startsWith("/sales/")) {
    return "Sales Detail";
  }

  if (pathname.startsWith("/sales")) {
    return "Transactions";
  }

  if (pathname.startsWith("/lookups/customers")) {
    return "Customer Lookup";
  }

  if (pathname.startsWith("/lookups/employees")) {
    return "Employee Lookup";
  }

  if (pathname.startsWith("/lookups/products")) {
    return "Product Lookup";
  }

  if (pathname.startsWith("/lookups/prices")) {
    return "Price History";
  }

  if (pathname.startsWith("/reports")) {
    return "Reports";
  }

  if (pathname.startsWith("/admin")) {
    return "Admin";
  }

  if (pathname.startsWith("/deleted-items")) {
    return "Deleted Items";
  }

  return "Workspace";
}

function matchesRoute(pathname, to, mode = "exact") {
  if (mode === "prefix") {
    return pathname === to || pathname.startsWith(`${to}/`);
  }

  if (mode === "sales-detail") {
    return pathname.startsWith("/sales/TR");
  }

  return pathname === to;
}

function getInitials(currentUser, displayName) {
  const first = String(currentUser?.first_name ?? "").trim();
  const last = String(currentUser?.last_name ?? "").trim();

  if (first || last) {
    return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "U";
  }

  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";
}

function ShellFrame() {
  const location = useLocation();
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  const { currentUser, signOutUser } = useAuth();
  const {
    canAccessAdmin,
    canAccessDeletedItems,
    canViewCustomerLookup,
    canViewEmployeeLookup,
    canViewPriceLookup,
    canViewProductLookup,
    canViewSales,
    canViewSalesDetail,
  } = useRights();

  const displayName =
    currentUser?.username ||
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(" ") ||
    currentUser?.email ||
    "Demo User";
  const accountEmail = currentUser?.email || "No email saved";
  const userType = String(currentUser?.user_type ?? "USER").toUpperCase();
  const initials = getInitials(currentUser, displayName);
  const workspaceTitle = getWorkspaceTitle(location.pathname);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const navGroups = [
    {
      label: "Sales",
      items: [
        ...(canViewSales ? [[ReceiptText, "/sales", "Transactions", "exact"]] : []),
        ...(canViewSales ? [[FileStack, "/sales/history", "Old Transactions", "exact"]] : []),
        ...(canViewSalesDetail ? [[FileStack, "/sales/TR000001", "Sales Detail", "sales-detail"]] : []),
      ],
    },
    {
      label: "Lookups",
      items: [
        ...(canViewCustomerLookup ? [[Building2, "/lookups/customers", "Customers", "exact"]] : []),
        ...(canViewEmployeeLookup ? [[Users2, "/lookups/employees", "Employees", "exact"]] : []),
        ...(canViewProductLookup ? [[ShoppingBag, "/lookups/products", "Products", "exact"]] : []),
        ...(canViewPriceLookup ? [[CircleDollarSign, "/lookups/prices", "Prices", "exact"]] : []),
      ],
    },
    {
      label: "Workspace",
      items: [
        [BarChart3, "/reports", "Reports", "prefix"],
        ...(canAccessAdmin ? [[ShieldUser, "/admin", "Admin", "prefix"]] : []),
        ...(canAccessDeletedItems ? [[Archive, "/deleted-items", "Deleted Items", "exact"]] : []),
      ],
    },
  ].filter((group) => group.items.length > 0);

  function toggleGroup(label) {
    setCollapsedGroups((current) => ({
      ...current,
      [label]: !current[label],
    }));
  }

  useEffect(() => {
    function handlePointerDown(event) {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_24%),linear-gradient(180deg,#f8f2e8_0%,#efe5d4_100%)] text-slate-900">
      <div className="flex h-full min-h-0 items-stretch">
        <Sidebar className="backdrop-blur-xl">
          <SidebarHeader className="bg-transparent">
            <div className="rounded-[1.45rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(248,243,234,0.9))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_34px_rgba(15,23,42,0.07)]">
              <div className="flex items-center gap-2.5">
                <BrandMark
                  className="items-center gap-0"
                  frame={false}
                  imageClassName="h-16 w-16 rounded-[1.1rem] object-contain"
                  showText={false}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.32em] text-[#c46823]">
                    Hope, Inc.
                  </p>
                  <div className="mt-1.5 h-px w-9 rounded-full bg-gradient-to-r from-[#c46823] to-transparent" />
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {navGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <button
                  className="mb-2 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-white/45"
                  onClick={() => toggleGroup(group.label)}
                  type="button"
                >
                  <SidebarGroupLabel className="mb-0 px-0">{group.label}</SidebarGroupLabel>
                  <ChevronDown
                    className={cn(
                      "size-4 text-slate-300 transition",
                      collapsedGroups[group.label] ? "-rotate-90" : "rotate-0",
                    )}
                  />
                </button>
                {!collapsedGroups[group.label] ? (
                  <SidebarMenu>
                  {group.items.map((item) => {
                    const ItemIcon = item[0];
                    const to = item[1];
                    const label = item[2];
                    const matchMode = item[3];
                    const isActive = matchesRoute(location.pathname, to, matchMode);

                    return (
                      <NavLink
                        key={to}
                        className={() =>
                          cn(
                            "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition",
                            isActive
                              ? "border-slate-900 bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]"
                              : "border-transparent bg-white/58 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_8px_18px_rgba(15,23,42,0.04)] hover:bg-white/82 hover:text-slate-950",
                          )
                        }
                        end={matchMode === "exact"}
                        onClick={() => {
                          if (isMobile && openMobile) {
                            setOpenMobile(false);
                          }
                        }}
                        to={to}
                      >
                        <span
                          className={cn(
                            "flex size-9 items-center justify-center rounded-xl transition",
                            isActive
                              ? "bg-white/12 text-white"
                              : "bg-slate-100 text-slate-500 group-hover:bg-slate-950 group-hover:text-white",
                          )}
                        >
                          <ItemIcon className="size-4" />
                        </span>
                        <span className={cn("flex-1", isActive ? "text-white" : "text-slate-950")}>
                          {label}
                        </span>
                        <ChevronRight
                          className={cn(
                            "size-4 transition",
                            isActive ? "text-white/60" : "text-slate-300 group-hover:text-slate-500",
                          )}
                        />
                      </NavLink>
                    );
                  })}
                  </SidebarMenu>
                ) : null}
              </SidebarGroup>
            ))}
          </SidebarContent>

          {isMobile ? (
            <SidebarFooter>
              <Card className="rounded-[1.5rem] border-sidebar-border bg-white/80 shadow-none">
                <CardContent className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Logged in
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-950">{displayName}</p>
                  <p className="text-xs text-slate-500">{userType}</p>
                  <Button
                    className="mt-4 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800"
                    onClick={() => void signOutUser()}
                    type="button"
                  >
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </SidebarFooter>
          ) : null}
        </Sidebar>

        <SidebarInset className="flex min-h-0 flex-1 flex-col">
          <Motion.header
            animate="show"
            className="shrink-0 border-b border-slate-900/6 bg-white/78 backdrop-blur-xl"
            initial="hidden"
            variants={fadeUp}
          >
            <div className="mx-auto flex h-18 min-w-0 max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6">
              <SidebarTrigger />

              <div className="sm:hidden">
                <BrandMark imageClassName="h-9 w-9" showText={false} />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-black tracking-tight text-slate-950">
                  {workspaceTitle}
                </h1>
              </div>

              <div
                className="relative hidden min-w-0 sm:flex sm:max-w-[min(17rem,42vw)] sm:flex-none sm:justify-end lg:max-w-[20rem]"
                ref={accountMenuRef}
              >
                <button
                  aria-expanded={isAccountMenuOpen}
                  className="flex w-full max-w-full items-center justify-between gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 shadow-sm transition hover:border-slate-300"
                  onClick={() => setIsAccountMenuOpen((current) => !current)}
                  type="button"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {displayName}
                    </p>
                    <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 lg:block">
                      {userType}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-slate-400 transition",
                      isAccountMenuOpen ? "rotate-180" : "rotate-0",
                    )}
                  />
                </button>

                {isAccountMenuOpen ? (
                  <Motion.div
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-[min(19rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.18)] ring-1 ring-slate-950/5"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <div className="flex items-start gap-3 rounded-[1.2rem] bg-slate-50 px-3 py-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{displayName}</p>
                        <p className="mt-1 truncate text-sm text-slate-500">{accountEmail}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-[1.1rem] border border-slate-200 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <UserRound className="size-4 text-slate-400" />
                        <span>Current role</span>
                      </div>
                      <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 hover:bg-white">
                        {userType}
                      </Badge>
                    </div>

                    <Button
                      className="mt-3 w-full justify-center rounded-xl bg-slate-950 text-white hover:bg-slate-800"
                      onClick={() => void signOutUser()}
                      type="button"
                    >
                      <LogOut className="mr-2 size-4" />
                      Logout
                    </Button>
                  </Motion.div>
                ) : null}
              </div>
            </div>
          </Motion.header>

          <main className="app-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </div>
  );
}

function ShellPlaceholderLayout() {
  return (
    <SidebarProvider>
      <ShellFrame />
    </SidebarProvider>
  );
}

export default ShellPlaceholderLayout;
