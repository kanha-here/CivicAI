import { ArrowRight, ChevronRight, CheckCircle2, ShieldCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#dfeee7] pt-18 pb-16 sm:pt-20 sm:pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[length:90px_90px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl text-center"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-800">
              AI-powered civic action
            </span>
          </div>

          <h1 className="text-5xl font-black leading-[0.9] tracking-[-0.07em] text-slate-950 sm:text-7xl lg:text-[9rem]">
            Every voice
            <br />
            <span className="block">deserves</span>
            <span className="mt-2 block bg-gradient-to-r from-emerald-600 via-emerald-600 to-sky-500 bg-clip-text text-transparent">
              Visible Action.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-600 sm:text-xl">
            In your words, we direct, flag, and track your concerns to resolution.
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-7 py-4 text-base font-bold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white sm:w-auto"
            >
              See how it works
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
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
      </div>
    </section>
  );
}
