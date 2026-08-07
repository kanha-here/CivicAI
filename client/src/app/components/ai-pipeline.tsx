import { motion } from "motion/react";
import { useState, useEffect } from "react";
import {
  FileText,
  Brain,
  Target,
  Zap,
  Navigation,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { dashboardService } from "../../services/dashboard.service";

const pipelineSteps = [
  {
    icon: FileText,
    title: "Input",
    description: "Multi-channel intake",
    detail: "Voice, Text, WhatsApp, Email",
    color: "from-blue-400 to-cyan-500",
  },
  {
    icon: Brain,
    title: "NLP",
    description: "Language processing",
    detail: "15+ languages supported",
    color: "from-cyan-400 to-teal-500",
  },
  {
    icon: Target,
    title: "Classification",
    description: "Smart categorization",
    detail: "Live model confidence",
    color: "from-teal-400 to-green-500",
  },
  {
    icon: Zap,
    title: "Decision",
    description: "Priority scoring",
    detail: "Real-time analysis",
    color: "from-green-400 to-emerald-500",
  },
  {
    icon: Navigation,
    title: "Routing",
    description: "Intelligent dispatch",
    detail: "Auto-assignment",
    color: "from-emerald-400 to-cyan-500",
  },
  {
    icon: BarChart3,
    title: "Dashboard",
    description: "Live monitoring",
    detail: "Real-time insights",
    color: "from-purple-400 to-pink-500",
  },
];

export function AIPipeline() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    dashboardService.landing().then(setData).catch(console.error);
  }, []);

  const pipeline = data?.pipeline ?? {};
  const steps = pipelineSteps.map((step) => {
    if (step.title === "Classification") return { ...step, detail: `${pipeline.accuracy ?? 0}% model confidence` };
    if (step.title === "Decision") return { ...step, detail: `${pipeline.highPriority ?? 0} high-priority cases` };
    if (step.title === "Routing") return { ...step, detail: `${pipeline.departments?.length ?? 0} departments active` };
    if (step.title === "Dashboard") return { ...step, detail: `${pipeline.processed ?? 0} records tracked` };
    return step;
  });

  return (
    <section className="py-24 px-6 relative bg-white dark:bg-[#0B1020]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 border-none">
            AI Workflow Pipeline
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Intelligent Processing Pipeline
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From submission to resolution — fully automated, AI-driven governance
          </p>
        </motion.div>

        {/* Desktop Pipeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 opacity-30 transform -translate-y-1/2"></div>

            <div className="grid grid-cols-6 gap-4 relative">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="relative"
                >
                  {/* Connector Arrow */}
                  {index < pipelineSteps.length - 1 && (
                    <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                    </div>
                  )}

                  {/* Card */}
                  <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-full relative overflow-hidden group">
                    {/* Gradient overlay on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                    ></div>

                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 relative`}
                    >
                      <step.icon className="w-6 h-6 text-white" />
                      
                      {/* Pulse effect */}
                      <motion.div
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.3,
                        }}
                        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${step.color}`}
                      ></motion.div>
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold dark:text-white text-gray-900 mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm dark:text-gray-400 text-gray-600 mb-2">
                      {step.description}
                    </p>
                    <p className="text-xs dark:text-gray-500 text-gray-500">
                      {step.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Pipeline */}
        <div className="lg:hidden space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}
                >
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold dark:text-white text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm dark:text-gray-400 text-gray-600">
                    {step.description} • {step.detail}
                  </p>
                </div>
                {index < pipelineSteps.length - 1 && (
                  <ArrowRight className="w-5 h-5 dark:text-purple-400 text-purple-600 transform rotate-90" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Activity Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <motion.div
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.8, 0, 0.8],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-green-400"
                ></motion.div>
              </div>
              <div>
                <p className="font-semibold dark:text-white text-gray-900">
                  Pipeline Status: Active
                </p>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Processing {pipeline.active ?? 0} active complaints in real-time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold dark:text-cyan-400 text-cyan-600">
                  {pipeline.processed ?? 0}
                </p>
                <p className="text-xs dark:text-gray-400 text-gray-600">
                  Processed
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold dark:text-green-400 text-green-600">
                  {pipeline.accuracy ?? 0}%
                </p>
                <p className="text-xs dark:text-gray-400 text-gray-600">
                  Model Confidence
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold dark:text-purple-400 text-purple-600">
                  {pipeline.departments?.length ?? 0}
                </p>
                <p className="text-xs dark:text-gray-400 text-gray-600">
                  Departments
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
