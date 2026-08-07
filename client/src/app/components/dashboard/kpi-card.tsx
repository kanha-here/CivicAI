import { motion } from "motion/react";
import type { KPIStat } from "../../types/operations";

function formatValue(value: number, unit?: string) {
  if (unit) {
    return `${value}${unit}`;
  }
  return value.toLocaleString();
}

function intentStyles(intent: KPIStat["intent"]) {
  switch (intent) {
    case "positive":
      return "text-emerald-500 bg-emerald-500/10";
    case "negative":
      return "text-rose-500 bg-rose-500/10";
    case "warning":
      return "text-amber-500 bg-amber-500/10";
    default:
      return "text-slate-400 bg-slate-400/10";
  }
}

interface KpiCardProps {
  stat: KPIStat;
  index: number;
}

export function KpiCard({ stat, index }: KpiCardProps) {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <div className="rounded-2xl border border-white/40 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm p-5 hover:shadow-[0_24px_60px_-30px_rgba(34,197,94,0.45)] transition-shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${intentStyles(stat.intent)}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <p className="text-3xl font-semibold text-slate-900 dark:text-white">
            {formatValue(stat.value, stat.unit)}
          </p>
          <div className="text-right">
            <p
              className={`text-sm font-semibold ${
                stat.trend >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {stat.trend >= 0 ? "+" : ""}{stat.trend}%
            </p>
            <p className="text-xs text-slate-400">{stat.trendLabel}</p>
          </div>
        </div>
        <div className="mt-4 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />
        </div>
      </div>
    </motion.div>
  );
}
