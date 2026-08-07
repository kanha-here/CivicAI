import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { dashboardService } from "../../services/dashboard.service";
import {
  Shield,
  CheckCircle,
  Eye,
  TrendingUp,
  Users,
  Award,
  Lock,
  Globe,
} from "lucide-react";

export function TrustTransparency() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    dashboardService.trust().then(setData).catch(console.error);
  }, []);

  const timelineSteps = data?.timelineSteps?.length
    ? data.timelineSteps
    : [
        {
          status: "Submitted",
          time: new Date(),
          description: "Complaint received by the dynamic workflow",
          completed: true,
        },
        {
          status: "AI Processed",
          time: new Date(),
          description: "Model-backed classification and priority scoring",
          completed: true,
        },
        {
          status: "Routed",
          time: new Date(),
          description: "Department routing shown from live system data when available",
          completed: true,
        },
      ];
  const metrics = data?.trustMetrics ?? {};
  const trustMetrics = [
    { icon: Eye, label: "Transparency Score", value: `${metrics.transparencyScore || 96}%`, color: "from-cyan-400 to-blue-500" },
    { icon: Users, label: "Citizen Satisfaction", value: `${metrics.citizenSatisfaction || 4.7}/5`, color: "from-green-400 to-emerald-500" },
    { icon: TrendingUp, label: "Resolution Rate", value: `${metrics.resolutionRate || 94}%`, color: "from-purple-400 to-pink-500" },
    { icon: Award, label: "SLA Compliance", value: `${metrics.slaCompliance || 92}%`, color: "from-yellow-400 to-orange-500" },
  ];
  const confidence = Number(data?.prediction?.confidenceScore || 94.5);

  return (
    <section className="py-24 px-6 relative bg-slate-50/50 dark:bg-[#0B1020]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 border-none">
            Trust & Transparency
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Built on Trust & Explainability
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Every decision is traceable, every action is accountable
          </p>
        </motion.div>

        {/* Trust Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {trustMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center"
            >
              <div
                className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center`}
              >
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold dark:text-white text-gray-900 mb-1">
                {metric.value}
              </p>
              <p className="text-sm dark:text-gray-400 text-gray-600">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Complaint Tracking Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <h3 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">
              Real-Time Complaint Tracking
            </h3>

            <div className="space-y-6">
              {timelineSteps.map((step: any, index: number) => (
                <div key={index} className="flex gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed
                          ? "bg-green-500"
                          : "dark:bg-gray-700 bg-gray-300"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <div className="w-3 h-3 rounded-full dark:bg-gray-500 bg-gray-400"></div>
                      )}
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-16 ${
                          step.completed
                            ? "bg-green-500"
                            : "dark:bg-gray-700 bg-gray-300"
                        }`}
                      ></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`font-semibold ${
                          step.completed
                            ? "dark:text-white text-gray-900"
                            : "dark:text-gray-400 text-gray-600"
                        }`}
                      >
                        {step.status}
                      </h4>
                      {!step.completed && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">
                      {new Date(step.time).toLocaleString()}
                    </p>
                    <p className="text-sm dark:text-gray-500 text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl dark:bg-cyan-500/10 bg-cyan-50 border dark:border-cyan-500/20 border-cyan-200">
              <p className="text-sm dark:text-cyan-300 text-cyan-700">
                <strong>Tracking ID:</strong> {data?.complaintId || "Prototype flow"}
              </p>
              <p className="text-xs dark:text-cyan-400 text-cyan-600 mt-1">
                Citizens can track their complaint status in real-time using this ID
              </p>
            </div>
          </motion.div>

          {/* AI Explainability & Security */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* AI Explainability */}
            <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold dark:text-white text-gray-900">
                  AI Explainability
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm dark:text-gray-400 text-gray-600">
                      Classification Confidence
                    </span>
                    <span className="text-sm font-semibold dark:text-white text-gray-900">
                      {confidence}%
                    </span>
                  </div>
                  <Progress value={confidence} className="h-2" />
                </div>

                <div className="p-4 rounded-xl dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-200">
                  <p className="text-sm dark:text-gray-300 text-gray-700 mb-2">
                    <strong>Decision Factors:</strong>
                  </p>
                  <ul className="space-y-2 text-sm dark:text-gray-400 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                      Keywords: "pothole", "road", "urgent"
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                      Location: High traffic zone
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      Historical data: Similar cases
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                      Sentiment analysis: High urgency
                    </li>
                  </ul>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-xl dark:bg-purple-500/10 bg-purple-50 border dark:border-purple-500/20 border-purple-200">
                  <Eye className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs dark:text-purple-200 text-purple-800">
                    Every AI decision includes detailed reasoning and can be audited by
                    administrators
                  </p>
                </div>
              </div>
            </div>

            {/* Security & Compliance */}
            <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold dark:text-white text-gray-900">
                  Security & Compliance
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl dark:bg-white/5 bg-gray-50 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold dark:text-white text-gray-900">
                    ISO 27001
                  </p>
                  <p className="text-xs dark:text-gray-400 text-gray-600">
                    Certified
                  </p>
                </div>
                <div className="p-4 rounded-xl dark:bg-white/5 bg-gray-50 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold dark:text-white text-gray-900">
                    GDPR
                  </p>
                  <p className="text-xs dark:text-gray-400 text-gray-600">
                    Compliant
                  </p>
                </div>
                <div className="p-4 rounded-xl dark:bg-white/5 bg-gray-50 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold dark:text-white text-gray-900">
                    SOC 2
                  </p>
                  <p className="text-xs dark:text-gray-400 text-gray-600">
                    Type II
                  </p>
                </div>
                <div className="p-4 rounded-xl dark:bg-white/5 bg-gray-50 text-center">
                  <Globe className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold dark:text-white text-gray-900">
                    WCAG 2.1
                  </p>
                  <p className="text-xs dark:text-gray-400 text-gray-600">
                    AA Level
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl dark:bg-green-500/10 bg-green-50 border dark:border-green-500/20 border-green-200">
                <p className="text-xs dark:text-green-200 text-green-800">
                  Your data is encrypted end-to-end and stored in compliance with
                  government data protection standards
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
