import { motion as Motion } from "motion/react";
import { NavLink, Outlet } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button, buttonVariants } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { cn } from "@/lib/utils.js";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/motion.js";

export function ReportMetricCard({ label, value, note, tone = "default" }) {
  const toneClassName =
    tone === "accent"
      ? "border-slate-950 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]"
      : tone === "warm"
        ? "border-amber-900/10 bg-[#f5e7ce] text-slate-900"
        : "border-white/80 bg-white/92 text-slate-900";
  const badgeClassName = tone === "accent"
    ? "bg-amber-300/15 text-amber-200 hover:bg-amber-300/15"
    : "bg-amber-100 text-amber-900 hover:bg-amber-100";
  const noteClassName = tone === "accent" ? "text-white/72" : "text-slate-600";

  return (
    <Motion.div variants={fadeUp}>
      <Card className={cn("rounded-[1.35rem] shadow-sm", toneClassName)}>
        <CardContent className="space-y-3 p-4">
          <Badge className={cn("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]", badgeClassName)}>
            {label}
          </Badge>
          <p className="text-[1.75rem] font-black tracking-tight">{value}</p>
          {note ? <p className={cn("text-sm leading-5", noteClassName)}>{note}</p> : null}
        </CardContent>
      </Card>
    </Motion.div>
  );
}

export function ReportPanel({ title, description, children, actions = null }) {
  return (
    <Motion.section variants={fadeUp}>
      <Card className="rounded-[1.75rem] border-white/80 bg-white/94 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
        <CardHeader className="px-5 pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <CardTitle className="text-[1.65rem] font-black tracking-tight text-slate-950">
                {title}
              </CardTitle>
              {description ? (
                <CardDescription className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </CardDescription>
              ) : null}
            </div>
            {actions}
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">{children}</CardContent>
      </Card>
    </Motion.section>
  );
}

export function ReportEmptyState({ title, description }) {
  return (
    <Motion.section variants={fadeUp}>
      <Card className="rounded-[2rem] border-dashed border-slate-900/10 bg-white/94 shadow-sm">
        <CardContent className="p-10 text-center">
          <Badge className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-900 hover:bg-amber-100">
            No rows returned
          </Badge>
          <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-900">{title}</h3>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
        </CardContent>
      </Card>
    </Motion.section>
  );
}

export function ReportAlert({ error }) {
  if (!error) {
    return null;
  }

  return (
    <Motion.div variants={fadeUp}>
      <Alert className="rounded-[1.5rem] border-rose-200 bg-rose-50 text-rose-900" variant="destructive">
        <AlertTitle>Report loading issue</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </Motion.div>
  );
}

export function ReportsWorkspacePage() {
  const tabs = [
    ["/reports/employees", "By Employee"],
    ["/reports/customers", "By Customer"],
    ["/reports/products", "Top Products"],
    ["/reports/monthly", "Monthly Trend"],
  ];

  return (
    <Motion.div animate="show" className="grid gap-5" initial="hidden" variants={staggerContainer}>
      <Motion.section variants={scaleIn}>
        <Card className="overflow-hidden rounded-[2.1rem] border-white/80 bg-[linear-gradient(135deg,#09111f_0%,#17253a_42%,#23415f_100%)] text-white shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <div className="border-b border-white/10 px-5 py-6 sm:px-6">
            <div className="flex flex-wrap gap-3">
              <Badge className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300 hover:bg-white/10">
                Reports
              </Badge>
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-[2.6rem]">
              Track sales performance
            </h2>
            <div className="mt-4">
              <p className="max-w-2xl text-sm leading-6 text-white/78 sm:text-[15px]">
                Review revenue, customers, products, and monthly trends from one place.
              </p>
            </div>
          </div>

          <div className="grid gap-3 bg-[#f1e6d2] px-5 py-4 sm:grid-cols-2 sm:px-6">
            <div className="rounded-[1.25rem] border border-white/80 bg-white p-4 text-slate-900 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-300">
                  Views available
                </p>
                <p className="mt-3 text-[1.7rem] font-black tracking-tight">4</p>
                <p className="mt-2 text-sm leading-5 text-slate-600">
                  Employee, customer, product, and monthly views.
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-900/10 bg-slate-950 p-4 text-white shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-300">
                  Navigation
                </p>
                <p className="mt-3 text-[1.7rem] font-black tracking-tight">Live</p>
                <p className="mt-2 text-sm leading-5 text-white/68">
                  Switch between employee, customer, product, and monthly views.
                </p>
              </div>
          </div>
        </Card>
      </Motion.section>

      <Motion.section variants={fadeUp}>
        <Card className="rounded-[1.75rem] border-white/80 bg-white/94 shadow-sm">
          <CardContent className="p-3">
            <div className="app-scrollbar flex gap-2 overflow-x-auto pb-1">
              {tabs.map(([to, label]) => (
                <NavLink
                  key={to}
                  className={({ isActive }) =>
                    cn(
                      buttonVariants({
                        size: "lg",
                        variant: "outline",
                      }),
                      "shrink-0 rounded-full px-4 text-sm font-medium transition-colors",
                      isActive
                        ? "border-slate-900 bg-slate-950 !text-white hover:bg-slate-900 hover:!text-white"
                        : "border-slate-200 bg-slate-50 !text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:!text-slate-950",
                    )
                  }
                  to={to}
                >
                  <span className="block leading-none">{label}</span>
                </NavLink>
              ))}
            </div>
          </CardContent>
        </Card>
      </Motion.section>

      <Outlet />
    </Motion.div>
  );
}

export function ReportRefreshButton({ onClick }) {
  return (
    <Button
      className="rounded-full border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100"
      onClick={onClick}
      size="lg"
      type="button"
      variant="outline"
    >
      Refresh
    </Button>
  );
}
