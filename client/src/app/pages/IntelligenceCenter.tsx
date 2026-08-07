import { useState, useEffect } from "react";
import { 
  Brain, 
  Network, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb,
  Search,
  Eye
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { dashboardService } from "../../services/dashboard.service";

// A quick visual representation of a Neural Network or Node Graph
const NodeCluster = () => (
  <div className="relative h-[300px] w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
    <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
    {/* Central Node */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center z-10 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
      <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
    </div>
    
    {/* Connected Nodes */}
    <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-purple-500/20 rounded-full border border-purple-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
      <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
    </div>
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <line x1="50%" y1="50%" x2="33%" y2="25%" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="50%" y1="50%" x2="70%" y2="30%" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="50%" y1="50%" x2="65%" y2="75%" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="50%" y1="50%" x2="25%" y2="65%" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
    <div className="absolute top-[30%] left-[70%] w-10 h-10 bg-amber-500/20 rounded-full border border-amber-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.4)]">
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    </div>
    <div className="absolute top-[75%] left-[65%] w-12 h-12 bg-green-500/20 rounded-full border border-green-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.4)]">
      <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
    </div>
    <div className="absolute top-[65%] left-[25%] w-8 h-8 bg-pink-500/20 rounded-full border border-pink-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.4)]">
      <Search className="w-4 h-4 text-pink-600 dark:text-pink-400" />
    </div>
  </div>
);

export function IntelligenceCenter() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    dashboardService.intelligence().then(setData).catch(console.error);
  }, []);

  const modelStatus = data?.modelStatus ?? {};
  const confidence = modelStatus.confidence ?? {};
  const clusters = data?.clusters ?? [];
  const recentPredictions = data?.recentPredictions ?? [];
  const activity = data?.activity ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AI Intelligence Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time neural processing, predictive analytics, and explainable AI.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 border-none px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Models Online
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Network className="w-4 h-4 mr-2" />
            Retrain Models
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Model Status & Predictions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Explainability Panel */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Classification Confidence</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Infrastructure Detection</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{confidence.classification ?? 96.8}%</span>
                </div>
                <Progress value={confidence.classification ?? 96.8} className="h-2 bg-slate-100 dark:bg-slate-800" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Sentiment Analysis</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{confidence.validity ?? 92.4}%</span>
                </div>
                <Progress value={confidence.validity ?? 92.4} className="h-2 bg-slate-100 dark:bg-slate-800" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Urgency Classification</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{confidence.urgency ?? 94.1}%</span>
                </div>
                <Progress value={confidence.urgency ?? 94.1} className="h-2 bg-slate-100 dark:bg-slate-800" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Language Translation</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{confidence.trust ?? 98.5}%</span>
                </div>
                <Progress value={confidence.trust ?? 98.5} className="h-2 bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          </div>

          {/* Predictive Alerts */}
          <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Predictive Alerts</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/60 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200/50 dark:border-amber-800/30">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">High Priority Watch</p>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1">{modelStatus.criticalCount ?? 0} high-priority cases are currently influencing escalation analytics.</p>
              </div>
              <div className="bg-white/60 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200/50 dark:border-amber-800/30">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Prediction Volume</p>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1">{modelStatus.predictions ?? 0} prediction records have been saved from submitted complaints.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visualization & Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Neural Graph */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Duplicate Complaint Clustering (Live)</h3>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <Sparkles className="w-3 h-3 mr-1" />
                Auto-merging enabled
              </Badge>
            </div>
            
            <NodeCluster />

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Identified Clusters</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{clusters.length || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Duplicates Merged</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{modelStatus.predictions ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hours Saved</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{modelStatus.complaints ?? 0}</p>
              </div>
            </div>
          </div>

          {/* AI Activity Feed */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6">Live Processing Stream</h3>
            <div className="space-y-4">
              {(recentPredictions.length ? recentPredictions : activity).slice(0, 3).map((item: any, index: number) => (
              <div className="flex gap-4" key={item.id}>
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center flex-shrink-0">
                  {index === 1 ? <Network className="w-4 h-4 text-purple-600 dark:text-purple-400" /> : index === 2 ? <Lightbulb className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </div>
                <div className={`${index < 2 ? "pb-4 border-b border-slate-100 dark:border-slate-800" : ""} w-full`}>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title || item.action}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.category ? `${item.category} • ${item.priority || "Pending"} • ${item.department}` : `${item.entityType} by ${item.actor}`}</p>
                  <span className="text-xs text-slate-500 dark:text-slate-500 mt-2 block">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              View Complete Audit Log
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
