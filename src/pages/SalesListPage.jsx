import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLoadingState from "../components/PageLoadingState.jsx";
import { ConfirmActionDialog, SalesFormDialog } from "../features/sales/SalesFormDialog.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useRights } from "../hooks/useRights.js";
import { useSalesOverview } from "../features/sales/useSalesOverview.js";
import { createSale, softDeleteSale, updateSale } from "../services/salesService.js";
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

function AccessDeniedState() {
  return (
    <section className="rounded-[2rem] border border-amber-900/10 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
        Sales access
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
        Your current rights map does not include Sales viewing access.
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600">
        Ask a Sales Manager or admin-capable user to grant the correct rights before using the transactions workspace.
      </p>
    </section>
  );
}

function createEmptyForm(nextTransNo) {
  return {
    transNo: nextTransNo,
    salesDate: "",
    custNo: "",
    empNo: "",
  };
}

function getNextTransNo(allSales) {
  const nextNumber =
    (allSales ?? []).reduce((highestNumber, sale) => {
      const matchedNumber = /^TR(\d+)$/.exec(sale.transNo ?? "");
      const numericValue = Number(matchedNumber?.[1] ?? 0);
      return Math.max(highestNumber, numericValue);
    }, 0) + 1;

  return `TR${String(nextNumber).padStart(6, "0")}`;
}

function SalesListPage() {
  const { currentUser } = useAuth();
  const {
    canCreateSales,
    canDeleteSales,
    canEditSales,
    canSeeStamp,
    canViewSales,
    canViewSalesDetail,
    isAdmin,
    isRightsLoading,
    isSuperadmin,
  } = useRights();
  const userType = String(currentUser?.user_type ?? "").toUpperCase();
  const isPrivilegedUser = isAdmin || isSuperadmin;
  const {
    allSales,
    customerOptions,
    employeeOptions,
    error,
    filters,
    isLoading,
    metrics,
    refreshOverview,
    sales,
    setFilters,
  } = useSalesOverview(userType);
  const nextTransNo = getNextTransNo(allSales);
  const [activeDialog, setActiveDialog] = useState(null);
  const [activeSale, setActiveSale] = useState(null);
  const [form, setForm] = useState(() => createEmptyForm(nextTransNo));
  const [dialogError, setDialogError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeDialog !== "create") {
      setForm(createEmptyForm(nextTransNo));
    }
  }, [activeDialog, nextTransNo]);

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

  if (!isRightsLoading && !canViewSales) {
    return <AccessDeniedState />;
  }

  function openCreateDialog() {
    setDialogError("");
    setActiveSale(null);
    setForm(createEmptyForm(nextTransNo));
    setActiveDialog("create");
  }

  function openEditDialog(sale) {
    setDialogError("");
    setActiveSale(sale);
    setForm({
      transNo: sale.transNo,
      salesDate: sale.salesDate ?? "",
      custNo: sale.custNo ?? "",
      empNo: sale.empNo ?? "",
    });
    setActiveDialog("edit");
  }

  function openDeleteDialog(sale) {
    setDialogError("");
    setActiveSale(sale);
    setActiveDialog("delete");
  }

  function closeDialog() {
    setDialogError("");
    setActiveSale(null);
    setActiveDialog(null);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setDialogError("");

    try {
      if (activeDialog === "create") {
        await createSale(form);
      } else if (activeDialog === "edit" && activeSale) {
        await updateSale(activeSale.transNo, form);
      }

      refreshOverview();
      closeDialog();
    } catch (nextError) {
      setDialogError(nextError.message ?? "Unable to save the transaction.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!activeSale) {
      return;
    }

    setIsSaving(true);
    setDialogError("");

    try {
      await softDeleteSale(
        activeSale.transNo,
        `SOFT-DEL ${activeSale.transNo} ${new Date().toISOString()}`,
      );
      refreshOverview();
      closeDialog();
    } catch (nextError) {
      setDialogError(nextError.message ?? "Unable to soft-delete the transaction.");
    } finally {
      setIsSaving(false);
    }
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
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:bg-white/50 disabled:text-slate-500"
                disabled={!canCreateSales || isRightsLoading}
                onClick={openCreateDialog}
                type="button"
              >
                Add transaction
              </button>
              <div className="rounded-full border border-white/15 px-4 py-3 text-sm text-white/75">
                {canCreateSales
                  ? "Create flow is ready for Sales Manager roles."
                  : "Create is hidden by the current rights map."}
              </div>
            </div>
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
              <div className="grid gap-3" key={sale.transNo}>
                <SalesCard canSeeStamp={canSeeStamp} sale={sale} />
                {(canEditSales || canDeleteSales || canViewSalesDetail) ? (
                  <div className="flex flex-wrap gap-3">
                    {canEditSales ? (
                      <button
                        className="inline-flex rounded-full border border-slate-900/10 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900/30 hover:bg-white"
                        onClick={() => openEditDialog(sale)}
                        type="button"
                      >
                        Edit transaction
                      </button>
                    ) : null}
                    {canDeleteSales ? (
                      <button
                        className="inline-flex rounded-full border border-rose-900/15 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                        onClick={() => openDeleteDialog(sale)}
                        type="button"
                      >
                        Soft delete
                      </button>
                    ) : null}
                    {canViewSalesDetail ? (
                      <Link
                        className="inline-flex rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                        to={`/sales/${sale.transNo}`}
                      >
                        Open transaction
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
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
                    {(canEditSales || canDeleteSales) ? (
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Manage</th>
                    ) : null}
                    {canViewSalesDetail ? (
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Open</th>
                    ) : null}
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
                      {(canEditSales || canDeleteSales) ? (
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            {canEditSales ? (
                              <button
                                className="inline-flex rounded-full border border-slate-900/10 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900/30 hover:bg-slate-50"
                                onClick={() => openEditDialog(sale)}
                                type="button"
                              >
                                Edit
                              </button>
                            ) : null}
                            {canDeleteSales ? (
                              <button
                                className="inline-flex rounded-full border border-rose-900/15 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                                onClick={() => openDeleteDialog(sale)}
                                type="button"
                              >
                                Delete
                              </button>
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                      {canViewSalesDetail ? (
                        <td className="px-5 py-4">
                          <Link
                            className="inline-flex rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900/30 hover:bg-slate-50"
                            to={`/sales/${sale.transNo}`}
                          >
                            View
                          </Link>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {(activeDialog === "create" || activeDialog === "edit") ? (
        <SalesFormDialog
          customerOptions={customerOptions}
          employeeOptions={employeeOptions}
          error={dialogError}
          form={form}
          isSaving={isSaving}
          mode={activeDialog}
          onChange={handleFormChange}
          onClose={closeDialog}
          onSubmit={handleSubmit}
        />
      ) : null}

      {(activeDialog === "delete" && activeSale) ? (
        <ConfirmActionDialog
          description={`Confirm delete transaction ${activeSale.transNo}? This sets the row to INACTIVE so it can be recovered later from Deleted Items.`}
          error={dialogError}
          isSaving={isSaving}
          onClose={closeDialog}
          onConfirm={handleConfirmDelete}
          title={`Soft delete ${activeSale.transNo}`}
        />
      ) : null}
    </div>
  );
}

export default SalesListPage;
