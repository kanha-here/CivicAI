import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Lightbulb, 
  CheckCircle2, 
  FileText, 
  ArrowUpRight,
  Filter,
  MoreVertical,
  Activity,
  Layers
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { dashboardService } from "../../services/dashboard.service";
import { complaintService } from "../../services/complaint.service";

export function AdminOperations() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    dashboardService.incidents().then(setData).catch(console.error);
  }, []);

  const activeIncidents = data?.items ?? [];
  const stats = data?.stats ?? {};
  const downloadWorkReport = async (complaintId?: string | null) => {
    if (!complaintId) return;
    const blob = await complaintService.downloadWorkReport(complaintId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `work-report-${complaintId}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Operations Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time incident management and AI-assisted routing.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            disabled={!activeIncidents[0]?.complaintId}
            onClick={() => downloadWorkReport(activeIncidents[0]?.complaintId)}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Incidents</h3>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeIncidents ?? 0}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              12%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">vs last shift</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Critical Priority</h3>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.criticalPriority ?? 0}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center text-xs font-medium text-red-600 dark:text-red-400">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              2 new
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">in last hour</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">SLA Breaches</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.slaBreaches ?? 0}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
              <ArrowUpRight className="w-3 h-3 mr-0.5 rotate-180" />
              -2
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">vs yesterday</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">AI Auto-Resolved</h3>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.autoResolvedRate ?? 0}%</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              +5%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">efficiency gain</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Incident Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Priority Queue</h2>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">All</Badge>
              <Badge variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 cursor-pointer">Critical</Badge>
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 cursor-pointer">SLA Risk</Badge>
            </div>
          </div>

          <div className="space-y-4">
            {activeIncidents.map((incident) => (
              <div key={incident.id} className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                {incident.priority === "Critical" && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                )}
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">{incident.id}</span>
                    <Badge variant="secondary" className={
                      incident.priority === "Critical" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50" : 
                      incident.priority === "High" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/50" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50"
                    }>
                      {incident.priority}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                      {incident.type}
                    </Badge>
                    {incident.reportsCount > 1 && (
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {incident.reportsCount} Clustered
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{incident.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {incident.location}
                  </span>
                  <span className={`flex items-center gap-1.5 font-medium ${incident.priority === 'Critical' ? 'text-red-600 dark:text-red-400' : ''}`}>
                    <Clock className="w-4 h-4" />
                    SLA: {incident.sla ?? "Live"}
                  </span>
                </div>

                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/30 rounded-lg p-3 mb-4">
                  <div className="flex gap-2">
                    <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">AI Intelligence Summary</p>
                      <p className="text-sm text-indigo-800/80 dark:text-indigo-200/80">{incident.aiSummary}</p>
                      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mt-2">Suggested Action: {incident.action}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-9">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accept & Dispatch
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 h-9 hover:bg-slate-50 dark:hover:bg-slate-800"
                    disabled={!incident.complaintId}
                    onClick={() => downloadWorkReport(incident.complaintId)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          {/* Heatmap Preview */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Incident Heatmap</h3>
            <div className="aspect-[4/3] rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-74.006,40.7128,12/600x400?access_token=pk.ey')] bg-cover bg-center opacity-50 dark:opacity-40 grayscale"></div>
              {/* Fake heatmap clusters */}
              <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-red-500/40 rounded-full blur-xl"></div>
              <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-red-500/50 rounded-full blur-xl"></div>
              <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-amber-500/40 rounded-full blur-xl"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <MapPin className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2 opacity-50" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded backdrop-blur-sm">Live Map View</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              Open Full Map
            </Button>
          </div>

          {/* Department Workload */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Department Workload</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">PWD (Infrastructure)</span>
                  <span className="font-medium text-slate-900 dark:text-white">85%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Water Supply</span>
                  <span className="font-medium text-slate-900 dark:text-white">62%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Electrical Board</span>
                  <span className="font-medium text-slate-900 dark:text-white">40%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Sanitation</span>
                  <span className="font-medium text-slate-900 dark:text-white">28%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
