import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  UserCircle,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Lightbulb,
} from "lucide-react";
import { dashboardService } from "../../services/dashboard.service";

export function OfficerWorkflow() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    dashboardService.landing().then(setData).catch(console.error);
  }, []);

  const workflow = data?.officerWorkflow ?? {};
  const taskQueue = workflow.taskQueue ?? [];
  const escalationAlerts = workflow.alerts ?? [];
  const overview = workflow.overview ?? {};

  return (
    <section
      id="workflow"
      className="py-24 px-6 relative bg-white dark:bg-[#0B1020]"
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
            Officer Interface
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Smart Officer Workflow
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            AI-assisted task management with intelligent routing and real-time updates
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Task Queue */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Task Queue
              </h3>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {taskQueue.length} Active
              </Badge>
            </div>

            {taskQueue.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                        {task.id}
                      </span>
                      <Badge
                        variant="secondary"
                        className={
                          task.priority === "High"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : task.priority === "Medium"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }
                      >
                        {task.priority}
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {task.department}
                      </Badge>
                    </div>
                    <h4 className="font-semibold dark:text-white text-gray-900 mb-2">
                      {task.title}
                    </h4>
                  </div>
                  {task.status === "urgent" && (
                    <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 dark:text-gray-400 text-gray-600" />
                    <span className="text-sm dark:text-gray-400 text-gray-600">
                      {task.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 dark:text-gray-400 text-gray-600" />
                    <span
                      className={`text-sm font-semibold ${
                        task.status === "urgent"
                          ? "text-red-400"
                          : "dark:text-gray-400 text-gray-600"
                      }`}
                    >
                      SLA: {task.sla}
                    </span>
                  </div>
                </div>

                {/* AI Suggestion */}
                <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 mb-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-1 uppercase tracking-wider">
                        AI Recommendation
                      </p>
                      <p className="text-sm text-indigo-900 dark:text-indigo-200">
                        {task.aiSuggestion}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accept Task
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Sidebar - Alerts & Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Officer Profile */}
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <UserCircle className="w-7 h-7 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Live Operations
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Prisma-backed workflow
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {overview.completed ?? 0}
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Completed
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {overview.inProgress ?? 0}
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    In Progress
                  </p>
                </div>
              </div>
            </div>

            {/* Escalation Alerts */}
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Escalation Alerts
                </h3>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              </div>

              <div className="space-y-3">
                {escalationAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                          {alert.message}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {new Date(alert.time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Tracking */}
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Today's Overview
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Assigned
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {overview.assigned ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Completed
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{overview.completed ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    In Progress
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{overview.inProgress ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Pending
                  </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{overview.pending ?? 0}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Avg. Resolution Time
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Live
                  </span>
                </div>
              </div>
            </div>

            {/* AI Assistant */}
            <div className="p-6 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  AI Assistant Active
                </p>
              </div>
              <p className="text-sm text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">
                Your AI assistant is monitoring tasks and will suggest optimal
                actions based on priority and resource availability.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
