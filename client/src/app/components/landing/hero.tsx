import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Send,
  ShieldCheck,
  Eye,
  BadgeCheck,
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

// Faint network-of-citizens + city-skyline illustration used behind the
// hero copy. Kept as plain strokes/shapes at low opacity so it reads as
// background texture rather than competing with the headline, and uses
// currentColor-friendly slate tones so it holds up in both light and dark
// mode without a separate dark-mode illustration.
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 1600 700"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-0 h-full w-full text-slate-400/40 dark:text-white/10"
      aria-hidden="true"
    >
      {/* contour / topography lines */}
      <path d="M-40 560 C 200 520 340 610 560 560 S 900 480 1180 540 1400 600 1680 540" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M-40 600 C 220 640 380 560 620 610 S 960 660 1220 600 1480 560 1680 610" fill="none" stroke="currentColor" strokeWidth="1.5" />

      {/* connector lines between citizen nodes (left cluster) */}
      <g stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 5" fill="none">
        <path d="M180 560 L260 470" />
        <path d="M260 470 L360 400" />
        <path d="M360 400 L300 320" />
        <path d="M360 400 L470 360" />
        <path d="M470 360 L440 470" />
        <path d="M440 470 L520 540" />
      </g>
      {/* small bar-chart glyphs */}
      <g fill="currentColor" opacity="0.7">
        <rect x="292" y="290" width="6" height="20" rx="1.5" />
        <rect x="302" y="280" width="6" height="30" rx="1.5" />
        <rect x="312" y="296" width="6" height="14" rx="1.5" />
        <rect x="462" y="330" width="6" height="18" rx="1.5" />
        <rect x="472" y="318" width="6" height="30" rx="1.5" />
      </g>
      {/* citizen nodes */}
      {[
        { cx: 180, cy: 560, r: 22 },
        { cx: 260, cy: 470, r: 18 },
        { cx: 360, cy: 400, r: 20 },
        { cx: 470, cy: 360, r: 16 },
        { cx: 440, cy: 470, r: 14 },
        { cx: 520, cy: 540, r: 18 },
      ].map((n, i) => (
        <g key={i} transform={`translate(${n.cx} ${n.cy})`}>
          <circle r={n.r} fill="currentColor" opacity="0.12" />
          <circle cy={-n.r * 0.15} r={n.r * 0.32} fill="currentColor" opacity="0.55" />
          <path
            d={`M ${-n.r * 0.55} ${n.r * 0.55} a ${n.r * 0.55} ${n.r * 0.55} 0 0 1 ${n.r * 1.1} 0 Z`}
            fill="currentColor"
            opacity="0.55"
          />
        </g>
      ))}
      {/* highlighted "submitting" node with a send-icon badge */}
      <g transform="translate(180 560)">
        <circle r="8" fill="#059669" opacity="0.9" />
        <path d="M-3.2 0 L3.2 -3.6 L1.2 0 L3.2 3.6 Z" fill="white" />
      </g>

      {/* city skyline (right side) */}
      <g fill="currentColor" opacity="0.16">
        <rect x="1180" y="380" width="70" height="280" />
        <rect x="1260" y="440" width="55" height="220" />
        <rect x="1325" y="320" width="80" height="340" />
        <rect x="1415" y="470" width="60" height="190" />
        <rect x="1485" y="400" width="65" height="260" />
      </g>
      <g stroke="currentColor" strokeWidth="1" opacity="0.25">
        <line x1="1360" y1="320" x2="1360" y2="240" />
        <circle cx="1360" cy="232" r="6" fill="currentColor" opacity="0.5" stroke="none" />
      </g>
    </svg>
  );
}

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#f7fbfa] pt-18 pb-16 dark:bg-[#061512] sm:pt-20 sm:pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[length:90px_90px]" />
        <div className="absolute -top-48 left-1/2 h-[620px] w-[920px] -translate-x-1/2 rounded-full bg-emerald-200/45 blur-[110px] dark:bg-emerald-500/10" />
        <div className="absolute -right-32 top-44 h-80 w-80 rounded-full bg-sky-100/70 blur-[100px] dark:bg-sky-400/10" />
        <HeroIllustration />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl text-center"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm dark:border-emerald-300/20 dark:bg-white/5 dark:shadow-none">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">
              AI-powered civic action
            </span>
          </div>

          <h1 className="text-5xl font-black leading-[0.9] tracking-[-0.07em] text-slate-950 dark:text-white sm:text-7xl lg:text-[5.4rem]">
            Every voice deserves
            <br />
            <span className="block bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 bg-clip-text text-transparent">
              Visible Action.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
            In your words. We direct, flag, and track your concerns to resolution.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/auth?mode=signup")}
              className="group relative inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-7 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 sm:w-auto"
            >
              <span className="relative">
                <Send className="h-4 w-4" />
                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  1
                </span>
              </span>
              File a complaint
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/75 px-7 py-4 text-base font-bold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:shadow-none dark:hover:bg-white/10 sm:w-auto"
            >
              <Eye className="h-4 w-4 text-emerald-600" />
              See how it works
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
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

          <div className="mt-5 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur-sm dark:border-emerald-300/20 dark:bg-white/5 dark:text-emerald-300">
              <BadgeCheck className="h-4 w-4 text-emerald-600" /> Verified Civic Partner
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
