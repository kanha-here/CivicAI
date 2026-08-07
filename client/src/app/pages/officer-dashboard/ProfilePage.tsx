import {
  Activity,
  BadgeCheck,
  Bell,
  ClipboardList,
  Lock,
  MapPin,
  Shield,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { GlassCard } from "../../components/shared/glass-card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

const assignedWards = [
  { id: "ward-12", name: "Ward 12", zone: "North District", priority: "High" },
  { id: "ward-5", name: "Ward 5", zone: "CBD", priority: "Critical" },
  { id: "ward-3", name: "Ward 3", zone: "West Zone", priority: "Medium" },
];

const activityHistory = [
  {
    id: "act-1",
    title: "Resolved sanitation escalation",
    timestamp: "15 mins ago",
    detail: "Ward 12 cleanup dispatched and completed.",
  },
  {
    id: "act-2",
    title: "AI briefing generated",
    timestamp: "1 hour ago",
    detail: "Drafted response for traffic signal outage.",
  },
  {
    id: "act-3",
    title: "Assigned emergency incident",
    timestamp: "Today, 09:40 AM",
    detail: "Water supply disruption triage in Ward 3.",
  },
];

export function OfficerProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserCircle2 className="h-7 w-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Officer Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Operational identity, performance metrics, and AI productivity controls.
          </p>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Shield className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Officer Aditi Sharma
                </h2>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Verified
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Field Operations Lead · GovOps North Command
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  North District
                </span>
                <span className="flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  SLA Compliance: 94%
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Resolved</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">128</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Open Cases</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">14</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <ClipboardList className="h-4 w-4 text-blue-600" />
              Assigned Wards
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {assignedWards.map((ward) => (
                <div
                  key={ward.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {ward.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {ward.zone}
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-3 bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {ward.priority} priority
                  </Badge>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-purple-500" />
              AI Productivity Score
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">AI Efficiency</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">88%</p>
                <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-2 w-[88%] rounded-full bg-blue-600"></div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">AI Adoption</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">76%</p>
                <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-2 w-[76%] rounded-full bg-emerald-500"></div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Activity className="h-4 w-4 text-emerald-500" />
              Activity History
            </div>
            <div className="mt-4 space-y-3">
              {activityHistory.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    <span className="text-xs text-slate-400">{item.timestamp}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Bell className="h-4 w-4 text-blue-600" />
              Notification Preferences
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {[
                "SLA breach alerts",
                "Escalation approvals",
                "AI recommendation updates",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3"
                >
                  <span>{item}</span>
                  <Button size="sm" variant="outline">
                    Enabled
                  </Button>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Theme Preferences
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-sm text-slate-600 dark:text-slate-300">
                Current theme: System sync
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline">Light Mode</Button>
                <Button variant="outline">Dark Mode</Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Lock className="h-4 w-4 text-amber-500" />
              Security Settings
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3">
                Multi-factor authentication: Enabled
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3">
                Last security review: 5 days ago
              </div>
              <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                Review Security Settings
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
