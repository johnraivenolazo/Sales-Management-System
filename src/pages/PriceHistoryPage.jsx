import { useEffect, useMemo, useState } from "react";
import PageLoadingState from "../components/PageLoadingState.jsx";
import { LookupPageShell } from "../features/lookups/LookupPageShell.jsx";
import { formatCurrency, formatDisplayDate } from "../features/sales/salesFormatting.js";
import { getPriceHistory, getProducts } from "../services/lookupService.js";

function PriceHistoryPage() {
  const [priceHistory, setPriceHistory] = useState([]);
  const [productFilter, setProductFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPriceHistory() {
      try {
        const [priceRows, productRows] = await Promise.all([
          getPriceHistory(),
          getProducts(),
        ]);

        if (!active) {
          return;
        }

        const productMap = productRows.reduce((lookupMap, product) => {
          lookupMap[product.prodCode] = product;
          return lookupMap;
        }, {});

        setPriceHistory(
          priceRows.map((row) => ({
            ...row,
            description: productMap[row.prodCode]?.description ?? "Unknown product",
          })),
        );
        setIsLoading(false);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setError(nextError.message ?? "Unable to load the price history lookup.");
        setIsLoading(false);
      }
    }

    void loadPriceHistory();

    return () => {
      active = false;
    };
  }, []);

  const productOptions = useMemo(() => {
    const uniqueProducts = new Map();

    priceHistory.forEach((row) => {
      uniqueProducts.set(row.prodCode, {
        value: row.prodCode,
        label: `${row.prodCode} · ${row.description}`,
      });
    });

    return Array.from(uniqueProducts.values()).sort((left, right) =>
      left.label.localeCompare(right.label),
    );
  }, [priceHistory]);

  const filteredRows = useMemo(() => {
    return priceHistory.filter((row) => {
      return productFilter === "ALL" || row.prodCode === productFilter;
    });
  }, [priceHistory, productFilter]);

  if (isLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Price history"
        title="Loading price history"
        description="Preparing the historical price ledger for product lookups."
      />
    );
  }

  return (
    <LookupPageShell
      eyebrow="Price history"
      metrics={[
        { label: "Visible entries", value: filteredRows.length },
        { label: "Products tracked", value: productOptions.length },
      ]}
      summary="This lookup supports current-price autofill by exposing the latest and historical `priceHist` rows in a read-only ledger."
      title="Price history ledger"
    >
      <section className="rounded-[2rem] border border-slate-900/5 bg-white p-5 shadow-sm">
        <select
          className="w-full rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900/30 focus:bg-white"
          onChange={(event) => setProductFilter(event.target.value)}
          value={productFilter}
        >
          <option value="ALL">All products</option>
          {productOptions.map((product) => (
            <option key={product.value} value={product.value}>
              {product.label}
            </option>
          ))}
        </select>
      </section>

      {error ? (
        <section className="rounded-[2rem] border border-rose-900/10 bg-rose-50 px-6 py-5 text-sm leading-6 text-rose-900 shadow-sm">
          {error}
        </section>
      ) : null}

      <div className="grid gap-4 xl:hidden">
        {filteredRows.map((row) => (
          <article className="rounded-[1.75rem] border border-slate-900/5 bg-white p-5 shadow-sm" key={`${row.prodCode}-${row.effDate}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              {row.prodCode}
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
              {row.description}
            </h3>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <p>
                Effective:{" "}
                <span className="font-semibold text-slate-900">{formatDisplayDate(row.effDate)}</span>
              </p>
              <p>
                Unit price:{" "}
                <span className="font-semibold text-slate-900">{formatCurrency(row.unitPrice)}</span>
              </p>
            </div>
          </article>
        ))}
      </div>

      <section className="hidden overflow-hidden rounded-[2rem] border border-slate-900/5 bg-white shadow-sm xl:block">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Product</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Description</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Effective date</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Unit price</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr className="border-t border-slate-900/5" key={`${row.prodCode}-${row.effDate}`}>
                  <td className="px-5 py-4 font-black tracking-tight text-slate-900">{row.prodCode}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">{row.description}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDisplayDate(row.effDate)}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatCurrency(row.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </LookupPageShell>
  );
}

export default PriceHistoryPage;
