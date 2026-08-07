export function AITypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
      <span>AI is drafting a response</span>
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
