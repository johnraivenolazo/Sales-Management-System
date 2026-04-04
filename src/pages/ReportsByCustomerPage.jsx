import PageLoadingState from "../components/PageLoadingState.jsx";
import {
  ReportAlert,
  ReportEmptyState,
  ReportMetricCard,
  ReportPanel,
  ReportRefreshButton,
} from "../features/reports/ReportSurface.jsx";
import { useReportRows } from "../features/reports/useReportRows.js";
import { getSalesByCustomer } from "../services/reportsService.js";
import { formatCurrency, formatQuantity } from "../features/sales/salesFormatting.js";
import { formatCompactNumber, getMaxValue } from "../features/reports/reportFormatting.js";

function ReportsByCustomerPage() {
  const { error, isLoading, rows, reload } = useReportRows(getSalesByCustomer);
  const topCustomer = rows[0];
  const totalRevenue = rows.reduce((sum, row) => sum + Number(row.totalRevenue ?? 0), 0);
  const payTerms = new Set(rows.map((row) => row.payterm).filter(Boolean)).size;
  const maxRevenue = getMaxValue(rows, (row) => row.totalRevenue);

  if (isLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Reports"
        title="Loading sales by customer"
        description="Getting customer report data."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <ReportMetricCard label="Customers in report" value={formatCompactNumber(rows.length)} />
        <ReportMetricCard label="Pay terms" tone="warm" value={formatCompactNumber(payTerms)} />
        <ReportMetricCard
          label="Largest account"
          note={topCustomer ? topCustomer.customerName : "No customer rows"}
          tone="accent"
          value={formatCurrency(topCustomer?.totalRevenue ?? 0)}
        />
      </div>

      <ReportAlert error={error} />

      {rows.length === 0 ? (
        <ReportEmptyState
          description="No active sales rows were returned."
          title="No customer data available."
        />
      ) : (
        <>
          <ReportPanel
            actions={<ReportRefreshButton onClick={reload} />}
            description="See which customers generated the most revenue."
            title="Customer account ranking"
          >
            <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="grid gap-3">
                {rows.slice(0, 5).map((row, index) => {
                  const width = maxRevenue === 0 ? 0 : (Number(row.totalRevenue ?? 0) / maxRevenue) * 100;

                  return (
                    <article
                      className="rounded-[1.5rem] border border-slate-900/6 bg-[#f8f3ea] p-4"
                      key={row.custNo}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                            #{index + 1}
                          </p>
                          <h4 className="mt-2 text-lg font-black tracking-tight text-slate-900">
                            {row.customerName}
                          </h4>
                          <p className="mt-1 text-sm text-slate-500">{row.payterm || "No pay term"}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(row.totalRevenue)}</p>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-slate-900" style={{ width: `${width}%` }} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                        <span>{formatCompactNumber(row.totalTransactions)} transactions</span>
                        <span>{formatQuantity(row.totalQuantity)} items</span>
                      </div>
                    </article>
                  );
                })}
              </div>

              <section className="overflow-hidden rounded-[1.35rem] border border-slate-900/6 bg-white">
                <div className="app-scrollbar overflow-x-auto">
                  <table className="min-w-full border-collapse text-left text-[13px]">
                    <thead className="bg-slate-950 text-white">
                      <tr>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em]">Customer</th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em]">Pay term</th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em]">Transactions</th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em]">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr className="border-t border-slate-900/6" key={row.custNo}>
                          <td className="px-4 py-3 font-semibold text-slate-900">{row.customerName}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{row.payterm || "N/A"}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{formatCompactNumber(row.totalTransactions)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(row.totalRevenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </ReportPanel>

          <div className="grid gap-4 sm:grid-cols-2">
            <ReportMetricCard
              label="Average revenue / customer"
              note="Average across visible rows."
              tone="warm"
              value={formatCurrency(rows.length === 0 ? 0 : totalRevenue / rows.length)}
            />
            <ReportMetricCard
              label="Total report revenue"
              note="Revenue across visible rows."
              value={formatCurrency(totalRevenue)}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ReportsByCustomerPage;
