import { motion as Motion } from "motion/react";
import {
  Archive,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  FileStack,
  ReceiptText,
  ShieldUser,
  ShoppingBag,
  Users2,
} from "lucide-react";
import { useState } from "react";
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
    return pathname.startsWith("/sales/");
  }

  return pathname === to;
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
  const userType = String(currentUser?.user_type ?? "USER").toUpperCase();
  const workspaceTitle = getWorkspaceTitle(location.pathname);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const navGroups = [
    {
      label: "Sales",
      items: [
        ...(canViewSales ? [[ReceiptText, "/sales", "Transactions", "exact"]] : []),
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_24%),linear-gradient(180deg,#f8f2e8_0%,#efe5d4_100%)] text-slate-900">
      <div className="flex min-h-screen items-stretch">
        <Sidebar className="backdrop-blur-xl">
          <SidebarHeader className="bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.9)_100%)]">
            <BrandMark imageClassName="h-10 w-10" />
          </SidebarHeader>

          <SidebarContent>
            {navGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <button
                  className="mb-2 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-white/65"
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
                              : "border-transparent bg-white/70 text-slate-700 hover:border-sidebar-border hover:bg-white hover:text-slate-950",
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

        <SidebarInset>
          <Motion.header
            animate="show"
            className="sticky top-0 z-30 border-b border-slate-900/6 bg-white/78 backdrop-blur-xl"
            initial="hidden"
            variants={fadeUp}
          >
            <div className="mx-auto flex h-18 max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6">
              <SidebarTrigger />

              <div className="sm:hidden">
                <BrandMark imageClassName="h-9 w-9" showText={false} />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-black tracking-tight text-slate-950">
                  {workspaceTitle}
                </h1>
              </div>

              <Badge className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 hover:bg-white sm:inline-flex">
                {userType}
              </Badge>

              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm md:flex">
                <span className="text-slate-400">Logged in:</span>
                <span className="max-w-[14rem] truncate font-medium text-slate-800">
                  {displayName}
                </span>
              </div>

              <Button
                className="hidden rounded-full bg-slate-950 text-white hover:bg-slate-800 sm:inline-flex"
                onClick={() => void signOutUser()}
                type="button"
              >
                Logout
              </Button>
            </div>
          </Motion.header>

          <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6">
            <Outlet />
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
