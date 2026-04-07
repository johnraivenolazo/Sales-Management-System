import { useEffect, useMemo, useState } from "react";
import PageLoadingState from "../components/PageLoadingState.jsx";
import { LookupPageShell } from "../features/lookups/LookupPageShell.jsx";
import {
  formatCurrency,
  formatDisplayDate,
  formatQuantity,
} from "../features/sales/salesFormatting.js";
import { useRights } from "../hooks/useRights.js";
import { getOldTransactionHistory } from "../services/oldTransactionHistoryService.js";

function AccessDeniedState() {
  return (
    <section className="rounded-[2rem] border border-amber-900/10 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
        Transaction history access
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
        Your current rights map does not include Sales viewing access.
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600">
        Ask an admin to grant Sales access.
      </p>
    </section>
  );
}

function OldTransactionsPage() {
  const { canViewSales, isRightsLoading } = useRights();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadRows() {
      try {
        const loadedRows = await getOldTransactionHistory();

        if (!active) {
          return;
        }

        setRows(loadedRows);
        setIsLoading(false);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setError(nextError.message ?? "Unable to load old transaction history.");
        setIsLoading(false);
      }
    }

    void loadRows();

    return () => {
      active = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        row.transNo.toLowerCase().includes(normalizedQuery) ||
        row.prodCode.toLowerCase().includes(normalizedQuery) ||
        row.description.toLowerCase().includes(normalizedQuery) ||
        row.customerName.toLowerCase().includes(normalizedQuery) ||
        row.employeeName.toLowerCase().includes(normalizedQuery);

      const matchesStartDate = !startDate || row.salesDate >= startDate;
      const matchesEndDate = !endDate || row.salesDate <= endDate;

      return matchesQuery && matchesStartDate && matchesEndDate;
    });
  }, [endDate, query, rows, startDate]);

  const metrics = useMemo(() => {
    const transactionSet = new Set(filteredRows.map((row) => row.transNo));
    const totalValue = filteredRows.reduce(
      (sum, row) => sum + Number(row.lineTotal ?? 0),
      0,
    );

    return {
      lineItems: filteredRows.length,
      transactions: transactionSet.size,
      totalValue,
    };
  }, [filteredRows]);

  if (isLoading || isRightsLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Old transactions"
        title="Loading old transaction history"
        description="Preparing immutable sales line records."
      />
    );
  }

  if (!canViewSales) {
    return <AccessDeniedState />;
  }

  return (
    <LookupPageShell
      eyebrow="Old transactions"
      metrics={[
        { label: "Visible line items", value: metrics.lineItems },
        { label: "Transactions", value: metrics.transactions },
        { label: "Snapshot total", value: formatCurrency(metrics.totalValue) },
      ]}
      summary="This ledger is separate from product price history and shows the frozen unit price used by each historical sales line item."
      title="Old transaction price history"
    >
      <section className="rounded-[2rem] border border-slate-900/5 bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_0.85fr_0.85fr]">
          <input
            className="w-full rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900/30 focus:bg-white"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transaction, product, customer, employee"
            type="search"
            value={query}
          />
          <input
            className="w-full rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900/30 focus:bg-white"
            onChange={(event) => setStartDate(event.target.value)}
            type="date"
            value={startDate}
          />
          <input
            className="w-full rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900/30 focus:bg-white"
            onChange={(event) => setEndDate(event.target.value)}
            type="date"
            value={endDate}
          />
        </div>
      </section>

      {error ? (
        <section className="rounded-[2rem] border border-rose-900/10 bg-rose-50 px-6 py-5 text-sm leading-6 text-rose-900 shadow-sm">
          {error}
        </section>
      ) : null}

      <div className="grid gap-4 xl:hidden">
        {filteredRows.map((row) => (
          <article
            className="rounded-[1.75rem] border border-slate-900/5 bg-white p-5 shadow-sm"
            key={`${row.transNo}-${row.prodCode}-${row.salesDate}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              {row.transNo}
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              {row.prodCode} · {row.description}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {row.customerName} · {row.employeeName}
            </p>

            <dl className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Sales date
                </dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {formatDisplayDate(row.salesDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Quantity
                </dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {formatQuantity(row.quantity)} {row.unit}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Frozen unit price
                </dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(row.unitPrice)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Line total
                </dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(row.lineTotal)}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <section className="hidden overflow-hidden rounded-[1.75rem] border border-slate-900/5 bg-white shadow-sm xl:block">
        <div className="app-scrollbar overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-[13px]">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Transaction
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Sales date
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Customer
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Employee
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Product
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Qty
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Frozen unit price
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Line total
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  className="border-t border-slate-900/5"
                  key={`${row.transNo}-${row.prodCode}-${row.salesDate}`}
                >
                  <td className="px-4 py-3 font-black tracking-tight text-slate-900">
                    {row.transNo}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatDisplayDate(row.salesDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.customerName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.employeeName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {row.prodCode} · {row.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatQuantity(row.quantity)} {row.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatCurrency(row.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    {formatCurrency(row.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </LookupPageShell>
  );
}

export default OldTransactionsPage;