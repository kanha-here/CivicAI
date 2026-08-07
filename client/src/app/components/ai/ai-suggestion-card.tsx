import { Badge } from "../ui/badge";
import type { AISuggestion } from "../../types/operations";

const impactStyles: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-amber-500/10 text-amber-500",
  high: "bg-rose-500/10 text-rose-500",
};

interface AiSuggestionCardProps {
  suggestion: AISuggestion;
}

export function AISuggestionCard({ suggestion }: AiSuggestionCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-950/50 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          {suggestion.title}
        </h4>
        <Badge variant="secondary" className={impactStyles[suggestion.impact]}>
          {suggestion.impact}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {suggestion.description}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Confidence {Math.round(suggestion.confidence * 100)}%</span>
        <span className="uppercase tracking-[0.2em]">{suggestion.status}</span>
      </div>
    </div>
  );
}
