import { useQuery } from "@/lib/simple-query";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Check,
  Clock,
  Award,
  Star,
  Target,
  Users,
  Calendar,
  Download,
  Filter,
  BarChart3,
  Zap,
  Shield,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { dashboardService } from "../../services/dashboard.service";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import { useState } from "react";

type Tab = "departments" | "performance" | "insights";

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<Tab>("departments");

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["analytics", "leaderboard", "enhanced"],
    queryFn: () => dashboardService.leaderboard(),
  });

  const { data: departmentData, isLoading: departmentLoading } = useQuery({
    queryKey: ["analytics", "leaderboard", "departments"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/leaderboard/departments");
      if (!response.ok) throw new Error("Failed to fetch department leaderboard");
      return response.json();
    },
  });

  const departments = departmentData?.data || [];
  const stats = leaderboardData?.stats || {};

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Gold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "Silver":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
      case "Bronze":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    }
  };

  const getTrendColor = (trend: string) => {
    return trend === "up"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  };

  const topDepartments = departments.slice(0, 5);
  const performanceChartData = departments.map((dept) => ({
    name: dept.name.substring(0, 10),
    compliance: dept.metrics.complianceScore,
    satisfaction: dept.metrics.satisfactionScore,
    efficiency: dept.metrics.efficiencyScore,
  }));

  const radarData = topDepartments.map((dept) => ({
    metric: dept.name.substring(0, 12),
    compliance: dept.metrics.complianceScore,
    satisfaction: dept.metrics.satisfactionScore,
    efficiency: dept.metrics.efficiencyScore,
    performance: Math.round((dept.metrics.complianceScore + dept.metrics.satisfactionScore + dept.metrics.efficiencyScore) / 3),
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">Leaderboard</h1>
            </div>
            <p className="text-base text-slate-600 dark:text-slate-300 font-medium">
              Real-time performance rankings based on government grievance data
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <Button 
              variant="outline" 
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Calendar className="w-4 h-4 mr-2" />
              This Month
            </Button>
            <Button 
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 dark:from-slate-100 dark:to-slate-200 dark:hover:from-white dark:hover:to-slate-100 dark:text-slate-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-max">
        {/* Total Complaints - Large Card */}
        <div className="lg:col-span-2 group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950 dark:via-blue-900/50 dark:to-blue-900/30 border border-blue-200/60 dark:border-blue-800/50 shadow-lg hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{animationDelay: '0ms'}}>
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-400/10 to-transparent transition-opacity duration-500" />
          <div className="relative z-10 flex items-start justify-between mb-6">
            <div className="flex-1">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase tracking-widest">Total Complaints</p>
              <p className="text-5xl font-black bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-100 dark:to-blue-300 bg-clip-text text-transparent mt-3">
                {stats.totalComplaints || 0}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/60 dark:to-blue-800/40 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
              <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-4 mt-6 pt-6 border-t border-blue-200/40 dark:border-blue-800/30">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 shadow-sm">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-bold text-green-700 dark:text-green-300">+12%</span>
            </div>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-300">vs last month</span>
          </div>
        </div>

        {/* Resolved This Week */}
        <div className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:via-green-900/50 dark:to-green-900/30 border border-green-200/60 dark:border-green-800/50 shadow-lg hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{animationDelay: '100ms'}}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-green-400/10 to-transparent transition-opacity duration-500" />
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-green-600 dark:text-green-300 uppercase tracking-widest">Resolved</p>
              <p className="text-4xl font-black text-green-900 dark:text-green-100 mt-2">
                {stats.resolvedThisWeek || 0}
              </p>
              <p className="text-xs font-medium text-green-700 dark:text-green-400 mt-1">This Week</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/60 dark:to-green-800/40 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <Zap className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="relative z-10 text-sm font-bold text-green-700 dark:text-green-300 mt-4">
            <span className="text-2xl">{stats.slaCompliance}%</span> SLA Compliance
          </p>
        </div>

        {/* Average Resolution */}
        <div className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:via-purple-900/50 dark:to-purple-900/30 border border-purple-200/60 dark:border-purple-800/50 shadow-lg hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{animationDelay: '200ms'}}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-purple-400/10 to-transparent transition-opacity duration-500" />
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-widest">Avg Resolution</p>
              <p className="text-4xl font-black text-purple-900 dark:text-purple-100 mt-2">
                {stats.averageResolutionHours || 0}h
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/60 dark:to-purple-800/40 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <Target className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="relative z-10 text-xs font-bold text-purple-700 dark:text-purple-400 mt-4 px-2 py-1 bg-purple-200/50 dark:bg-purple-900/40 rounded-lg w-fit">
            Target: 24h
          </p>
        </div>

        {/* SLA Compliance - Medium Card */}
        <div className="lg:col-span-2 group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 dark:from-orange-950 dark:via-orange-900/50 dark:to-orange-900/30 border border-orange-200/60 dark:border-orange-800/50 shadow-lg hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{animationDelay: '300ms'}}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-orange-400/10 to-transparent transition-opacity duration-500" />
          <div className="relative z-10 flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-orange-600 dark:text-orange-300 uppercase tracking-widest">SLA Compliance</p>
              <div className="flex items-end gap-3 mt-3">
                <p className="text-5xl font-black text-orange-900 dark:text-orange-100">
                  {stats.slaCompliance}%
                </p>
                <span className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-1">of 90%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/60 dark:to-orange-800/40 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
              <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="relative z-10 mt-6 space-y-2">
            <div className="w-full h-3 rounded-full bg-orange-200 dark:bg-orange-900/40 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-orange-500/50" 
                style={{ width: `${Math.min((stats.slaCompliance / 90) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-300">Progress</span>
              <span className="text-xs font-bold text-orange-700 dark:text-orange-300">{Math.round((stats.slaCompliance / 90) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Citizen Satisfaction */}
        <div className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:via-yellow-900/50 dark:to-yellow-900/30 border border-yellow-200/60 dark:border-yellow-800/50 shadow-lg hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
          style={{animationDelay: '400ms'}}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-yellow-400/10 to-transparent transition-opacity duration-500" />
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-yellow-600 dark:text-yellow-300 uppercase tracking-widest">Satisfaction</p>
              <p className="text-4xl font-black text-yellow-900 dark:text-yellow-100 mt-2">
                {stats.citizenSatisfaction}/5
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/60 dark:to-yellow-800/40 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
              <Star className="w-7 h-7 text-yellow-600 dark:text-yellow-400 fill-current" />
            </div>
          </div>
          <p className="relative z-10 text-xs font-bold text-yellow-700 dark:text-yellow-300 mt-4">
            From <span className="font-bold">citizen feedback</span> ratings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-slate-200 dark:border-slate-800">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("departments")}
            className={`relative py-4 px-1 font-semibold text-sm transition-all duration-300 group ${
              activeTab === "departments"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Top Departments
            {activeTab === "departments" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`relative py-4 px-1 font-semibold text-sm transition-all duration-300 group ${
              activeTab === "performance"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Performance Analytics
            {activeTab === "performance" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`relative py-4 px-1 font-semibold text-sm transition-all duration-300 group ${
              activeTab === "insights"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Insights
            {activeTab === "insights" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "departments" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Top Rankings */}
          <div className="p-7 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50 border border-slate-200 dark:border-slate-800/50 shadow-lg">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              Department Rankings
            </h3>
            <div className="space-y-3">
              {topDepartments.map((dept, index) => (
                <div
                  key={dept.id}
                  className="group relative overflow-hidden flex items-center gap-5 p-5 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-800 dark:hover:to-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-500/5 to-transparent transition-opacity duration-300" />
                  
                  {/* Rank Badge */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-white text-lg shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                        dept.badge === "Gold"
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/50"
                          : dept.badge === "Silver"
                          ? "bg-gradient-to-br from-gray-400 to-gray-600 shadow-gray-500/50"
                          : dept.badge === "Bronze"
                          ? "bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/50"
                          : "bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/50"
                      }`}
                    >
                      {dept.rank}
                    </div>
                  </div>

                  {/* Department Info */}
                  <div className="relative z-10 flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{dept.name}</h4>
                      <Badge className={`${getBadgeColor(dept.badge)} font-bold`}>{dept.badge}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Check className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <div>Resolved: <span className="font-bold text-slate-900 dark:text-white">{dept.metrics.resolved}</span></div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <div>Pending: <span className="font-bold text-slate-900 dark:text-white">{dept.metrics.pending}</span></div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <div>Rating: <span className="font-bold text-slate-900 dark:text-white">{dept.metrics.avgRating}/5</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="relative z-10 flex-shrink-0 flex items-center gap-6">
                    <div className="text-center px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/30">
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase">Compliance</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xl font-black text-blue-900 dark:text-blue-100">{dept.metrics.complianceScore}%</span>
                        {dept.changePercent > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 animate-pulse" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </div>
                    <div className="text-center px-4 py-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-300 dark:border-slate-600">
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Points</div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{dept.points}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Table */}
          <div className="p-7 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50 border border-slate-200 dark:border-slate-800/50 shadow-lg overflow-x-auto">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">All Departments</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                  <th className="text-left py-4 px-5 font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Rank</th>
                  <th className="text-left py-4 px-5 font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Department</th>
                  <th className="text-center py-4 px-5 font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Resolved</th>
                  <th className="text-center py-4 px-5 font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Pending</th>
                  <th className="text-center py-4 px-5 font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Compliance</th>
                  <th className="text-center py-4 px-5 font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Rating</th>
                  <th className="text-right py-4 px-5 font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {departments.map((dept, idx) => (
                  <tr
                    key={dept.id}
                    className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent dark:hover:from-blue-900/20 dark:hover:to-transparent transition-all duration-300 relative"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-105 ${
                            dept.badge === "Gold"
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                              : dept.badge === "Silver"
                              ? "bg-gradient-to-br from-gray-400 to-gray-600"
                              : dept.badge === "Bronze"
                              ? "bg-gradient-to-br from-orange-400 to-orange-600"
                              : "bg-gradient-to-br from-blue-400 to-blue-600"
                          }`}
                        >
                          {dept.rank}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 dark:text-white">{dept.name}</div>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-green-50 dark:bg-green-900/30 font-semibold text-green-700 dark:text-green-300">
                        {dept.metrics.resolved}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/30 font-semibold text-orange-700 dark:text-orange-300">
                        {dept.metrics.pending}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                        <span className="font-bold text-blue-700 dark:text-blue-300">{dept.metrics.complianceScore}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="inline-flex items-center justify-center gap-2">
                        <span className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.round(dept.metrics.avgRating)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{dept.metrics.avgRating.toFixed(1)}</span>
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 font-black text-slate-900 dark:text-white">
                        {dept.points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "performance" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Performance Chart */}
          <div className="p-7 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50 border border-slate-200 dark:border-slate-800/50 shadow-lg">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              Performance Metrics Comparison
            </h3>
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={performanceChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "2px solid #3b82f6",
                      borderRadius: "12px",
                      boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)"
                    }}
                    labelStyle={{ color: "#f1f5f9", fontWeight: 600 }}
                    cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar dataKey="compliance" fill="#3b82f6" radius={[12, 12, 0, 0]} />
                  <Bar dataKey="satisfaction" fill="#10b981" radius={[12, 12, 0, 0]} />
                  <Bar dataKey="efficiency" fill="#f59e0b" radius={[12, 12, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="p-7 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50 border border-slate-200 dark:border-slate-800/50 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Top 5 Departments - Multi-dimensional Performance</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#475569" opacity={0.2} />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Radar name="Compliance" dataKey="compliance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                  <Radar name="Satisfaction" dataKey="satisfaction" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                  <Radar name="Efficiency" dataKey="efficiency" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                  <Legend />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        <div className="space-y-6">
          {/* Key Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">🎯 Performance Insights</h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>• Average compliance rate: <strong>{Math.round(departments.reduce((sum, d) => sum + d.metrics.complianceScore, 0) / departments.length)}%</strong></li>
                <li>• Best performing: <strong>{topDepartments[0]?.name}</strong></li>
                <li>• Needs improvement: <strong>{departments[departments.length - 1]?.name}</strong></li>
                <li>• Overall satisfaction: <strong>{stats.citizenSatisfaction}/5 stars</strong></li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">📊 Government Data</h4>
              <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                <li>• Total complaints tracked: <strong>{stats.totalComplaints || 0}</strong></li>
                <li>• This week resolved: <strong>{stats.resolvedThisWeek || 0}</strong></li>
                <li>• SLA Compliance: <strong>{stats.slaCompliance}%</strong></li>
                <li>• Avg resolution time: <strong>{stats.averageResolutionHours}h</strong></li>
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recommendations</h3>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-600 dark:bg-yellow-400 mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Focus on resolution time optimization
                  </p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-0.5">
                    Current average ({stats.averageResolutionHours}h) is above target (24h). Implement faster tracking and department coordination.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Benchmark low-performing departments
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200 mt-0.5">
                    Share best practices from {topDepartments[0]?.name} with other departments to improve compliance rates.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Recognize and reward top performers
                  </p>
                  <p className="text-xs text-green-800 dark:text-green-200 mt-0.5">
                    Gold and Silver badge departments are consistently exceeding targets. Implement incentive programs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
