import type { KPIStat } from "../../types/operations";
import { KpiCard } from "./kpi-card";

interface KpiGridProps {
  stats: KPIStat[];
}

export function KpiGrid({ stats }: KpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat, index) => (
        <KpiCard key={stat.id} stat={stat} index={index} />
      ))}
    </div>
  );
}
