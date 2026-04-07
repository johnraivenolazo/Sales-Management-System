import { Plus } from "lucide-react";
import { useEffect, useId, useRef } from "react";

function FieldLabel({ children }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
      {children}
    </span>
  );
}

function DialogFrame({ children, onClose, title, tone = "slate" }) {
  const dialogId = useId();
  const containerRef = useRef(null);
  const closeButtonRef = useRef(null);

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

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  const toneClassName =
    tone === "rose"
      ? "border-rose-900/10 bg-rose-50"
      : "border-slate-900/6 bg-white/95";

  return (
    <div
      aria-modal="true"
      aria-labelledby={dialogId}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-4 py-4 backdrop-blur-sm sm:items-center sm:px-6"
      onMouseDown={handleOverlayClick}
      role="dialog"
    >
      <div
        ref={containerRef}
        className={`app-scrollbar max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] border px-5 py-5 shadow-[0_32px_80px_rgba(15,23,42,0.28)] sm:rounded-[2rem] sm:px-7 sm:py-6 ${toneClassName}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              Sales
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900" id={dialogId}>
              {title}
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
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function SalesFormDialog({
  customerOptions,
  employeeOptions,
  error,
  form,
  isSaving,
  mode,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <DialogFrame
      onClose={onClose}
      title={mode === "create" ? "Create transaction" : `Edit ${form.transNo}`}
    >
      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2">
            <FieldLabel>Transaction no</FieldLabel>
            <input
              className="rounded-2xl border border-slate-900/10 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
              disabled
              readOnly
              value={form.transNo}
            />
          </label>

          <label className="grid gap-2">
            <FieldLabel>Sales date</FieldLabel>
            <input
              className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900/30"
              name="salesDate"
              onChange={onChange}
              required
              type="date"
              value={form.salesDate}
            />
          </label>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2">
            <FieldLabel>Customer</FieldLabel>
            <select
              className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900/30"
              name="custNo"
              onChange={onChange}
              required
              value={form.custNo}
            >
              <option value="">Select customer</option>
              {customerOptions.map((customer) => (
                <option key={customer.value} value={customer.value}>
                  {customer.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <FieldLabel>Employee</FieldLabel>
            <select
              className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900/30"
              name="empNo"
              onChange={onChange}
              required
              value={form.empNo}
            >
              <option value="">Select employee</option>
              {employeeOptions.map((employee) => (
                <option key={employee.value} value={employee.value}>
                  {employee.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-[1.5rem] bg-[#f7f1e6] px-5 py-4 text-sm leading-6 text-slate-700">
          Transaction numbers are assigned automatically.
        </div>

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
            {isSaving ? "Saving..." : mode === "create" ? "Create transaction" : "Save changes"}
          </button>
        </div>
      </form>
    </DialogFrame>
  );
}

export function ConfirmActionDialog({
  description,
  error,
  isSaving,
  onClose,
  onConfirm,
  title,
}) {
  return (
    <DialogFrame onClose={onClose} title={title} tone="rose">
      <div className="grid gap-5">
        <div className="rounded-[1.5rem] border border-rose-900/10 bg-white px-5 py-4 text-sm leading-6 text-slate-700">
          {description}
        </div>

        {error ? (
          <div className="rounded-[1.5rem] border border-rose-900/10 bg-white px-4 py-3 text-sm text-rose-900">
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
            className="rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
            disabled={isSaving}
            onClick={onConfirm}
            type="button"
          >
            {isSaving ? "Processing..." : "Confirm change"}
          </button>
        </div>
      </div>
    </DialogFrame>
  );
}
