import { AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";
import { AICopilotPanel } from "../../components/ai/ai-copilot-panel";
import { OperationsAnalytics } from "../../components/analytics/operations-analytics";
import { KpiGrid } from "../../components/dashboard/kpi-grid";
import { OperationsCommandBar } from "../../components/dashboard/operations-command-bar";
import { ComplaintQueue } from "../../components/complaints/complaint-queue";
import { ActivityTimeline } from "../../components/timeline/activity-timeline";
import { GlassCard } from "../../components/shared/glass-card";
import { useRealtimeComplaints } from "../../hooks/useRealtimeComplaints";

export function OfficerOperations() {
  const {
    complaints,
    kpis,
    activity,
    aiSuggestions,
    lastUpdated,
    assignComplaint,
    startComplaint,
    resolveComplaint,
    shareProgress,
    downloadReport,
    activeComplaintId,
    isUpdating,
    isOfficerReady,
  } =
    useRealtimeComplaints();

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/50 dark:border-slate-700/60 bg-gradient-to-br from-white/80 via-cyan-50/40 to-indigo-50/50 dark:from-[#0B1020] dark:via-slate-900/70 dark:to-slate-950/80 p-6 shadow-[0_40px_80px_-50px_rgba(14,116,144,0.6)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="relative space-y-6">
          <OperationsCommandBar lastUpdated={lastUpdated} />

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <KpiGrid stats={kpis} />
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Active Alerts
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300">
                  Critical sanitation incident in Ward 12 requires immediate dispatch.
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-300">
                  SLA risk: traffic signal outage nearing breach in Ward 5.
                </div>
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-600 dark:text-cyan-300">
                  AI recommends cluster merge for 7 similar sanitation reports.
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-950/50 p-3 text-xs text-slate-400">
                  <span>Governance Trust Index</span>
                  <span className="flex items-center gap-1 text-emerald-500">
                    <ShieldCheck className="h-3 w-3" />
                    94.3%
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <ComplaintQueue
          complaints={complaints}
          onAssign={assignComplaint}
          onStart={startComplaint}
          onResolve={resolveComplaint}
          onShareProgress={shareProgress}
          onDownloadReport={downloadReport}
          activeComplaintId={activeComplaintId}
          isUpdating={isUpdating}
          isOfficerReady={isOfficerReady}
        />
        <div className="space-y-6">
          <AICopilotPanel suggestions={aiSuggestions} />
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-purple-400" />
              AI Workspace Readiness
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Components are prepared for the upcoming AI Workspace experience with
              modular chat, recommendation panels, and intelligence summaries.
            </p>
            <div className="mt-4 grid gap-2">
              <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-950/50 p-3 text-xs text-slate-400">
                Ready modules: Chat Composer, Insight Cards, Auto Briefings.
              </div>
              <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-950/50 p-3 text-xs text-slate-400">
                Live stream hooks: useEventStream(), useRealtimeComplaints().
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <OperationsAnalytics />

      <ActivityTimeline events={activity} />
    </div>
  );
}
