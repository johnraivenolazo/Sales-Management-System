import { useEffect, useMemo, useState } from "react";
import PageLoadingState from "../components/PageLoadingState.jsx";
import { LookupPageShell } from "../features/lookups/LookupPageShell.jsx";
import { formatCurrency } from "../features/sales/salesFormatting.js";
import { getPriceHistory, getProducts } from "../services/lookupService.js";

function ProductLookupPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const [productRows, priceHistoryRows] = await Promise.all([
          getProducts(),
          getPriceHistory(),
        ]);

        if (!active) {
          return;
        }

        const latestPriceMap = priceHistoryRows.reduce((priceMap, row) => {
          if (!priceMap[row.prodCode]) {
            priceMap[row.prodCode] = Number(row.unitPrice ?? 0);
          }

          return priceMap;
        }, {});

        setProducts(
          productRows.map((product) => ({
            ...product,
            currentPrice: latestPriceMap[product.prodCode] ?? 0,
          })),
        );
        setIsLoading(false);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setError(nextError.message ?? "Unable to load the product lookup.");
        setIsLoading(false);
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        product.prodCode.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [products, query]);

  if (isLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Product lookup"
        title="Loading product reference data"
        description="Preparing the product directory and current-price snapshot."
      />
    );
  }

  return (
    <LookupPageShell
      eyebrow="Product lookup"
      metrics={[
        { label: "Visible products", value: filteredProducts.length },
        {
          label: "Priced products",
          value: filteredProducts.filter((product) => product.currentPrice > 0).length,
        },
      ]}
      summary="This lookup powers the line-item product selector and shows the latest available unit price without exposing any mutation controls."
      title="Product and current-price directory"
    >
      <section className="rounded-[2rem] border border-slate-900/5 bg-white p-5 shadow-sm">
        <input
          className="w-full rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900/30 focus:bg-white"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search product code or description"
          type="search"
          value={query}
        />
      </section>

      {error ? (
        <section className="rounded-[2rem] border border-rose-900/10 bg-rose-50 px-6 py-5 text-sm leading-6 text-rose-900 shadow-sm">
          {error}
        </section>
      ) : null}

      <div className="grid gap-4 xl:hidden">
        {filteredProducts.map((product) => (
          <article className="rounded-[1.75rem] border border-slate-900/5 bg-white p-5 shadow-sm" key={product.prodCode}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              {product.prodCode}
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
              {product.description}
            </h3>
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-full border border-slate-900/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                {product.unit}
              </div>
              <div className="rounded-full border border-slate-900/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                {formatCurrency(product.currentPrice)}
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="hidden overflow-hidden rounded-[2rem] border border-slate-900/5 bg-white shadow-sm xl:block">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Code</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Description</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Unit</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Current price</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr className="border-t border-slate-900/5" key={product.prodCode}>
                  <td className="px-5 py-4 font-black tracking-tight text-slate-900">{product.prodCode}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">{product.description}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{product.unit}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatCurrency(product.currentPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </LookupPageShell>
  );
}

export default ProductLookupPage;
