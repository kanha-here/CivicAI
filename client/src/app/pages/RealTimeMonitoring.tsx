import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Map, Activity, AlertTriangle, ShieldCheck, Users, Radio } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { dashboardService } from "../../services/dashboard.service";

export function RealTimeMonitoring() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    dashboardService.incidents().then(setData).catch(console.error);
  }, []);

  const activeIncidents = data?.items ?? [];
  const stats = data?.stats ?? {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Situational Awareness</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time geographical monitoring and dispatch command.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full border border-red-100 dark:border-red-900/30">
          <Radio className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider">Live Feed Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Map View (Placeholder for Mapbox/Leaflet) */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[500px] rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden relative flex items-center justify-center"
          >
            {/* Map Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            {/* Radar Sweep Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-blue-500/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-blue-500/30 rounded-full"></div>
            
            <div className="relative z-10 flex flex-col items-center text-slate-400 dark:text-slate-500">
              <Map className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium">Geospatial Map Module</p>
              <p className="text-xs">(Mapbox Integration Pending)</p>
            </div>

            {/* Simulated Live Pings */}
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-ping"></div>
            <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-ping" style={{ animationDelay: '1s' }}></div>
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Active Zones</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeZones ?? 0}</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Field Units</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.fieldUnits ?? 0}</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Avg Response</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">Live</div>
            </div>
          </div>
        </div>

        {/* Live Incident Stream */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Live Incident Stream</h2>
          </div>

          <div className="space-y-3">
            {activeIncidents.map((incident: any, idx: number) => (
              <motion.div 
                key={incident.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={`
                    ${incident.severity === 'Critical' ? 'border-red-500 text-red-500' : ''}
                    ${incident.severity === 'High' ? 'border-amber-500 text-amber-500' : ''}
                    ${incident.severity === 'Medium' ? 'border-blue-500 text-blue-500' : ''}
                    ${incident.severity === 'Low' ? 'border-slate-500 text-slate-500' : ''}
                  `}>
                    {incident.severity}
                  </Badge>
                  <span className="text-xs text-slate-500">{incident.id}</span>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-white text-sm mb-1">{incident.type} Event</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{incident.location}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-300">{incident.status}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">View on Map</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
