import { GlassCard } from "../../components/shared/glass-card";

export function OfficerLeaderboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        Performance Leaderboard
      </h1>
      <GlassCard className="p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Officer performance metrics and SLA velocity rankings will be displayed here.
        </p>
      </GlassCard>
    </div>
  );
}
