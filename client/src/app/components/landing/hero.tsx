import { ArrowRight, ChevronRight, CheckCircle2, ShieldCheck, Clock, Brain, Zap, Landmark, Activity } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#f7fbfa] dark:bg-[#061512] pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[620px] w-[920px] -translate-x-1/2 rounded-full bg-emerald-200/45 dark:bg-emerald-500/10 blur-[110px]" />
        <div className="absolute -right-32 top-44 h-80 w-80 rounded-full bg-sky-100/70 dark:bg-sky-400/10 blur-[100px]" />
        <div className="absolute inset-0 bg-grid-light dark:bg-grid opacity-30 dark:opacity-[0.04]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-300/20 bg-white/80 dark:bg-white/5 px-4 py-2 shadow-sm dark:shadow-none backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">
              AI-powered civic action
            </span>
          </div>

          <h1 className="text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-slate-950 dark:text-white sm:text-7xl lg:text-[5.4rem]">
            Every voice deserves
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 bg-clip-text text-transparent">
              visible action.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
            Describe what is wrong in your own words. CivicAI sends it to the right department, flags what matters most, and keeps you informed until it is resolved.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-7 py-4 text-base font-bold text-white shadow-xl shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-500 active:scale-[0.98] sm:w-auto"
            >
              File a complaint
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/15 bg-white/75 dark:bg-white/5 px-7 py-4 text-base font-bold text-slate-800 dark:text-white shadow-sm dark:shadow-none transition-all hover:-translate-y-0.5 hover:border-emerald-300 dark:hover:bg-white/10 hover:bg-white sm:w-auto"
            >
              See how it works
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Free to use
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure and private
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-600" /> Real-time updates
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto mt-14 max-w-5xl sm:mt-20"
        >
          <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-r from-emerald-200/40 via-sky-100/50 to-emerald-100/30 dark:from-emerald-500/10 dark:via-sky-500/10 dark:to-emerald-500/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#10221e]/90 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.35)] dark:shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-5 py-4 sm:px-7">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Brain className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">CivicAI routing desk</span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                <Activity className="h-3.5 w-3.5" /> Live
              </span>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-[1.15fr_0.85fr] sm:p-7">
              <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5 text-left">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    New complaint
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Just now</span>
                </div>
                <p className="text-lg font-semibold leading-7 text-slate-800 dark:text-white">
                  &ldquo;The streetlight near Block C has been out for three nights.&rdquo;
                </p>
                <div className="mt-7 flex items-center gap-3 border-t border-slate-200/70 dark:border-white/10 pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Priority detected</p>
                    <p className="text-xs text-slate-500">Safety issue &middot; Medium urgency</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-2xl bg-emerald-600 p-5 text-left text-white sm:p-6">
                <div>
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Automatically routed to</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">Public Works</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-100">The right team has everything they need to act.</p>
                </div>
                <div className="mt-8 flex items-center gap-2 border-t border-white/20 pt-4 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> Status updates enabled
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
