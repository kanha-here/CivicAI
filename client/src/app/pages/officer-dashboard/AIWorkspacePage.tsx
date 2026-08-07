import { useMemo, useState } from "react";
import {
    Activity,
    AlertTriangle,
    BadgeCheck,
    BrainCircuit,
    ChevronRight,
    FileSearch,
    MessageSquare,
    ShieldAlert,
    Sparkles,
} from "lucide-react";
import { AITypingIndicator } from "../../components/ai/ai-typing-indicator";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { GlassCard } from "../../components/shared/glass-card";

const conversations = [
    {
        id: "conv-1",
        title: "Ward 12 sanitation escalation",
        updated: "2m ago",
        tags: ["Critical", "Sanitation"],
    },
    {
        id: "conv-2",
        title: "Traffic signal outage triage",
        updated: "18m ago",
        tags: ["High", "Traffic"],
    },
    {
        id: "conv-3",
        title: "Water supply disruption summary",
        updated: "1h ago",
        tags: ["Medium", "Water"],
    },
];

const messages = [
    {
        id: "msg-1",
        role: "officer",
        content:
            "Summarize Ward 12 sanitation complaints and recommend next actions.",
    },
    {
        id: "msg-2",
        role: "assistant",
        content:
            "Ward 12 has 6 clustered reports in the last 2 hours. Risk: contamination spread to residential blocks. Recommended: escalate to rapid response, notify health authority, dispatch sanitation unit within 30 minutes.",
    },
    {
        id: "msg-3",
        role: "assistant",
        content:
            "Draft response is ready with resident notification template and ETA.",
    },
];

const aiCards = [
    {
        id: "card-1",
        title: "Escalation Prediction",
        description:
            "Based on historical trends, escalation probability is 82% within 45 minutes.",
        confidence: "High",
        intent: "critical",
    },
    {
        id: "card-2",
        title: "Complaint Summarization",
        description:
            "Summary ready: 6 reports, 2 media attachments, 3 verified residents.",
        confidence: "High",
        intent: "neutral",
    },
    {
        id: "card-3",
        title: "Similar Complaint Retrieval",
        description: "Found 8 similar incidents in Ward 10 (last 30 days).",
        confidence: "Medium",
        intent: "info",
    },
    {
        id: "card-4",
        title: "Resolution Suggestions",
        description:
            "Deploy sanitation team + traffic marshal. Auto-notify residents.",
        confidence: "High",
        intent: "positive",
    },
];

const intentStyles: Record<string, string> = {
    critical:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300",
    positive:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300",
    info: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/50 dark:bg-cyan-900/20 dark:text-cyan-300",
    neutral:
        "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function OfficerAIWorkspace() {
    const [activeConversation, setActiveConversation] = useState("conv-1");
    const [expandedCard, setExpandedCard] = useState<string | null>("card-1");

    const activeThread = useMemo(
        () => conversations.find((thread) => thread.id === activeConversation),
        [activeConversation],
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <BrainCircuit className="h-6 w-6 text-cyan-500" />
                    <h1 className="text-2xl font-semibold">
                        AI Assistant Workspace
                    </h1>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    AI-powered operational copilot for rapid grievance triage,
                    summarization, and response generation.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
                <GlassCard className="p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Conversations
                        </p>
                        <Button size="sm" variant="outline" className="text-xs">
                            New
                        </Button>
                    </div>
                    <div className="mt-4 space-y-2">
                        {conversations.map((thread) => {
                            const isActive = activeConversation === thread.id;
                            return (
                                <button
                                    key={thread.id}
                                    onClick={() =>
                                        setActiveConversation(thread.id)
                                    }
                                    className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                                        isActive
                                            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/30 dark:text-blue-200"
                                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {thread.title}
                                        </span>
                                        <ChevronRight className="h-4 w-4 opacity-70" />
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <span>{thread.updated}</span>
                                        <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                        <span>{thread.tags.join(" · ")}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-6">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <MessageSquare className="h-4 w-4" />
                            Conversation navigation
                        </div>
                        <div className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                            <p>Ward 12 escalation summary</p>
                            <p>Resident response draft</p>
                            <p>Routing recommendation</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Active thread
                            </p>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {activeThread?.title}
                            </h2>
                        </div>
                        <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                            AI Copilot
                        </Badge>
                    </div>

                    <div className="mt-6 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`rounded-2xl border px-4 py-3 text-sm ${
                                    message.role === "assistant"
                                        ? "border-cyan-200 bg-cyan-50 text-slate-700 dark:border-cyan-900/40 dark:bg-cyan-900/20 dark:text-slate-200"
                                        : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                }`}
                            >
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    {message.role === "assistant"
                                        ? "AI Assistant"
                                        : "Officer"}
                                </div>
                                <p className="mt-2 leading-relaxed">
                                    {message.content}
                                </p>
                            </div>
                        ))}
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <AITypingIndicator />
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                        <input
                            type="text"
                            placeholder="Ask the AI to summarize, draft, or triage..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        />
                        <Button className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                            Send
                        </Button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        {[
                            "Generate response",
                            "Summarize complaint",
                            "Predict escalation",
                            "Find similar cases",
                        ].map((action) => (
                            <button
                                key={action}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </GlassCard>

                <div className="space-y-4">
                    <GlassCard className="p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <FileSearch className="h-4 w-4 text-blue-500" />
                            Complaint Context
                        </div>
                        <div className="mt-3 space-y-3 text-xs text-slate-500 dark:text-slate-400">
                            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                                <p className="font-semibold text-slate-700 dark:text-slate-200">
                                    Ward 12 sanitation overflow
                                </p>
                                <p className="mt-1">
                                    Cluster of 6 complaints, 2 media
                                    attachments, 3 verified citizens.
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300"
                                    >
                                        Critical
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                    >
                                        SLA 1h 05m
                                    </Badge>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                                <div className="flex items-center justify-between">
                                    <span>Escalation risk</span>
                                    <span className="font-semibold text-rose-500">
                                        82%
                                    </span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div className="h-2 w-[82%] rounded-full bg-rose-500"></div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            AI Insight Cards
                        </div>
                        <div className="mt-4 space-y-3">
                            {aiCards.map((card) => {
                                const isExpanded = expandedCard === card.id;
                                return (
                                    <button
                                        key={card.id}
                                        onClick={() =>
                                            setExpandedCard(
                                                isExpanded ? null : card.id,
                                            )
                                        }
                                        className={`w-full rounded-xl border p-3 text-left transition-all ${
                                            intentStyles[card.intent]
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-semibold uppercase tracking-wide">
                                                {card.title}
                                            </p>
                                            <Badge
                                                variant="secondary"
                                                className="bg-white/70 text-slate-600 dark:bg-slate-900/40 dark:text-slate-200"
                                            >
                                                {card.confidence}
                                            </Badge>
                                        </div>
                                        <p className="mt-2 text-xs">
                                            {card.description}
                                        </p>
                                        {isExpanded && (
                                            <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <BadgeCheck className="h-4 w-4" />
                                                    Confidence validated against
                                                    30-day historical data.
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </GlassCard>

                    <GlassCard className="p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <ShieldAlert className="h-4 w-4 text-amber-500" />
                            Smart Response Generator
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Draft response aligned to citizen tone and policy
                            requirements.
                        </p>
                        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            "We have escalated the sanitation issue to the rapid
                            response unit. A team is expected within 30 minutes.
                            Thank you for reporting."
                        </div>
                        <div className="mt-3 flex gap-2">
                            <Button
                                size="sm"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Apply Draft
                            </Button>
                            <Button size="sm" variant="outline">
                                Edit
                            </Button>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <Activity className="h-4 w-4 text-emerald-500" />
                            Confidence Indicators
                        </div>
                        <div className="mt-3 space-y-3 text-xs text-slate-500 dark:text-slate-400">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span>Classification accuracy</span>
                                    <span className="font-semibold text-emerald-500">
                                        91%
                                    </span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div className="h-2 w-[91%] rounded-full bg-emerald-500"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <span>Response relevance</span>
                                    <span className="font-semibold text-blue-500">
                                        88%
                                    </span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div className="h-2 w-[88%] rounded-full bg-blue-500"></div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
