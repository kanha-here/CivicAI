import { motion } from "motion/react";
import { ArrowRight, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { dashboardService } from "../../services/dashboard.service";

export function HeroSection() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    dashboardService.landing().then(setData).catch(console.error);
  }, []);

  const metrics = data?.hero ?? {};

  return (
    <div id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-12">
      {/* Refined Enterprise Background */}
      <div className="absolute inset-0 dark:bg-[#0B1020] bg-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Subtle accent glow instead of flashy neon */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[600px] h-[600px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="text-center lg:w-7xl space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Government AI-Powered Civic Intelligence
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]"
          >
            Transforming Citizen
            <br />
            <span className="text-blue-600 dark:text-blue-500">
              Complaints into
            </span>
            <br />
            Intelligent Action
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium"
          >
            Multilingual AI-driven complaint analysis • Real-time routing • Automated governance workflows
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-base shadow-sm group rounded-lg"
            >
              <Link to="/citizen-dashboard/submit" className="flex items-center">
                Submit Complaint
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Link to="/admin-dashboard">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-base font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/50 rounded-lg shadow-sm"
              >
                Explore AI Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Live Metrics Ticker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-16"
          >
            <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm min-w-[200px]">
              <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {(metrics.resolved ?? 0).toLocaleString()}
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Resolved
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm min-w-[200px]">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {(metrics.accuracy ?? 0).toFixed(1)}%
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  AI Accuracy
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm min-w-[200px]">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {metrics.slaTime ? `${Number(metrics.slaTime).toFixed(1)}h` : metrics.active ?? 0}
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {metrics.slaTime ? "Avg SLA" : "Active Cases"}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating AI Cards */}
          <div className="absolute top-10 -left-10 hidden xl:block">
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-56 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Processing NLP
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {(metrics.active ?? 0).toLocaleString()} active complaints tracked
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Hindi → English</Badge>
                <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Auto-Tagged</Badge>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-10 -right-10 hidden xl:block">
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-56 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Smart Routing
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {(metrics.users ?? 0).toLocaleString()} registered platform users
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">High Priority</Badge>
                <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">PWD Dept.</Badge>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
