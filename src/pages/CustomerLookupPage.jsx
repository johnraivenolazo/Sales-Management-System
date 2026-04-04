import { useEffect, useMemo, useState } from "react";
import PageLoadingState from "../components/PageLoadingState.jsx";
import { LookupPageShell } from "../features/lookups/LookupPageShell.jsx";
import { getCustomers } from "../services/lookupService.js";

function CustomerLookupPage() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCustomers() {
      try {
        const rows = await getCustomers();

        if (!active) {
          return;
        }

        setCustomers(rows);
        setIsLoading(false);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setError(nextError.message ?? "Unable to load the customer lookup.");
        setIsLoading(false);
      }
    }

    void loadCustomers();

    return () => {
      active = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return customers.filter((customer) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        customer.custno.toLowerCase().includes(normalizedQuery) ||
        customer.custname.toLowerCase().includes(normalizedQuery) ||
        customer.address.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [customers, query]);

  if (isLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Customer lookup"
        title="Loading customer reference data"
        description="Preparing the read-only customer directory for the sales workspace."
      />
    );
  }

  return (
    <LookupPageShell
      eyebrow="Customer lookup"
      metrics={[
        { label: "Visible customers", value: filteredCustomers.length },
        { label: "Terms in use", value: new Set(filteredCustomers.map((customer) => customer.payterm)).size },
      ]}
      summary="This lookup powers the customer dropdown in the sales create/edit flow and keeps all customer data strictly read-only."
      title="Customer reference directory"
    >
      <section className="rounded-[2rem] border border-slate-900/5 bg-white p-5 shadow-sm">
        <input
          className="w-full rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900/30 focus:bg-white"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search customer code, name, or address"
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
        {filteredCustomers.map((customer) => (
          <article className="rounded-[1.75rem] border border-slate-900/5 bg-white p-5 shadow-sm" key={customer.custno}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              {customer.custno}
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
              {customer.custname}
            </h3>
            <p className="mt-4 text-sm leading-6 text-slate-600">{customer.address}</p>
            <div className="mt-4 inline-flex rounded-full border border-slate-900/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              {customer.payterm}
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
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Customer</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Address</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Pay term</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr className="border-t border-slate-900/5" key={customer.custno}>
                  <td className="px-5 py-4 font-black tracking-tight text-slate-900">{customer.custno}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">{customer.custname}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{customer.address}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{customer.payterm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </LookupPageShell>
  );
}

export default CustomerLookupPage;
