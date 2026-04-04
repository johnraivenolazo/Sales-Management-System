import { motion as Motion } from "motion/react";
import { Badge } from "@/components/ui/badge.jsx";
import BrandMark from "@/components/BrandMark.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/motion.js";

function PageLoadingState({
  eyebrow = "Loading",
  title = "Preparing the page",
  description = "Please wait while the app finishes loading the next state.",
  compact = false,
}) {
  return (
    <main
      className={`flex items-center justify-center px-6 py-12 ${
        compact ? "min-h-[40vh]" : "min-h-screen"
      }`}
    >
      <Motion.div
        animate="show"
        className="w-full max-w-2xl"
        initial="hidden"
        variants={scaleIn}
      >
        <Card className="overflow-hidden rounded-[2rem] border-white/70 bg-white/92 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardContent className="p-10 text-center sm:p-12">
            <Motion.div
              animate="show"
              className="mx-auto flex max-w-xl flex-col items-center gap-6"
              initial="hidden"
              variants={staggerContainer}
            >
              <Motion.div variants={fadeUp}>
                <BrandMark imageClassName="h-12 w-12 rounded-[1rem]" />
              </Motion.div>
              <Motion.div
                className="relative flex h-16 w-16 items-center justify-center rounded-full border border-slate-900/8 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(241,229,207,0.95))] shadow-inner"
                variants={fadeUp}
              >
                <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-900"></div>
              </Motion.div>
              <Motion.div className="space-y-4" variants={fadeUp}>
                <Badge className="rounded-full bg-sky-950 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white hover:bg-sky-950">
                  {eyebrow}
                </Badge>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
                </div>
              </Motion.div>
              <Motion.div className="w-full max-w-sm space-y-3" variants={fadeUp}>
                <Skeleton className="h-2.5 w-3/4 rounded-full bg-slate-900/10" />
                <Skeleton className="h-2.5 w-5/12 rounded-full bg-amber-900/15" />
                <Skeleton className="h-2.5 w-2/3 rounded-full bg-slate-900/10" />
              </Motion.div>
            </Motion.div>
          </CardContent>
        </Card>
      </Motion.div>
    </main>
  );
}

export default PageLoadingState;
