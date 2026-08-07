import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { dashboardService } from "../../services/dashboard.service";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function DashboardPreview() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    dashboardService.dashboard().then(setData).catch(console.error);
  }, []);

  const stats = data?.stats ?? {};
  const activityData = data?.activityData?.some((item: any) => item.complaints > 0)
    ? data.activityData
    : [
        { name: "Mon", complaints: 145 },
        { name: "Tue", complaints: 189 },
        { name: "Wed", complaints: 167 },
        { name: "Thu", complaints: 203 },
        { name: "Fri", complaints: 178 },
        { name: "Sat", complaints: 134 },
        { name: "Sun", complaints: 98 },
      ];
  const categoryData = data?.categoryData?.length
    ? data.categoryData
    : [
        { name: "Infrastructure", value: 35, color: "#06b6d4" },
        { name: "Water Supply", value: 25, color: "#8b5cf6" },
        { name: "Sanitation", value: 20, color: "#10b981" },
        { name: "Electricity", value: 15, color: "#f59e0b" },
        { name: "Others", value: 5, color: "#ec4899" },
      ];
  const departmentData = data?.departmentData?.length
    ? data.departmentData
    : [
        { dept: "PWD", pending: 23, resolved: 67 },
        { dept: "Water", pending: 15, resolved: 45 },
        { dept: "Electric", pending: 12, resolved: 38 },
        { dept: "Health", pending: 8, resolved: 29 },
      ];
  const recentActivity = data?.recentActivity?.length
    ? data.recentActivity
    : [
        { id: "proto-1", title: "Road repair workflow", status: "In Progress", time: new Date(), priority: "High" },
        { id: "proto-2", title: "Water leakage routing", status: "Assigned", time: new Date(), priority: "Medium" },
        { id: "proto-3", title: "Street light repair", status: "Resolved", time: new Date(), priority: "Low" },
      ];

  return (
    <section
      id="dashboard"
      className="py-24 px-6 relative bg-slate-50/50 dark:bg-[#0B1020]"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 border-none">
            Government Intelligence Dashboard
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Centralized Command Interface
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Monitor, analyze, and intelligently assign incoming grievances in real time.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                +12%
              </Badge>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.totalActive || 1247}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Active Complaints
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                +8%
              </Badge>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.resolvedWeek || 983}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Resolved This Week
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Live
              </Badge>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.processing || 156}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Currently Processing
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                SLA Breach Risk
              </Badge>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.highPriority || 42}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              High Priority Alerts
            </p>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Activity Trend */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Weekly Activity Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityData}>
                <CartesianGrid key="grid-line" strokeDasharray="3 3" stroke="#333" />
                <XAxis key="xaxis-line" dataKey="name" stroke="#888" />
                <YAxis key="yaxis-line" stroke="#888" />
                <Tooltip
                  key="tooltip-line"
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  key="line-complaints"
                  type="monotone"
                  dataKey="complaints"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: "#06b6d4", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Category Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  key="pie-category"
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  key="tooltip-pie"
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Department Performance & Live Feed */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Department Performance */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Department Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid key="grid-bar" strokeDasharray="3 3" stroke="#333" />
                <XAxis key="xaxis-bar" dataKey="dept" stroke="#888" />
                <YAxis key="yaxis-bar" stroke="#888" />
                <Tooltip
                  key="tooltip-bar"
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Legend key="legend-bar" />
                <Bar key="bar-pending" dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                <Bar key="bar-resolved" dataKey="resolved" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Live Activity
              </h3>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                      {activity.title}
                    </p>
                    <Badge
                      variant="secondary"
                      className={
                        activity.priority === "High"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px]"
                          : activity.priority === "Medium"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px]"
                      }
                    >
                      {activity.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {activity.status}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(activity.time).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
