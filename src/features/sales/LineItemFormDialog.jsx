import { useEffect, useId, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { getCurrentPrice } from "../../services/lookupService.js";
import { formatCurrency } from "./salesFormatting.js";

function FieldLabel({ children }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
      {children}
    </span>
  );
}

export function LineItemFormDialog({
  error,
  form,
  isSaving,
  mode,
  onChange,
  onClose,
  onSubmit,
  productOptions,
}) {
  const dialogId = useId();
  const containerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [priceError, setPriceError] = useState("");
  const [resolvedPrice, setResolvedPrice] = useState(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = containerRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (!focusable || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    let active = true;

    async function loadPrice() {
      if (!form.prodCode) {
        if (active) {
          setResolvedPrice(null);
          setPriceError("");
        }
        return;
      }

      try {
        const currentPrice = await getCurrentPrice(form.prodCode);

        if (active) {
          setResolvedPrice(Number(currentPrice?.unitPrice ?? 0));
          setPriceError("");
        }
      } catch (nextError) {
        if (active) {
          setResolvedPrice(null);
          setPriceError(
            nextError.message ?? "Unable to load the latest unit price.",
          );
        }
      }
    }

    void loadPrice();

    return () => {
      active = false;
    };
  }, [form.prodCode]);

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      aria-labelledby={dialogId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 py-4 sm:items-center sm:px-6"
      onMouseDown={handleOverlayClick}
      role="dialog"
    >
      <div className="app-scrollbar max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] border border-slate-900/5 bg-white px-5 py-5 shadow-2xl sm:rounded-[2rem] sm:px-7 sm:py-6" ref={containerRef}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              Sales detail
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900" id={dialogId}>
              {mode === "create" ? "Add line item" : `Edit ${form.prodCode}`}
            </h2>
          </div>
          <button
            className="inline-flex rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900/25 hover:bg-white"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            Close
          </button>
        </div>

        <form className="mt-6 grid gap-5" onSubmit={onSubmit}>
          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <label className="grid gap-2">
              <FieldLabel>Product</FieldLabel>
              <select
                className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900/30"
                name="prodCode"
                onChange={onChange}
                required
                value={form.prodCode}
              >
                <option value="">Select product</option>
                {productOptions.map((product) => (
                  <option key={product.value} value={product.value}>
                    {product.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <FieldLabel>Quantity</FieldLabel>
              <input
                className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900/30"
                min="0.01"
                name="quantity"
                onChange={onChange}
                required
                step="0.01"
                type="number"
                value={form.quantity}
              />
            </label>
          </div>

          <div className="grid gap-4 rounded-[1.75rem] bg-[#f7f1e6] p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Latest unit price
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {resolvedPrice == null ? "Pending..." : formatCurrency(resolvedPrice)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Estimated line total
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {formatCurrency(Number(form.quantity || 0) * Number(resolvedPrice || 0))}
              </p>
            </div>
          </div>

          {priceError ? (
            <div className="rounded-[1.5rem] border border-amber-700/10 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {priceError}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[1.5rem] border border-rose-900/10 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="rounded-full border border-slate-900/10 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900/25 hover:bg-white"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSaving}
              type="submit"
            >
              {!isSaving && mode === "create" ? <Plus className="size-4" /> : null}
              {isSaving ? "Saving..." : mode === "create" ? "Add line item" : "Save line item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
