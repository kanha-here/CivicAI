import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { dashboardService } from "../../../services/dashboard.service";

export function CitizenCommunity() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        dashboardService.community().then(setData).catch(console.error);
    }, []);

    const stats = data?.stats ?? {};
    const departments = data?.departments ?? [];

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Community Pulse
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">
                    Live civic activity from citizen reports and department response data.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <Users className="w-5 h-5 text-blue-500 mb-3" />
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalCitizens ?? 0}</div>
                    <div className="text-sm text-slate-500">Citizens</div>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <Building2 className="w-5 h-5 text-indigo-500 mb-3" />
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalReports ?? 0}</div>
                    <div className="text-sm text-slate-500">Total Reports</div>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mb-3" />
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.resolvedReports ?? 0}</div>
                    <div className="text-sm text-slate-500">Resolved</div>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-amber-500 mb-3" />
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeReports ?? 0}</div>
                    <div className="text-sm text-slate-500">Active</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                        Department Activity
                    </h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {departments.map((department: any, index: number) => (
                        <motion.div
                            key={department.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.06 }}
                            className="p-5 flex items-center justify-between"
                        >
                            <div>
                                <div className="font-semibold text-slate-900 dark:text-white">
                                    {department.name}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {department.description || "No description available"}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-slate-900 dark:text-white">
                                    {department.reports}
                                </div>
                                <div className="text-xs text-slate-500">reports</div>
                            </div>
                        </motion.div>
                    ))}
                    {!departments.length && (
                        <div className="p-6 text-sm text-slate-500">
                            Department activity will appear after reports are routed.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
