import { Building2, Zap, Droplets, Trash2, Route, Landmark, Shield, ChevronRight, type LucideIcon } from "lucide-react";

const DEPARTMENTS: { name: string; icon: LucideIcon; color: string; description: string }[] = [
  { name: "Electricity", icon: Zap, color: "#f59e0b", description: "Power outages, billing, infrastructure" },
  { name: "Water Supply", icon: Droplets, color: "#0ea5e9", description: "Supply issues, quality, leakage" },
  { name: "Sanitation", icon: Trash2, color: "#10b981", description: "Waste collection, drainage, hygiene" },
  { name: "Roads & Transport", icon: Route, color: "#6366f1", description: "Potholes, signals, public transit" },
  { name: "Public Services", icon: Landmark, color: "#ec4899", description: "Civic amenities, certificates, records" },
  { name: "Law & Order", icon: Shield, color: "#ef4444", description: "Safety, policing, community disputes" },
];

export function Departments() {
  return (
    <section id="departments" className="py-24 bg-white dark:bg-[#020817] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-light dark:bg-grid opacity-40 dark:opacity-[0.04]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-white/5 border border-amber-100 dark:border-white/10 mb-4">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 dark:text-slate-200 uppercase tracking-wide">
              Departments
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Intelligent routing across
            <br />
            <span className="bg-gradient-to-r from-amber-600 to-indigo-600 bg-clip-text text-transparent">6 civic departments</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Our AI routes complaints to the correct department automatically — no human triage needed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEPARTMENTS.map((dept) => {
            const Icon = dept.icon;
            return (
              <div
                key={dept.name}
                className="group relative p-6 rounded-2xl border transition-all duration-400 overflow-hidden cursor-default bg-white dark:bg-white/5 border-slate-200/60 dark:border-white/10 hover:shadow-xl dark:hover:border-white/20"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to right, ${dept.color}, transparent)` }}
                />

                <div className="flex items-center gap-4 mb-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${dept.color}15` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: dept.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{dept.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{dept.description}</p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-1.5 text-xs font-semibold mt-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                  style={{ color: dept.color }}
                >
                  Auto-routed by AI <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
