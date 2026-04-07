import { cn } from "@/lib/utils.js";

function BrandMark({
  className,
  imageClassName,
  frame = true,
  showText = true,
  tone = "default",
}) {
  const eyebrowClassName =
    tone === "light" ? "text-amber-300" : "text-amber-800";
  const titleClassName =
    tone === "light" ? "text-white" : "text-slate-950";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center",
          frame ? "rounded-2xl border border-slate-200/80 bg-white shadow-sm" : "bg-transparent shadow-none",
        )}
      >
        <img
          alt="Hope, Inc. logo"
          className={cn("h-10 w-10 rounded-[1rem] object-cover", imageClassName)}
          src="/logo.png"
        />
      </div>
      {showText ? (
        <div className="min-w-0">
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.24em]", eyebrowClassName)}>
            Hope, Inc.
          </p>
          <p className={cn("truncate text-sm font-semibold", titleClassName)}>
            Sales Management System
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default BrandMark;
