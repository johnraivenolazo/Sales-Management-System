import { Plus } from "lucide-react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
import { Link, useParams } from "react-router-dom";
import EmptyStatePanel from "../components/EmptyStatePanel.jsx";
import PageLoadingState from "../components/PageLoadingState.jsx";
import { ConfirmActionDialog } from "../features/sales/SalesFormDialog.jsx";
import { LineItemFormDialog } from "../features/sales/LineItemFormDialog.jsx";
import { useSalesDetailWorkspace } from "../features/sales/useSalesDetailWorkspace.js";
import {
  formatCurrency,
  formatDisplayDate,
  formatQuantity,
} from "../features/sales/salesFormatting.js";
import { useAuth } from "../hooks/useAuth.js";
import { useRights } from "../hooks/useRights.js";
import {
  addDetailLine,
  softDeleteDetailLine,
  updateDetailLine,
} from "../services/salesDetailService.js";

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

function createLineItemForm() {
  return {
    prodCode: "",
    quantity: "1",
  };
}

function AccessDeniedState() {
  return (
    <section className="rounded-[2rem] border border-amber-900/10 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
        Sales detail access
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
        Your current rights map does not include Sales Detail viewing access.
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600">
        Ask an admin to grant Sales Detail access.
      </p>
      <Link
        className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        to="/sales"
      >
        Back to transactions
      </Link>
    </section>
  );
}

function SalesDetailPage() {
  const { transNo = "" } = useParams();
  const { currentUser } = useAuth();
  const {
    canCreateSalesDetail,
    canDeleteSalesDetail,
    canEditSalesDetail,
    canSeeStamp,
    canViewSalesDetail,
    isRightsLoading,
  } = useRights();
  const userType = String(currentUser?.user_type ?? "").toUpperCase();
  const {
    sale,
    details,
    error,
    isLoading,
    metrics,
    productOptions,
    refreshWorkspace,
  } = useSalesDetailWorkspace(transNo, userType);
  const [activeDialog, setActiveDialog] = useState(null);
  const [activeDetail, setActiveDetail] = useState(null);
  const [form, setForm] = useState(createLineItemForm());
  const [dialogError, setDialogError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function closeDialog() {
    setActiveDialog(null);
    setActiveDetail(null);
    setDialogError("");
    setForm(createLineItemForm());
  }

  function openCreateDialog() {
    setActiveDetail(null);
    setDialogError("");
    setForm(createLineItemForm());
    setActiveDialog("create");
  }

  function openEditDialog(detail) {
    setActiveDetail(detail);
    setDialogError("");
    setForm({
      prodCode: detail.prodCode,
      quantity: String(detail.quantity ?? 0),
    });
    setActiveDialog("edit");
  }

  function openDeleteDialog(detail) {
    setActiveDetail(detail);
    setDialogError("");
    setActiveDialog("delete");
  }

  function handleChange(event) {
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
        await addDetailLine({
          transNo,
          ...form,
        });
      } else if (activeDialog === "edit" && activeDetail) {
        await updateDetailLine(transNo, activeDetail.prodCode, {
          ...form,
        });
      }

      refreshWorkspace();
      closeDialog();
    } catch (nextError) {
      setDialogError(nextError.message ?? "Unable to save the line item.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!activeDetail) {
      return;
    }

    setIsSaving(true);
    setDialogError("");

    try {
      await softDeleteDetailLine(
        transNo,
        activeDetail.prodCode,
        `SOFT-DEL ${transNo}/${activeDetail.prodCode} ${new Date().toISOString()}`,
      );
      refreshWorkspace();
      closeDialog();
    } catch (nextError) {
      setDialogError(nextError.message ?? "Unable to soft-delete the line item.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || isRightsLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Sales detail"
        title={`Loading ${transNo}`}
        description="Getting transaction details."
      />
    );
  }

  if (!canViewSalesDetail) {
    return <AccessDeniedState />;
  }

  if (error || !sale) {
    return (
      <section className="rounded-[2rem] border border-rose-900/10 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">
          Sales detail error
        </p>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
          {transNo} is not available.
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {error || "The transaction could not be loaded for the current user."}
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          to="/sales"
        >
          Back to transactions
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-[2.1rem] border border-slate-900/5 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="bg-[linear-gradient(135deg,#111827_0%,#19253d_45%,#274567_100%)] px-5 py-6 text-white sm:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
                Sales detail
              </p>
              <StatusBadge value={sale.record_status} />
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-[2.8rem]">
              {sale.transNo}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
              Review the transaction header and line items.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <div className="rounded-full border border-white/15 px-4 py-3 text-white/75">
                {sale.customerName}
              </div>
              <div className="rounded-full border border-white/15 px-4 py-3 text-white/75">
                {sale.employeeName}
              </div>
              <div className="rounded-full border border-white/15 px-4 py-3 text-white/75">
                {formatDisplayDate(sale.salesDate)}
              </div>
            </div>
          </div>

          <div className="grid gap-3 bg-[#f1e6d2] px-5 py-6 sm:grid-cols-3 lg:grid-cols-1 lg:px-6">
            <article className="rounded-[1.3rem] border border-slate-900/5 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                Line items
              </p>
              <p className="mt-3 text-[1.7rem] font-black tracking-tight text-slate-900">
                {metrics.lineCount}
              </p>
            </article>
            <article className="rounded-[1.3rem] border border-slate-900/5 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                Quantity
              </p>
              <p className="mt-3 text-[1.7rem] font-black tracking-tight text-slate-900">
                {formatQuantity(metrics.quantity)}
              </p>
            </article>
            <article className="rounded-[1.3rem] border border-slate-900/5 bg-slate-900 p-4 shadow-sm text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                Estimated total
              </p>
              <p className="mt-3 text-[1.7rem] font-black tracking-tight">
                {formatCurrency(metrics.totalAmount)}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-900/5 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Transaction context
            </p>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Customer
                </p>
                <p className="mt-1 font-semibold text-slate-900">{sale.customerName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Employee
                </p>
                <p className="mt-1 font-semibold text-slate-900">{sale.employeeName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Sales date
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatDisplayDate(sale.salesDate)}
                </p>
              </div>
              {canSeeStamp ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Stamp
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{sale.stamp || "N/A"}</p>
                </div>
              ) : null}
            </div>
          </div>

          {canCreateSalesDetail ? (
            <button
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md"
              onClick={openCreateDialog}
              type="button"
            >
              <Plus className="size-4" />
              Add line item
            </button>
          ) : null}
        </div>
      </section>

      {details.length === 0 ? (
        <EmptyStatePanel
          eyebrow="No matching records"
          title="This transaction has no visible line items yet."
          description="Add the first line item to continue."
        />
      ) : null}

      <div className="grid gap-4 lg:hidden">
        {details.map((detail) => (
          <article className="rounded-[1.75rem] border border-slate-900/5 bg-white p-5 shadow-sm" key={`${detail.transNo}-${detail.prodCode}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                  {detail.prodCode}
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {detail.description}
                </h3>
              </div>
              <StatusBadge value={detail.record_status} />
            </div>

            <dl className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Quantity
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {formatQuantity(detail.quantity)} {detail.unit}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Unit price
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {formatCurrency(detail.unitPrice)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Row total
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {formatCurrency(detail.rowTotal)}
                </dd>
              </div>
              {canSeeStamp ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Stamp
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-slate-900">
                    {detail.stamp || "N/A"}
                  </dd>
                </div>
              ) : null}
            </dl>

            {(canEditSalesDetail || canDeleteSalesDetail) ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {canEditSalesDetail ? (
                  <button
                    className="inline-flex rounded-full border border-slate-900/10 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900/30 hover:bg-slate-50"
                    onClick={() => openEditDialog(detail)}
                    type="button"
                  >
                    Edit line
                  </button>
                ) : null}
                {canDeleteSalesDetail ? (
                  <button
                    className="inline-flex rounded-full border border-rose-900/15 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                    onClick={() => openDeleteDialog(detail)}
                    type="button"
                  >
                    Soft delete
                  </button>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <section className="hidden overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] lg:block">
        <Table className="min-w-[64rem] text-left text-[13px]">
          <TableHeader className="sticky top-0 z-10 bg-slate-900 text-white">
            <TableRow className="border-slate-900/5 hover:bg-slate-950">
              <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Product</TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Description</TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Quantity</TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Unit price</TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Row total</TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Status</TableHead>
              {canSeeStamp ? (
                <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Stamp</TableHead>
              ) : null}
              {(canEditSalesDetail || canDeleteSalesDetail) ? (
                <TableHead className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Manage</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((detail) => (
              <TableRow className="border-t border-slate-900/5 align-top odd:bg-white even:bg-slate-50/40" key={`${detail.transNo}-${detail.prodCode}`}>
                <TableCell className="px-4 py-3.5 font-black tracking-tight text-slate-900">{detail.prodCode}</TableCell>
                <TableCell className="px-4 py-3.5 text-sm text-slate-600">{detail.description}</TableCell>
                <TableCell className="px-4 py-3.5 text-sm text-slate-600">{formatQuantity(detail.quantity)} {detail.unit}</TableCell>
                <TableCell className="px-4 py-3.5 text-sm text-slate-600">{formatCurrency(detail.unitPrice)}</TableCell>
                <TableCell className="px-4 py-3.5 text-sm font-semibold text-slate-900">{formatCurrency(detail.rowTotal)}</TableCell>
                <TableCell className="px-4 py-3.5"><StatusBadge value={detail.record_status} /></TableCell>
                {canSeeStamp ? (
                  <TableCell className="px-4 py-3.5 text-sm text-slate-500">{detail.stamp || "N/A"}</TableCell>
                ) : null}
                {(canEditSalesDetail || canDeleteSalesDetail) ? (
                  <TableCell className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {canEditSalesDetail ? (
                        <button className="inline-flex h-8 items-center justify-center rounded-full border border-slate-900/10 px-3 text-xs font-semibold text-slate-900 transition hover:border-slate-900/30 hover:bg-slate-50" onClick={() => openEditDialog(detail)} type="button">Edit</button>
                      ) : null}
                      {canDeleteSalesDetail ? (
                        <button className="inline-flex h-8 items-center justify-center rounded-full border border-rose-900/15 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50" onClick={() => openDeleteDialog(detail)} type="button">Delete</button>
                      ) : null}
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {activeDialog === "create" || activeDialog === "edit" ? (
        <LineItemFormDialog
          error={dialogError}
          form={form}
          isSaving={isSaving}
          mode={activeDialog}
          onChange={handleChange}
          onClose={closeDialog}
          onSubmit={handleSubmit}
          productOptions={productOptions}
        />
      ) : null}

      {activeDialog === "delete" && activeDetail ? (
        <ConfirmActionDialog
          description={`Confirm delete line item ${activeDetail.prodCode} for transaction ${transNo}? This marks the row INACTIVE so it can be recovered later.`}
          error={dialogError}
          isSaving={isSaving}
          onClose={closeDialog}
          onConfirm={handleConfirmDelete}
          title={`Soft delete ${activeDetail.prodCode}`}
        />
      ) : null}
    </div>
  );
}

export default SalesDetailPage;
