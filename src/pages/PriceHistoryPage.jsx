import { useEffect, useMemo, useState } from "react";
import PageLoadingState from "../components/PageLoadingState.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
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
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Filter by product
          </span>
          <select
            aria-label="Filter price history by product"
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
        </label>
      </section>

      {error ? (
        <section className="rounded-[2rem] border border-rose-900/10 bg-rose-50 px-6 py-5 text-sm leading-6 text-rose-900 shadow-sm">
          {error}
        </section>
      ) : null}

      <div className="grid gap-4 lg:hidden">
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

      <section className="hidden overflow-hidden rounded-[1.75rem] border border-slate-900/5 bg-white shadow-sm lg:block">
        <Table className="min-w-full text-left text-[13px]">
          <TableHeader className="bg-slate-900 text-white">
            <TableRow>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">Product</TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">Description</TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">Effective date</TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">Unit price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow className="border-t border-slate-900/5 odd:bg-white even:bg-slate-50/40" key={`${row.prodCode}-${row.effDate}`}>
                <TableCell className="px-4 py-3 font-black tracking-tight text-slate-900">{row.prodCode}</TableCell>
                <TableCell className="px-4 py-3 text-sm font-semibold text-slate-900">{row.description}</TableCell>
                <TableCell className="px-4 py-3 text-sm text-slate-600">{formatDisplayDate(row.effDate)}</TableCell>
                <TableCell className="px-4 py-3 text-sm text-slate-600">{formatCurrency(row.unitPrice)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </LookupPageShell>
  );
}

export default PriceHistoryPage;
