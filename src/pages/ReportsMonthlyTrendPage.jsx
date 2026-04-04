import PageLoadingState from "../components/PageLoadingState.jsx";
import {
  ReportAlert,
  ReportEmptyState,
  ReportMetricCard,
  ReportPanel,
  ReportRefreshButton,
} from "../features/reports/ReportSurface.jsx";
import { useReportRows } from "../features/reports/useReportRows.js";
import { getMonthlySalesTrend } from "../services/reportsService.js";
import { formatCurrency, formatQuantity } from "../features/sales/salesFormatting.js";
import { formatCompactNumber, formatMonthLabel, getMaxValue } from "../features/reports/reportFormatting.js";

function ReportsMonthlyTrendPage() {
  const { error, isLoading, rows, reload } = useReportRows(getMonthlySalesTrend);
  const maxRevenue = getMaxValue(rows, (row) => row.totalRevenue);
  const peakMonth = rows.reduce((currentPeak, row) => {
    if (!currentPeak || Number(row.totalRevenue ?? 0) > Number(currentPeak.totalRevenue ?? 0)) {
      return row;
    }
    return currentPeak;
  }, null);
  const totalRevenue = rows.reduce((sum, row) => sum + Number(row.totalRevenue ?? 0), 0);
  const totalTransactions = rows.reduce((sum, row) => sum + Number(row.totalTransactions ?? 0), 0);

  if (isLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Reports"
        title="Loading monthly sales trend"
        description="Getting monthly report data."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <ReportMetricCard label="Months in report" value={formatCompactNumber(rows.length)} />
        <ReportMetricCard label="Transactions covered" tone="warm" value={formatCompactNumber(totalTransactions)} />
        <ReportMetricCard
          label="Peak month"
          note={peakMonth ? formatMonthLabel(peakMonth.monthStart) : "No monthly rows"}
          tone="accent"
          value={formatCurrency(peakMonth?.totalRevenue ?? 0)}
        />
      </div>

      <ReportAlert error={error} />

      {rows.length === 0 ? (
        <ReportEmptyState
          description="No active sales rows were returned."
          title="No monthly data available."
        />
      ) : (
        <>
          <ReportPanel
            actions={<ReportRefreshButton onClick={reload} />}
            description="Review monthly revenue, quantity, and transaction trends."
            title="Monthly sales trend"
          >
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {rows.map((row) => {
                const width = maxRevenue === 0 ? 0 : (Number(row.totalRevenue ?? 0) / maxRevenue) * 100;

                return (
                  <article className="rounded-[1.5rem] border border-slate-900/6 bg-[#f8f3ea] p-4" key={row.saleMonth}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                      {row.saleMonth}
                    </p>
                    <h4 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                      {formatMonthLabel(row.monthStart)}
                    </h4>
                    <div className="mt-4 h-2 rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-slate-900" style={{ width: `${width}%` }} />
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-slate-600">
                      <p>
                        Revenue: <span className="font-semibold text-slate-900">{formatCurrency(row.totalRevenue)}</span>
                      </p>
                      <p>
                        Transactions:{" "}
                        <span className="font-semibold text-slate-900">{formatCompactNumber(row.totalTransactions)}</span>
                      </p>
                      <p>
                        Quantity: <span className="font-semibold text-slate-900">{formatQuantity(row.totalQuantity)}</span>
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </ReportPanel>

          <ReportPanel description="Monthly totals in table form." title="Monthly detail">
            <section className="overflow-hidden rounded-[1.35rem] border border-slate-900/6 bg-white">
              <div className="app-scrollbar workspace-table-scroll">
                <table className="min-w-full border-collapse text-left text-[13px]">
                  <thead className="bg-slate-950 text-white">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em]">Month</th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em]">Start date</th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em]">Transactions</th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em]">Quantity</th>
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em]">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr className="border-t border-slate-900/6" key={row.saleMonth}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{row.saleMonth}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatMonthLabel(row.monthStart)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatCompactNumber(row.totalTransactions)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatQuantity(row.totalQuantity)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(row.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </ReportPanel>

          <div className="grid gap-4 sm:grid-cols-2">
            <ReportMetricCard
              label="Average monthly revenue"
              note="Average across visible months."
              tone="warm"
              value={formatCurrency(rows.length === 0 ? 0 : totalRevenue / rows.length)}
            />
            <ReportMetricCard
              label="Total revenue in trend"
              note="Revenue across visible months."
              value={formatCurrency(totalRevenue)}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ReportsMonthlyTrendPage;
