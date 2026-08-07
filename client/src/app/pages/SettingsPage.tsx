import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Database, Shield, Server, Bell, Activity } from "lucide-react";
import { dashboardService } from "../../services/dashboard.service";

export function SettingsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    dashboardService.settings().then(setData).catch(console.error);
  }, []);

  const metrics = data?.metrics ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live system configuration and platform health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Database className="w-5 h-5 text-green-500 mb-3" />
          <div className="font-semibold text-slate-900 dark:text-white">{data?.database || "PostgreSQL / NeonDB"}</div>
          <div className="text-sm text-slate-500">Database Layer</div>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Shield className="w-5 h-5 text-blue-500 mb-3" />
          <div className="font-semibold text-slate-900 dark:text-white">{data?.auth || "JWT"}</div>
          <div className="text-sm text-slate-500">Auth Strategy</div>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Server className="w-5 h-5 text-indigo-500 mb-3" />
          <div className="font-semibold text-slate-900 dark:text-white">{data?.environment || "development"}</div>
          <div className="text-sm text-slate-500">Environment</div>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Bell className="w-5 h-5 text-amber-500 mb-3" />
          <div className="font-semibold text-slate-900 dark:text-white">{metrics.unreadNotifications ?? 0}</div>
          <div className="text-sm text-slate-500">Unread Notifications</div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-500" />
          Runtime Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-slate-500">Users</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.users ?? 0}</div>
          </div>
          <div>
            <div className="text-slate-500">Complaints</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.complaints ?? 0}</div>
          </div>
          <div>
            <div className="text-slate-500">Departments</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.departments ?? 0}</div>
          </div>
          <div>
            <div className="text-slate-500">Last Activity</div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {metrics.lastActivityAt ? new Date(metrics.lastActivityAt).toLocaleString() : "No activity yet"}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
