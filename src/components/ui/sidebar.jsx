/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { cn } from "@/lib/utils.js";

const SidebarContext = createContext(null);

function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}

export function SidebarProvider({ children }) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);

  const value = useMemo(
    () => ({
      isMobile,
      openMobile,
      setOpenMobile,
      toggleMobileSidebar: () => setOpenMobile((current) => !current),
    }),
    [isMobile, openMobile],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used inside SidebarProvider.");
  }

  return context;
}

export function Sidebar({ children, className }) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <>
        {openMobile ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close navigation"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
              onClick={() => setOpenMobile(false)}
              type="button"
            />
            <aside
              className={cn(
                "absolute inset-y-0 left-0 flex h-dvh max-h-dvh w-[16.5rem] max-w-[84vw] flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[0_28px_80px_rgba(15,23,42,0.18)]",
                className,
              )}
            >
              {children}
            </aside>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <aside
      className={cn(
        "hidden h-dvh max-h-dvh w-[16.5rem] shrink-0 overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:flex lg:flex-col",
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ children, className }) {
  return (
    <div className={cn("border-b border-sidebar-border px-4 py-4", className)}>
      {children}
    </div>
  );
}

export function SidebarContent({ children, className }) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4", className)}>
      {children}
    </div>
  );
}

export function SidebarFooter({ children, className }) {
  return (
    <div className={cn("shrink-0 border-t border-sidebar-border px-4 py-4", className)}>
      {children}
    </div>
  );
}

export function SidebarGroup({ children, className }) {
  return <section className={cn("mb-6", className)}>{children}</section>;
}

export function SidebarGroupLabel({ children, className }) {
  return (
    <p
      className={cn(
        "mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/45",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SidebarMenu({ children, className }) {
  return <div className={cn("grid gap-1.5", className)}>{children}</div>;
}

export function SidebarInset({ children, className }) {
  return <div className={cn("min-w-0 flex-1", className)}>{children}</div>;
}

export function SidebarTrigger({ className }) {
  const { isMobile, openMobile, setOpenMobile, toggleMobileSidebar } = useSidebar();

  return (
    <Button
      aria-label={openMobile ? "Close navigation" : "Open navigation"}
      className={cn("rounded-full lg:hidden", className)}
      onClick={() => {
        if (isMobile) {
          toggleMobileSidebar();
        } else {
          setOpenMobile(false);
        }
      }}
      size="icon"
      type="button"
      variant="outline"
    >
      {openMobile ? <X className="size-4" /> : <Menu className="size-4" />}
    </Button>
  );
}
