import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  categoryDistribution,
  escalationAnalytics,
  priorityDistribution,
  resolutionTrend,
  slaCompliance,
  wardTrendData,
} from "../../services/operations-data";
import { GlassCard } from "../shared/glass-card";

const tooltipStyle = {
  backgroundColor: "#0f172a",
  borderRadius: "10px",
  border: "none",
  color: "#f8fafc",
};

export function OperationsAnalytics() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <GlassCard className="p-5 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Ward Trend Heatmap
            </h3>
            <p className="text-xs text-slate-400">Live ward escalation intensity.</p>
          </div>
          <div className="text-xs text-cyan-500">Updated 2 mins ago</div>
        </div>
        <div className="mt-4 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={wardTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="wardA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="wardB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="wardC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" />
              <Area type="monotone" dataKey="wardA" name="Ward 12" stroke="#22d3ee" fill="url(#wardA)" strokeWidth={2} />
              <Area type="monotone" dataKey="wardB" name="Ward 5" stroke="#6366f1" fill="url(#wardB)" strokeWidth={2} />
              <Area type="monotone" dataKey="wardC" name="Ward 3" stroke="#fbbf24" fill="url(#wardC)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Category Distribution
        </h3>
        <div className="mt-4 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
              >
                {categoryDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Resolution Momentum
        </h3>
        <div className="mt-4 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={resolutionTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="incoming" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          SLA Compliance
        </h3>
        <div className="mt-4 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={slaCompliance}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="withinSla" fill="#22c55e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="breached" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Priority Distribution
        </h3>
        <div className="mt-4 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Escalation Analytics
        </h3>
        <div className="mt-4 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={escalationAnalytics}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="escalations" stroke="#f97316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="risk" stroke="#e11d48" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
