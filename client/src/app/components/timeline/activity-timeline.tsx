import { motion } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Sparkles,
  UserCheck,
} from "lucide-react";
import type { ActivityEvent } from "../../types/operations";

const iconMap: Record<ActivityEvent["type"], typeof ClipboardList> = {
  received: ClipboardList,
  classified: Sparkles,
  assigned: UserCheck,
  escalated: AlertTriangle,
  resolved: CheckCircle2,
  note: MessageSquare,
};

const colorMap: Record<ActivityEvent["type"], string> = {
  received: "text-cyan-400",
  classified: "text-purple-400",
  assigned: "text-blue-400",
  escalated: "text-rose-400",
  resolved: "text-emerald-400",
  note: "text-amber-400",
};

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  return (
    <div className="rounded-2xl border border-white/40 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Real-Time Governance Activity
          </h3>
          <p className="text-xs text-slate-400">Live officer and AI actions.</p>
        </div>
        <span className="text-xs text-emerald-500">Streaming</span>
      </div>

      <div className="mt-5 space-y-4">
        {events.map((event, index) => {
          const Icon = iconMap[event.type];
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-3"
            >
              <div className="flex flex-col items-center">
                <div className={`h-9 w-9 rounded-full border border-white/20 bg-slate-900/80 flex items-center justify-center ${colorMap[event.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="h-full w-px bg-slate-200/70 dark:bg-slate-700/60" />
              </div>
              <div className="flex-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {event.title}
                  </p>
                  <span className="text-xs text-slate-400">{event.createdAt}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {event.description}
                </p>
                <p className="mt-2 text-xs text-slate-400">{event.actor}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
