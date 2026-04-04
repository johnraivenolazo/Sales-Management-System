import { Link } from "react-router-dom";
import PageLoadingState from "../components/PageLoadingState.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useSalesOverview } from "../features/sales/useSalesOverview.js";
import {
  formatCurrency,
  formatDisplayDate,
  formatQuantity,
} from "../features/sales/salesFormatting.js";

function MetricCard({ label, value, tone = "light" }) {
  const toneClassName =
    tone === "dark"
      ? "bg-slate-900 text-white"
      : tone === "warm"
        ? "bg-[#f1e6d2] text-slate-900"
        : "bg-white text-slate-900";

  return (
    <article className={`rounded-[1.75rem] border border-slate-900/5 p-5 shadow-sm ${toneClassName}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700/90">
        {label}
      </p>
      <p className="mt-4 text-3xl font-black tracking-tight">{value}</p>
    </article>
  );
}

function StatusBadge({ value }) {
  const normalizedValue = String(value ?? "ACTIVE").toUpperCase();
  const className =
    normalizedValue === "ACTIVE"
      ? "bg-emerald-50 text-emerald-800 border-emerald-700/15"
      : "bg-rose-50 text-rose-700 border-rose-700/15";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${className}`}
    >
      {normalizedValue}
    </span>
  );
}

function SalesFilters({ customerOptions, filters, isPrivilegedUser, setFilters }) {
  return (
    <section className="rounded-[2rem] border border-slate-900/5 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end">
        <label className="grid gap-2 xl:min-w-[16rem] xl:flex-1">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Search
          </span>
          <input
            className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900/30 focus:bg-white"
            onChange={(event) =>
              setFilters((currentFilters) => ({
                ...currentFilters,
                query: event.target.value,
              }))
            }
            placeholder="Transaction, customer, or employee"
            type="search"
            value={filters.query}
          />
        </label>

        <label className="grid gap-2 xl:min-w-[15rem]">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Customer
          </span>
          <select
            className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900/30 focus:bg-white"
            onChange={(event) =>
              setFilters((currentFilters) => ({
                ...currentFilters,
                customer: event.target.value,
              }))
            }
            value={filters.customer}
          >
            <option value="ALL">All customers</option>
            {customerOptions.map((customer) => (
              <option key={customer.value} value={customer.value}>
                {customer.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 xl:min-w-[12rem]">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Start date
          </span>
          <input
            className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900/30 focus:bg-white"
            onChange={(event) =>
              setFilters((currentFilters) => ({
                ...currentFilters,
                startDate: event.target.value,
              }))
            }
            type="date"
            value={filters.startDate}
          />
        </label>

        <label className="grid gap-2 xl:min-w-[12rem]">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            End date
          </span>
          <input
            className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900/30 focus:bg-white"
            onChange={(event) =>
              setFilters((currentFilters) => ({
                ...currentFilters,
                endDate: event.target.value,
              }))
            }
            type="date"
            value={filters.endDate}
          />
        </label>

        {isPrivilegedUser ? (
          <label className="grid gap-2 xl:min-w-[11rem]">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Status
            </span>
            <select
              className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900/30 focus:bg-white"
              onChange={(event) =>
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  status: event.target.value,
                }))
              }
              value={filters.status}
            >
              <option value="VISIBLE">Visible set</option>
              <option value="ACTIVE">Active only</option>
              <option value="INACTIVE">Inactive only</option>
            </select>
          </label>
        ) : null}
      </div>
    </section>
  );
}

function SalesCard({ canSeeStamp, sale }) {
  return (
    <article className="rounded-[1.75rem] border border-slate-900/5 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
            Transaction
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {sale.transNo}
          </h3>
        </div>
        <StatusBadge value={sale.record_status} />
      </div>

      <dl className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Customer
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-900">{sale.customerName}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Employee
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-900">{sale.employeeName}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Sales date
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-900">
            {formatDisplayDate(sale.salesDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Pay term
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-900">{sale.payterm}</dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-[#f7f1e6] p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Line items
          </p>
          <p className="mt-1 text-xl font-black text-slate-900">{sale.lineCount}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Quantity
          </p>
          <p className="mt-1 text-xl font-black text-slate-900">
            {formatQuantity(sale.totalQuantity)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Estimated total
          </p>
          <p className="mt-1 text-xl font-black text-slate-900">
            {formatCurrency(sale.totalAmount)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          to={`/sales/${sale.transNo}`}
        >
          Open transaction
        </Link>
        {canSeeStamp ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Stamp: <span className="text-slate-600">{sale.stamp || "N/A"}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <section className="rounded-[2rem] border border-dashed border-slate-900/10 bg-white p-10 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
        No matches
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
        No transactions matched the current filters.
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600">
        Adjust the customer, date range, or search query to widen the visible transaction set.
      </p>
    </section>
  );
}

function SalesListPage() {
  const { currentUser } = useAuth();
  const userType = String(currentUser?.user_type ?? "").toUpperCase();
  const canSeeStamp = userType !== "USER";
  const isPrivilegedUser = userType === "ADMIN" || userType === "SUPERADMIN";
  const { customerOptions, error, filters, isLoading, metrics, sales, setFilters } =
    useSalesOverview(userType);

  if (isLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Sales workspace"
        title="Loading transaction overview"
        description="Pulling transactions, lookups, and summary metrics into the sales workspace."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-900/5 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="bg-[linear-gradient(135deg,#111827_0%,#18233d_45%,#1f3657_100%)] px-6 py-7 text-white sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
              Sprint 2 Sales Workspace
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
              Transaction control room for live sales, filters, and drill-downs.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              The transaction list now pulls real sales data, enriches it with customer and employee lookups,
              and gives the team a responsive workspace before full modal CRUD lands.
            </p>
          </div>

          <div className="grid gap-4 bg-[#f1e6d2] px-6 py-7 sm:px-8">
            <MetricCard label="Transactions in view" value={metrics.totalTransactions} tone="light" />
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard label="Line items" value={metrics.totalLineItems} tone="warm" />
              <MetricCard label="Quantity" value={formatQuantity(metrics.totalQuantity)} tone="warm" />
            </div>
            <MetricCard label="Estimated total" value={formatCurrency(metrics.totalAmount)} tone="dark" />
          </div>
        </div>
      </section>

      <SalesFilters
        customerOptions={customerOptions}
        filters={filters}
        isPrivilegedUser={isPrivilegedUser}
        setFilters={setFilters}
      />

      {error ? (
        <section className="rounded-[2rem] border border-rose-900/10 bg-rose-50 px-6 py-5 text-sm leading-6 text-rose-900 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]">Sales workspace error</p>
          <p className="mt-2">{error}</p>
        </section>
      ) : null}

      {sales.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-4 xl:hidden">
            {sales.map((sale) => (
              <SalesCard canSeeStamp={canSeeStamp} key={sale.transNo} sale={sale} />
            ))}
          </div>

          <section className="hidden overflow-hidden rounded-[2rem] border border-slate-900/5 bg-white shadow-sm xl:block">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Transaction</th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Sales date</th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Customer</th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Employee</th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Items</th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Quantity</th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Estimated total</th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Status</th>
                    {canSeeStamp ? (
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Stamp</th>
                    ) : null}
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr className="border-t border-slate-900/5 align-top" key={sale.transNo}>
                      <td className="px-5 py-4">
                        <p className="font-black tracking-tight text-slate-900">{sale.transNo}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{sale.payterm}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDisplayDate(sale.salesDate)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">{sale.customerName}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{sale.employeeName}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{sale.lineCount}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatQuantity(sale.totalQuantity)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge value={sale.record_status} />
                      </td>
                      {canSeeStamp ? (
                        <td className="px-5 py-4 text-sm text-slate-500">{sale.stamp || "N/A"}</td>
                      ) : null}
                      <td className="px-5 py-4">
                        <Link
                          className="inline-flex rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900/30 hover:bg-slate-50"
                          to={`/sales/${sale.transNo}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default SalesListPage;
