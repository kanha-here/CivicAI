import { Activity, AlertTriangle, Sparkles } from "lucide-react";

export function RightContextPanel() {
    return (
        <aside className="hidden xl:flex flex-col gap-4 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    AI Recommendations
                </h3>
                <div className="mt-3 space-y-3">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-600 dark:text-slate-300">
                        Merge 6 duplicate sanitation reports in Ward 12.
                        Escalate to rapid response.
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-600 dark:text-slate-300">
                        Suggested routing: Traffic control + electrical board
                        for signal outage.
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Live Alerts
                </h3>
                <div className="mt-3 space-y-3">
                    <div className="flex gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-600 dark:text-slate-300">
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                        SLA breach risk in Ward 5 (45 min).
                    </div>
                    <div className="flex gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-600 dark:text-slate-300">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        High-priority sanitation escalation pending approval.
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    Activity Summary
                </div>
                <div className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <p>32 cases triaged in the last hour.</p>
                    <p>Average SLA buffer: 2h 14m.</p>
                    <p>AI confidence average: 87%.</p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Smart Suggestions
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Prepare AI brief for Ward 3 water disruption with citizen
                    notifications.
                </p>
            </div>
        </aside>
    );
}
