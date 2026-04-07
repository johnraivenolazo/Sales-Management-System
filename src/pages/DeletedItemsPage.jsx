import { useEffect, useMemo, useState } from "react";
import PageLoadingState from "../components/PageLoadingState.jsx";
import {
  formatCurrency,
  formatDisplayDate,
  formatQuantity,
} from "../features/sales/salesFormatting.js";
import { useAuth } from "../hooks/useAuth.js";
import { getCustomers, getEmployees, getProducts } from "../services/lookupService.js";
import { recoverDetailLine } from "../services/salesDetailService.js";
import { getSales, recoverSale } from "../services/salesService.js";
import { supabase } from "../lib/supabaseClient.js";

function TabButton({ active, children, onClick }) {
  return (
    <button
      className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function StatusBadge({ value = "INACTIVE" }) {
  return (
    <span className="inline-flex rounded-full border border-rose-900/15 bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-700">
      {value}
    </span>
  );
}

function buildLookupMap(rows, keyName) {
  return (rows ?? []).reduce((lookupMap, row) => {
    lookupMap[row[keyName]] = row;
    return lookupMap;
  }, {});
}

async function getInactiveDetailRows() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("salesdetail")
    .select("transNo:transno, prodCode:prodcode, quantity, unitPrice:unitprice_snapshot, record_status, stamp")
    .eq("record_status", "INACTIVE")
    .order("transno", { ascending: false })
    .order("prodcode", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

function DeletedItemsPage() {
  const { currentUser } = useAuth();
  const userType = String(currentUser?.user_type ?? "").toUpperCase();
  const canSeeStamp = userType !== "USER";
  const [activeTab, setActiveTab] = useState("transactions");
  const [workspace, setWorkspace] = useState({
    transactions: [],
    details: [],
    isLoading: true,
    error: "",
  });
  const [actionError, setActionError] = useState("");
  const [processingKey, setProcessingKey] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDeletedItems() {
      try {
        const [salesRows, detailRows, customerRows, employeeRows, productRows] =
          await Promise.all([
            getSales(userType),
            getInactiveDetailRows(),
            getCustomers(),
            getEmployees(),
            getProducts(),
          ]);

        if (!active) {
          return;
        }

        const customerMap = buildLookupMap(customerRows, "custno");
        const employeeMap = buildLookupMap(employeeRows, "empno");
        const productMap = buildLookupMap(productRows, "prodCode");

        setWorkspace({
          transactions: salesRows
            .filter((sale) => sale.record_status === "INACTIVE")
            .map((sale) => ({
              ...sale,
              customerName: customerMap[sale.custNo]?.custname ?? "Unknown customer",
              employeeName:
                [employeeMap[sale.empNo]?.lastname, employeeMap[sale.empNo]?.firstname]
                  .filter(Boolean)
                  .join(", ") || "Unknown employee",
            })),
          details: detailRows.map((detail) => ({
            ...detail,
            description: productMap[detail.prodCode]?.description ?? "Unknown product",
            unit: productMap[detail.prodCode]?.unit ?? "N/A",
            unitPrice: Number(detail.unitPrice ?? 0),
            rowTotal: Number(detail.quantity ?? 0) * Number(detail.unitPrice ?? 0),
          })),
          isLoading: false,
          error: "",
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setWorkspace({
          transactions: [],
          details: [],
          isLoading: false,
          error: error.message ?? "Unable to load deleted items.",
        });
      }
    }

    void loadDeletedItems();

    return () => {
      active = false;
    };
  }, [userType, processingKey]);

  const metrics = useMemo(() => {
    return {
      transactions: workspace.transactions.length,
      details: workspace.details.length,
      totalValue: workspace.details.reduce(
        (sum, detail) => sum + Number(detail.rowTotal ?? 0),
        0,
      ),
    };
  }, [workspace.details, workspace.transactions]);

  async function handleRecoverTransaction(transNo) {
    setActionError("");
    setProcessingKey(`tx-${transNo}`);

    try {
      await recoverSale(
        transNo,
        `RECOVER ${transNo} ${new Date().toISOString()}`,
      );
    } catch (error) {
      setActionError(error.message ?? `Unable to recover ${transNo}.`);
    } finally {
      setProcessingKey("");
    }
  }

  async function handleRecoverLineItem(transNo, prodCode) {
    setActionError("");
    setProcessingKey(`detail-${transNo}-${prodCode}`);

    try {
      await recoverDetailLine(
        transNo,
        prodCode,
        `RECOVER ${transNo}/${prodCode} ${new Date().toISOString()}`,
      );
    } catch (error) {
      setActionError(
        error.message ?? `Unable to recover ${transNo}/${prodCode}.`,
      );
    } finally {
      setProcessingKey("");
    }
  }

  if (workspace.isLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Deleted items"
        title="Loading deleted items"
        description="Getting inactive transactions and line items."
      />
    );
  }

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-[2.1rem] border border-slate-900/5 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.95fr]">
          <div className="bg-[linear-gradient(135deg,#1f1423_0%,#3a1834_45%,#5c2437_100%)] px-5 py-6 text-white sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
              Deleted items
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-[2.8rem]">
              Recover inactive records
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
              Restore transactions and line items when needed.
            </p>
          </div>

          <div className="grid gap-3 bg-[#f1e6d2] px-5 py-6 sm:grid-cols-3 lg:grid-cols-1 lg:px-6">
            <article className="rounded-[1.3rem] border border-slate-900/5 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                Transactions
              </p>
              <p className="mt-3 text-[1.7rem] font-black tracking-tight text-slate-900">
                {metrics.transactions}
              </p>
            </article>
            <article className="rounded-[1.3rem] border border-slate-900/5 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                Line items
              </p>
              <p className="mt-3 text-[1.7rem] font-black tracking-tight text-slate-900">
                {metrics.details}
              </p>
            </article>
            <article className="rounded-[1.3rem] border border-slate-900/5 bg-slate-900 p-4 shadow-sm text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                Estimated value
              </p>
              <p className="mt-3 text-[1.7rem] font-black tracking-tight">
                {formatCurrency(metrics.totalValue)}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-900/5 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <TabButton
            active={activeTab === "transactions"}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </TabButton>
          <TabButton
            active={activeTab === "details"}
            onClick={() => setActiveTab("details")}
          >
            Line items
          </TabButton>
        </div>
      </section>

      {workspace.error ? (
        <section className="rounded-[2rem] border border-rose-900/10 bg-rose-50 px-6 py-5 text-sm leading-6 text-rose-900 shadow-sm">
          {workspace.error}
        </section>
      ) : null}

      {actionError ? (
        <section className="rounded-[2rem] border border-rose-900/10 bg-rose-50 px-6 py-5 text-sm leading-6 text-rose-900 shadow-sm">
          {actionError}
        </section>
      ) : null}

      {activeTab === "transactions" ? (
          <div className="grid gap-4">
           {workspace.transactions.length === 0 ? (
             <section className="rounded-[2rem] border border-dashed border-slate-900/10 bg-white p-10 text-center shadow-sm">
               <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                 Nothing to recover
               </p>
               <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                 No inactive transactions are waiting right now.
               </h3>
             </section>
           ) : null}
            {workspace.transactions.map((sale) => (
            <article className="rounded-[1.75rem] border border-slate-900/5 bg-white p-5 shadow-sm" key={sale.transNo}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                    {sale.transNo}
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                    {sale.customerName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{sale.employeeName}</p>
                </div>
                <StatusBadge />
              </div>

              <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                <p>
                  Date:{" "}
                  <span className="font-semibold text-slate-900">
                    {formatDisplayDate(sale.salesDate)}
                  </span>
                </p>
                <p>
                  Customer code:{" "}
                  <span className="font-semibold text-slate-900">{sale.custNo}</span>
                </p>
                <p>
                  Employee code:{" "}
                  <span className="font-semibold text-slate-900">{sale.empNo}</span>
                </p>
                {canSeeStamp ? (
                  <p>
                    Stamp:{" "}
                    <span className="font-semibold text-slate-900">
                      {sale.stamp || "N/A"}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="mt-5">
                <button
                  className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  onClick={() => handleRecoverTransaction(sale.transNo)}
                  type="button"
                >
                  Recover transaction
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
          <div className="grid gap-4">
           {workspace.details.length === 0 ? (
             <section className="rounded-[2rem] border border-dashed border-slate-900/10 bg-white p-10 text-center shadow-sm">
               <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                 Nothing to recover
               </p>
               <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                 No inactive line items are waiting right now.
               </h3>
             </section>
           ) : null}
            {workspace.details.map((detail) => (
            <article className="rounded-[1.75rem] border border-slate-900/5 bg-white p-5 shadow-sm" key={`${detail.transNo}-${detail.prodCode}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                    {detail.transNo}
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                    {detail.prodCode} · {detail.description}
                  </h3>
                </div>
                <StatusBadge />
              </div>

              <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                <p>
                  Quantity:{" "}
                  <span className="font-semibold text-slate-900">
                    {formatQuantity(detail.quantity)} {detail.unit}
                  </span>
                </p>
                <p>
                  Unit price:{" "}
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(detail.unitPrice)}
                  </span>
                </p>
                <p>
                  Row total:{" "}
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(detail.rowTotal)}
                  </span>
                </p>
                {canSeeStamp ? (
                  <p>
                    Stamp:{" "}
                    <span className="font-semibold text-slate-900">
                      {detail.stamp || "N/A"}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="mt-5">
                <button
                  className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  onClick={() =>
                    handleRecoverLineItem(detail.transNo, detail.prodCode)
                  }
                  type="button"
                >
                  Recover line item
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default DeletedItemsPage;
