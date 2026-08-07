import { BrainCircuit, Sparkles, Wand2 } from "lucide-react";
import { Button } from "../ui/button";
import type { AISuggestion } from "../../types/operations";
import { AISuggestionCard } from "./ai-suggestion-card";
import { AITypingIndicator } from "./ai-typing-indicator";

interface AICopilotPanelProps {
  suggestions: AISuggestion[];
}

export function AICopilotPanel({ suggestions }: AICopilotPanelProps) {
  return (
    <div className="rounded-2xl border border-white/40 dark:border-slate-700/60 bg-gradient-to-br from-cyan-500/10 via-white/60 to-indigo-500/10 dark:from-cyan-500/10 dark:via-slate-900/60 dark:to-indigo-500/10 backdrop-blur-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Copilot</p>
            <p className="text-xs text-slate-400">Operational intelligence stream</p>
          </div>
        </div>
        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white">
          <Sparkles className="mr-1 h-4 w-4" />
          New Insight
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {suggestions.map((suggestion) => (
          <AISuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/40 dark:border-slate-700/60 bg-white/60 dark:bg-slate-950/50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Wand2 className="h-4 w-4 text-purple-500" />
          Suggested Response
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Draft message ready for Ward 12 sanitation escalation with public notice
          template and resident notification list.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" className="bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            Apply Draft
          </Button>
          <Button size="sm" variant="outline" className="bg-white/70 dark:bg-slate-900/60">
            Edit
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-500">
            Send to AI Workspace
          </Button>
        </div>
        <div className="mt-4">
          <AITypingIndicator />
        </div>
      </div>
    </div>
  );
}
