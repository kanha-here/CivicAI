import { ArrowRight, ChevronRight, CheckCircle2, ShieldCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#edf6f1] dark:bg-[#061512] pt-14 pb-8 sm:pt-16 sm:pb-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-[540px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-200/70 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:28px_28px] opacity-60" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl text-center"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-5 py-2.5 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-800 sm:text-xs">
              AI-powered civic action
            </span>
          </div>

          <h1 className="text-[4.2rem] font-black leading-[0.86] tracking-[-0.06em] text-slate-950 sm:text-[6.6rem] lg:text-[9.2rem]">
            Every voice deserves
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 bg-clip-text text-transparent">
              Visible Action.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-[760px] text-base leading-8 text-slate-600 sm:text-2xl">
            In your words. We direct, flag, and track your concerns to resolution.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-[0_18px_32px_-20px_rgba(5,150,105,0.9)] transition-all hover:-translate-y-0.5 hover:bg-emerald-500 active:scale-[0.98] sm:w-auto"
            >
              File a complaint
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-8 py-4 text-lg font-bold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white sm:w-auto"
            >
              See how it works
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm font-medium text-slate-600">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Free to use
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure and private
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" /> Real-time updates
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto mt-10 max-w-6xl pb-6"
        >
          <div className="pointer-events-none absolute left-10 top-10 hidden h-36 w-36 rounded-full border border-slate-300/70 md:block" />
          <div className="pointer-events-none absolute left-8 bottom-8 hidden h-24 w-24 rounded-full bg-slate-200/50 md:block" />

          <div className="pointer-events-none absolute bottom-0 left-0 hidden h-24 w-24 rounded-full bg-slate-300/50 md:block" />
          <div className="pointer-events-none absolute bottom-0 right-0 hidden h-28 w-28 rounded-full bg-slate-200/60 md:block" />

          <div className="relative h-[160px] overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/20 backdrop-blur-sm md:h-[220px]">
            <div className="absolute left-8 top-10 flex -space-x-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-bold text-slate-600 shadow-sm md:h-12 md:w-12"
                >
                  {item + 1}
                </div>
              ))}
            </div>

            <div className="absolute left-24 top-16 h-16 w-16 rounded-full border border-dashed border-slate-300/80 md:left-40 md:top-20 md:h-20 md:w-20" />
            <div className="absolute left-24 top-20 h-4 w-4 rounded-full bg-slate-800 md:left-40 md:top-26 md:h-5 md:w-5" />
            <div className="absolute left-10 top-20 h-16 w-16 rounded-full border border-slate-200 bg-slate-100/60 md:h-20 md:w-20" />

            <div className="absolute right-0 bottom-0 w-full overflow-hidden opacity-80">
              <div className="flex items-end justify-center gap-2 md:gap-4">
                <div className="h-12 w-10 rounded-t-2xl bg-slate-200/80 md:h-20 md:w-14" />
                <div className="h-16 w-10 rounded-t-2xl bg-slate-200/80 md:h-28 md:w-14" />
                <div className="h-20 w-10 rounded-t-2xl bg-slate-200/80 md:h-32 md:w-14" />
                <div className="h-12 w-10 rounded-t-2xl bg-slate-200/80 md:h-20 md:w-14" />
                <div className="h-24 w-10 rounded-t-2xl bg-slate-200/80 md:h-40 md:w-14" />
                <div className="h-18 w-10 rounded-t-2xl bg-slate-200/80 md:h-28 md:w-14" />
                <div className="h-14 w-10 rounded-t-2xl bg-slate-200/80 md:h-24 md:w-14" />
                <div className="h-20 w-10 rounded-t-2xl bg-slate-200/80 md:h-32 md:w-14" />
                <div className="h-12 w-10 rounded-t-2xl bg-slate-200/80 md:h-18 md:w-14" />
                <div className="h-16 w-10 rounded-t-2xl bg-slate-200/80 md:h-28 md:w-14" />
              </div>
            </div>

            <div className="absolute bottom-0 left-1/2 h-24 w-[70%] -translate-x-1/2 rounded-t-[45%] border-t border-slate-200/80 bg-gradient-to-r from-transparent via-slate-100/80 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
