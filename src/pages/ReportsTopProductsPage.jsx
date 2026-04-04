import PageLoadingState from "../components/PageLoadingState.jsx";
import {
  ReportAlert,
  ReportEmptyState,
  ReportMetricCard,
  ReportPanel,
  ReportRefreshButton,
} from "../features/reports/ReportSurface.jsx";
import { useReportRows } from "../features/reports/useReportRows.js";
import { getTopProducts } from "../services/reportsService.js";
import { formatCurrency, formatQuantity } from "../features/sales/salesFormatting.js";
import { formatCompactNumber, getMaxValue } from "../features/reports/reportFormatting.js";

function ReportsTopProductsPage() {
  const { error, isLoading, rows, reload } = useReportRows(getTopProducts);
  const topProduct = rows[0];
  const maxQuantity = getMaxValue(rows, (row) => row.totalQuantity);
  const totalRevenue = rows.reduce((sum, row) => sum + Number(row.totalRevenue ?? 0), 0);
  const totalQuantity = rows.reduce((sum, row) => sum + Number(row.totalQuantity ?? 0), 0);

  if (isLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Reports"
        title="Loading top products sold"
        description="Getting product report data."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <ReportMetricCard label="Products in report" value={formatCompactNumber(rows.length)} />
        <ReportMetricCard label="Units sold" tone="warm" value={formatQuantity(totalQuantity)} />
        <ReportMetricCard
          label="Top product"
          note={topProduct ? topProduct.description : "No product rows"}
          tone="accent"
          value={formatQuantity(topProduct?.totalQuantity ?? 0)}
        />
      </div>

      <ReportAlert error={error} />

      {rows.length === 0 ? (
        <ReportEmptyState
          description="No active sales detail rows were returned."
          title="No product data available."
        />
      ) : (
        <>
          <ReportPanel
            actions={<ReportRefreshButton onClick={reload} />}
            description="See which products sold the most."
            title="Top products sold"
          >
            <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="grid gap-3">
                {rows.slice(0, 5).map((row, index) => {
                  const width = maxQuantity === 0 ? 0 : (Number(row.totalQuantity ?? 0) / maxQuantity) * 100;

                  return (
                    <article
                      className="rounded-[1.5rem] border border-slate-900/6 bg-[#f8f3ea] p-4"
                      key={row.prodCode}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                            #{index + 1} · {row.prodCode}
                          </p>
                          <h4 className="mt-2 text-lg font-black tracking-tight text-slate-900">
                            {row.description}
                          </h4>
                          <p className="mt-1 text-sm text-slate-500">{row.unit}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatQuantity(row.totalQuantity)}
                        </p>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-slate-900" style={{ width: `${width}%` }} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                        <span>{formatCompactNumber(row.totalTransactions)} transactions</span>
                        <span>{formatCurrency(row.totalRevenue)} revenue</span>
                      </div>
                    </article>
                  );
                })}
              </div>

              <section className="overflow-hidden rounded-[1.6rem] border border-slate-900/6 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-left">
                    <thead className="bg-slate-950 text-white">
                      <tr>
                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]">Product</th>
                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]">Unit</th>
                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]">Transactions</th>
                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]">Quantity</th>
                        <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr className="border-t border-slate-900/6" key={row.prodCode}>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">{row.description}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                              {row.prodCode}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">{row.unit}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{formatCompactNumber(row.totalTransactions)}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{formatQuantity(row.totalQuantity)}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-900">{formatCurrency(row.totalRevenue)}</td>
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
              label="Average revenue / product"
              note="Average across visible rows."
              tone="warm"
              value={formatCurrency(rows.length === 0 ? 0 : totalRevenue / rows.length)}
            />
            <ReportMetricCard
              label="Total product revenue"
              note="Revenue across visible rows."
              value={formatCurrency(totalRevenue)}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ReportsTopProductsPage;
