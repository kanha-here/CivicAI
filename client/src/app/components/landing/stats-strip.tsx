import { Clock, CheckCircle2, TrendingDown, Languages } from "lucide-react";

const STATS = [
  { label: "Avg. Response Time", value: "-68%", icon: Clock },
  { label: "Classification Accuracy", value: "94.2%", icon: CheckCircle2 },
  { label: "Manual Effort Reduced", value: "-82%", icon: TrendingDown },
  { label: "Languages Supported", value: "12+", icon: Languages },
];

export function StatsStrip() {
  return (
    <section id="stats" className="py-12 border-y border-slate-100 dark:border-white/5 bg-white dark:bg-[#020817]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <Icon className="w-5 h-5 mx-auto mb-2 text-indigo-500 dark:text-indigo-400" />
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-0.5">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
