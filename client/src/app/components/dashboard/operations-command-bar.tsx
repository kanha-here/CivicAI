import { Bell, BrainCircuit, Search, Signal, UserCircle2 } from "lucide-react";
import { Button } from "../ui/button";

interface OperationsCommandBarProps {
  lastUpdated: string;
}

export function OperationsCommandBar({ lastUpdated }: OperationsCommandBarProps) {
  return (
    <div className="sticky top-0 z-20">
      <div className="rounded-2xl border border-white/40 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            AI Governance Operations
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Officer Operations Console
          </h1>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="AI search: complaints, wards, signals"
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white/80 dark:bg-slate-950/60 px-9 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
              <Signal className="h-3 w-3" />
              Live sync: {lastUpdated}
            </div>
            <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300">
              <Bell className="h-5 w-5" />
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
              <BrainCircuit className="mr-2 h-4 w-4" />
              AI Copilot
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300">
              <UserCircle2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
