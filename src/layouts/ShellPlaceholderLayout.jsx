import { NavLink, Outlet } from "react-router-dom";

const navGroups = [
  {
    label: "Sales",
    items: [
      ["/sales", "Transactions"],
      ["/sales/TR000001", "Sales Detail"],
    ],
  },
  {
    label: "Lookups",
    items: [
      ["/lookups/customers", "Customers"],
      ["/lookups/employees", "Employees"],
      ["/lookups/products", "Products"],
      ["/lookups/prices", "Prices"],
    ],
  },
  {
    label: "Workspace",
    items: [
      ["/reports", "Reports"],
      ["/admin", "Admin"],
      ["/deleted-items", "Deleted Items"],
      ["/auth/callback", "Auth Callback"],
    ],
  },
];

function ShellPlaceholderLayout() {
  return (
    <div className="min-h-screen bg-[#f7f1e6] text-slate-900">
      <div className="border-b border-slate-900/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              Hope, Inc.
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight">
              Sales Management System
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-full border border-slate-900/10 bg-slate-50 px-4 py-2 text-sm">
              <span className="font-semibold text-slate-900">Logged in:</span>{" "}
              Demo User
            </div>
            <button
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-7xl flex-col gap-8 px-6 py-8 lg:flex-row">
        <aside className="w-full rounded-[2rem] border border-slate-900/5 bg-white p-6 shadow-sm lg:sticky lg:top-8 lg:max-w-xs lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            App shell
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Grouped sidebar navigation for Sprint 1 UI shell. Visibility logic
            stays for later sprint work, but the structure is already in place.
          </p>

          <nav className="mt-8 grid gap-6">
            {navGroups.map((group) => (
              <section key={group.label}>
                <h2 className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {group.label}
                </h2>
                <div className="mt-3 grid gap-2">
                  {group.items.map(([to, label]) => (
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
                </div>
              </section>
            ))}
          </nav>
        </aside>

        <section className="flex-1">
          <div className="mb-5 rounded-[2rem] border border-slate-900/5 bg-white px-6 py-4 shadow-sm">
            <p className="text-sm leading-6 text-slate-600">
              Responsive shell is live. On mobile, the navbar stacks above the
              grouped sidebar; on desktop, the sidebar stays pinned beside the
              content area.
            </p>
          </div>
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default ShellPlaceholderLayout;
