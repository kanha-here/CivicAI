import { GlassCard } from "../../components/shared/glass-card";

export function OfficerIntelligence() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        Grievance Intelligence
      </h1>
      <GlassCard className="p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Intelligence briefings, hotspot analytics, and AI anomaly reports will
          surface here.
        </p>
      </GlassCard>
    </div>
  );
}
