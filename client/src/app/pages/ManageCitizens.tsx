import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Search, Users, FileText, MessageSquare, Calendar } from "lucide-react";
import { dashboardService } from "../../services/dashboard.service";
import { Badge } from "../components/ui/badge";

export function ManageCitizens() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any>(null);

  const fetchCitizens = useCallback(async () => {
    try {
      const result = await dashboardService.citizens({ search, page: 1, limit: 20 });
      setData(result);
    } catch (error) {
      console.error("Failed to fetch citizens:", error);
    }
  }, [search]);

  useEffect(() => {
    fetchCitizens();
  }, [fetchCitizens]);

  const citizens = data?.citizens ?? [];
  const stats = data?.stats ?? {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Citizen Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live citizen records from the Prisma user registry.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search citizens..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Users className="w-5 h-5 text-blue-500 mb-3" />
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total ?? 0}</div>
          <div className="text-sm text-slate-500">Total Citizens</div>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <FileText className="w-5 h-5 text-green-500 mb-3" />
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeReporters ?? 0}</div>
          <div className="text-sm text-slate-500">Active Reporters</div>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <MessageSquare className="w-5 h-5 text-indigo-500 mb-3" />
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.feedbackCount ?? 0}</div>
          <div className="text-sm text-slate-500">Feedback Entries</div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Citizen</th>
                <th className="px-6 py-4 font-medium">Reports</th>
                <th className="px-6 py-4 font-medium">Latest Routing</th>
                <th className="px-6 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {citizens.map((citizen: any) => (
                <tr key={citizen.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{citizen.name}</div>
                    <div className="text-xs text-slate-500">{citizen.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {citizen.reports} reports
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {citizen.latestDepartment || "No reports yet"}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(citizen.joinedAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
              {!citizens.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No citizens found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
