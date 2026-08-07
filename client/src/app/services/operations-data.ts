import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Layers,
    ShieldAlert,
} from "lucide-react";
import type {
    ActivityEvent,
    AISuggestion,
    CategoryDistributionPoint,
    ComplaintItem,
    EscalationPoint,
    KPIStat,
    PriorityDistributionPoint,
    ResolutionTrendPoint,
    SLACompliancePoint,
    WardTrendPoint,
} from "../types/operations";

export const kpiStats: KPIStat[] = [
    {
        id: "active",
        label: "Active Complaints",
        value: 1428,
        trend: 6.2,
        trendLabel: "vs last shift",
        intent: "warning",
        icon: Activity,
    },
    {
        id: "priority",
        label: "High Priority",
        value: 86,
        trend: 3.1,
        trendLabel: "since morning",
        intent: "negative",
        icon: AlertTriangle,
    },
    {
        id: "sla",
        label: "SLA Risk Cases",
        value: 41,
        trend: -2.4,
        trendLabel: "trend improving",
        intent: "positive",
        icon: Clock,
    },
    {
        id: "resolved",
        label: "Resolved Today",
        value: 312,
        trend: 9.8,
        trendLabel: "daily momentum",
        intent: "positive",
        icon: CheckCircle2,
    },
    {
        id: "escalations",
        label: "Escalations",
        value: 18,
        trend: 1.8,
        trendLabel: "active escalations",
        intent: "warning",
        icon: ShieldAlert,
    },
    {
        id: "resolution",
        label: "Resolution Rate",
        value: 92,
        unit: "%",
        trend: 1.4,
        trendLabel: "rolling 24h",
        intent: "positive",
        icon: Layers,
    },
];

export const complaints: ComplaintItem[] = [
    {
        id: "GRV-1082",
        title: "Sewage overflow near Community School",
        ward: "Ward 12",
        location: "Pine Avenue, North District",
        category: "Sanitation",
        confidence: 0.92,
        priority: "Critical",
        slaMinutes: 78,
        status: "Escalated",
        assignedOfficer: "Aditi Sharma",
        createdAt: "4 mins ago",
        summary:
            "Multiple reports show overflow spreading toward residential blocks. Risk of contamination is high.",
        aiRecommendation:
            "Trigger emergency sanitation team and notify health authority for on-site inspection.",
        tags: ["clustered", "health risk"],
        comments: [
            {
                id: "note-1",
                author: "Ops Supervisor",
                message: "Escalated to sanitation rapid response. Awaiting dispatch ETA.",
                createdAt: "2 mins ago",
                type: "escalation",
            },
        ],
    },
    {
        id: "GRV-1076",
        title: "Traffic signal outage at Central Crossing",
        ward: "Ward 5",
        location: "Central Crossing, CBD",
        category: "Traffic",
        confidence: 0.86,
        priority: "High",
        slaMinutes: 140,
        status: "Assigned",
        assignedOfficer: "Rohit Mehta",
        createdAt: "12 mins ago",
        summary:
            "AI detected repeated signal failure complaints and live CCTV correlation.",
        aiRecommendation:
            "Coordinate with traffic control and electrical board for immediate maintenance.",
        tags: ["signal", "safety"],
        comments: [
            {
                id: "note-2",
                author: "Field Officer",
                message: "Traffic police dispatched for manual control until repair.",
                createdAt: "6 mins ago",
                type: "internal",
            },
        ],
    },
    {
        id: "GRV-1072",
        title: "Water supply disruption in Block C",
        ward: "Ward 3",
        location: "Block C, West Zone",
        category: "Water",
        confidence: 0.79,
        priority: "High",
        slaMinutes: 210,
        status: "In Progress",
        assignedOfficer: "Neha Singh",
        createdAt: "28 mins ago",
        summary:
            "Pipeline pressure drop detected across three streets. Residents without water.",
        aiRecommendation:
            "Dispatch water board repair team and notify tanker services.",
        tags: ["pipeline", "service disruption"],
        comments: [
            {
                id: "note-3",
                author: "Water Dept",
                message: "Team en route with replacement valves.",
                createdAt: "10 mins ago",
                type: "note",
            },
        ],
    },
    {
        id: "GRV-1069",
        title: "Streetlight outage across Market Road",
        ward: "Ward 9",
        location: "Market Road, East Zone",
        category: "Electricity",
        confidence: 0.74,
        priority: "Medium",
        slaMinutes: 520,
        status: "Triaged",
        assignedOfficer: "Nikhil Rao",
        createdAt: "52 mins ago",
        summary:
            "Outage aligned with feeder maintenance but no schedule found in system.",
        aiRecommendation:
            "Verify maintenance schedule and confirm with grid station.",
        tags: ["maintenance", "public safety"],
        comments: [
            {
                id: "note-4",
                author: "Ops Desk",
                message: "Awaiting confirmation from grid station.",
                createdAt: "25 mins ago",
                type: "internal",
            },
        ],
    },
    {
        id: "GRV-1062",
        title: "Garbage collection delay near Riverside",
        ward: "Ward 2",
        location: "Riverside Colony",
        category: "Sanitation",
        confidence: 0.68,
        priority: "Low",
        slaMinutes: 980,
        status: "New",
        assignedOfficer: "Unassigned",
        createdAt: "1h 12m ago",
        summary:
            "Pickup scheduled for morning was missed; complaints rising.",
        aiRecommendation:
            "Route next available sanitation truck and notify residents.",
        tags: ["missed pickup"],
        comments: [],
    },
];

export const activityEvents: ActivityEvent[] = [
    {
        id: "act-1",
        type: "received",
        title: "Complaint received",
        description: "Sewage overflow reported in Ward 12.",
        createdAt: "5 mins ago",
        actor: "Citizen Portal",
    },
    {
        id: "act-2",
        type: "classified",
        title: "AI classified complaint",
        description: "Tagged as Sanitation, Critical priority.",
        createdAt: "4 mins ago",
        actor: "AI Copilot",
    },
    {
        id: "act-3",
        type: "assigned",
        title: "Officer assigned",
        description: "Assigned to Aditi Sharma.",
        createdAt: "3 mins ago",
        actor: "Dispatch Engine",
    },
    {
        id: "act-4",
        type: "escalated",
        title: "Complaint escalated",
        description: "Escalated to rapid response unit.",
        createdAt: "2 mins ago",
        actor: "Ops Supervisor",
    },
    {
        id: "act-5",
        type: "note",
        title: "Internal note added",
        description: "Sanitation team ETA 25 mins.",
        createdAt: "1 min ago",
        actor: "Field Officer",
    },
];

export const aiSuggestions: AISuggestion[] = [
    {
        id: "ai-1",
        title: "Duplicate complaint cluster detected",
        description:
            "Ward 12 sewage overflow matches 6 related complaints. Merge and escalate.",
        confidence: 0.93,
        impact: "high",
        status: "active",
    },
    {
        id: "ai-2",
        title: "Predict escalation risk",
        description:
            "Traffic signal outage likely to escalate within 45 minutes based on historical data.",
        confidence: 0.81,
        impact: "medium",
        status: "new",
    },
    {
        id: "ai-3",
        title: "Auto-response suggestion",
        description:
            "Draft response for Riverside garbage delay with revised pickup timeline.",
        confidence: 0.77,
        impact: "low",
        status: "active",
    },
];

export const wardTrendData: WardTrendPoint[] = [
    { name: "Mon", wardA: 34, wardB: 28, wardC: 22 },
    { name: "Tue", wardA: 46, wardB: 32, wardC: 18 },
    { name: "Wed", wardA: 40, wardB: 26, wardC: 24 },
    { name: "Thu", wardA: 52, wardB: 30, wardC: 20 },
    { name: "Fri", wardA: 48, wardB: 38, wardC: 26 },
    { name: "Sat", wardA: 36, wardB: 24, wardC: 19 },
    { name: "Sun", wardA: 30, wardB: 20, wardC: 14 },
];

export const categoryDistribution: CategoryDistributionPoint[] = [
    { name: "Infrastructure", value: 28, color: "#22d3ee" },
    { name: "Water", value: 21, color: "#60a5fa" },
    { name: "Sanitation", value: 19, color: "#34d399" },
    { name: "Electricity", value: 17, color: "#fbbf24" },
    { name: "Traffic", value: 15, color: "#a78bfa" },
];

export const resolutionTrend: ResolutionTrendPoint[] = [
    { name: "Mon", resolved: 120, incoming: 148 },
    { name: "Tue", resolved: 132, incoming: 160 },
    { name: "Wed", resolved: 145, incoming: 138 },
    { name: "Thu", resolved: 162, incoming: 170 },
    { name: "Fri", resolved: 176, incoming: 182 },
    { name: "Sat", resolved: 158, incoming: 150 },
    { name: "Sun", resolved: 140, incoming: 132 },
];

export const slaCompliance: SLACompliancePoint[] = [
    { name: "Week 1", withinSla: 82, breached: 18 },
    { name: "Week 2", withinSla: 85, breached: 15 },
    { name: "Week 3", withinSla: 88, breached: 12 },
    { name: "Week 4", withinSla: 90, breached: 10 },
];

export const priorityDistribution: PriorityDistributionPoint[] = [
    { name: "Critical", count: 14 },
    { name: "High", count: 36 },
    { name: "Medium", count: 58 },
    { name: "Low", count: 42 },
];

export const escalationAnalytics: EscalationPoint[] = [
    { name: "Mon", escalations: 6, risk: 14 },
    { name: "Tue", escalations: 8, risk: 18 },
    { name: "Wed", escalations: 5, risk: 12 },
    { name: "Thu", escalations: 7, risk: 16 },
    { name: "Fri", escalations: 9, risk: 20 },
    { name: "Sat", escalations: 4, risk: 10 },
];
