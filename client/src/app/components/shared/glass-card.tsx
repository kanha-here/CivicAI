import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/40 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)] ${className}`}
    >
      {children}
    </div>
  );
}
