import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, Medal, Star, ArrowUpRight } from "lucide-react";
import { dashboardService } from "../../../services/dashboard.service";

export function CitizenLeaderboard() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        dashboardService.leaderboard().then(setData).catch(console.error);
    }, []);

    const leaders = data?.leaders ?? [];
    const me = data?.me ?? {};

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Civic Champions
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Earn points by submitting verified reports and helping keep
                    our community safe. Top contributors unlock special
                    municipal badges.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                    <div className="text-sm font-medium text-slate-500 mb-1">
                        Your Rank
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {me.rank ? `#${me.rank}` : "Pending"}
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                    <div className="text-sm font-medium text-slate-500 mb-1">
                        Total Points
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {me.points ?? 0}
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                    <div className="text-sm font-medium text-slate-500 mb-1">
                        Next Badge In
                    </div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                        {Math.max(0, 1000 - (me.points ?? 0))} <Star className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                        Top Contributors This Month
                    </h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {leaders.map((leader, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={leader.rank}
                            className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                        leader.rank === 1
                                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                                            : leader.rank === 2
                                                ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                                : leader.rank === 3
                                                ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                                                : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                                    }`}
                                >
                                    #{leader.rank}
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        {leader.name}
                                        {leader.rank <= 3 && (
                                            <Medal
                                                className={`w-4 h-4 ${
                                                    leader.rank === 1
                                                        ? "text-amber-500"
                                                        : leader.rank === 2
                                                            ? "text-slate-400"
                                                            : "text-orange-500"
                                                }`}
                                            />
                                        )}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        {leader.reports} verified reports
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-slate-900 dark:text-white">
                                    {leader.points} pts
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 justify-end mt-0.5">
                                    Top{" "}
                                    {((leader.rank / 1000) * 100).toFixed(1)}%{" "}
                                    <ArrowUpRight className="w-3 h-3" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
