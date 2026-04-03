import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  ["/sales", "Sales"],
  ["/sales/TR000001", "Sales Detail"],
  ["/lookups/customers", "Customers"],
  ["/lookups/employees", "Employees"],
  ["/lookups/products", "Products"],
  ["/lookups/prices", "Prices"],
  ["/reports", "Reports"],
  ["/admin", "Admin"],
  ["/deleted-items", "Deleted Items"],
  ["/auth/callback", "Auth Callback"],
];

function ShellPlaceholderLayout() {
  return (
    <div className="min-h-screen bg-[#f7f1e6] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8 lg:flex-row">
        <aside className="w-full rounded-[2rem] border border-slate-900/5 bg-white p-6 shadow-sm lg:max-w-xs">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            Route Skeleton
          </p>
          <h1 className="mt-3 text-2xl font-black">Sales Management System</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Temporary navigation shell for Sprint 1 route wiring. The full app
            shell and visibility logic will be implemented in later sprint work.
          </p>
          <nav className="mt-6 grid gap-2">
            {navItems.map(([to, label]) => (
              <NavLink
                key={to}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`
                }
                to={to}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section className="flex-1">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default ShellPlaceholderLayout;
