import type { LucideIcon } from "lucide-react";

export type PriorityLevel = "Low" | "Medium" | "High" | "Critical";
export type ComplaintStatus =
    | "New"
    | "Triaged"
    | "Assigned"
    | "In Progress"
    | "Escalated"
    | "Resolved"
    | "Closed"
    | "Rejected";

export interface KPIStat {
    id: string;
    label: string;
    value: number;
    unit?: string;
    trend: number;
    trendLabel: string;
    intent: "positive" | "negative" | "warning" | "neutral";
    icon: LucideIcon;
}

export interface ComplaintComment {
    id: string;
    author: string;
    message: string;
    createdAt: string;
    type: "note" | "escalation" | "internal" | "feedback";
}

export interface ComplaintProgressImage {
    id: string;
    url: string;
    fileName?: string | null;
    createdAt: string;
}

export interface ComplaintItem {
    id: string;
    title: string;
    ward: string;
    location: string;
    category: string;
    confidence: number;
    priority: PriorityLevel;
    slaMinutes: number;
    status: ComplaintStatus;
    assignedOfficer: string;
    assignedOfficerId?: string | null;
    canShareProgress?: boolean;
    createdAt: string;
    summary: string;
    aiRecommendation: string;
    aiModels?: Array<{
        modelName: string;
        label: string;
        status: string;
        confidence?: number;
        summary?: string | null;
    }>;
    tags: string[];
    comments: ComplaintComment[];
    images?: ComplaintProgressImage[];
    feedback?: ComplaintComment[];
}

export interface ActivityEvent {
    id: string;
    type:
    | "received"
    | "classified"
    | "assigned"
    | "escalated"
    | "resolved"
    | "note";
    title: string;
    description: string;
    createdAt: string;
    actor: string;
}

export interface AISuggestion {
    id: string;
    title: string;
    description: string;
    confidence: number;
    impact: "low" | "medium" | "high";
    status: "new" | "active" | "applied";
}

export interface TrendPoint {
    name: string;
    value: number;
}

export interface WardTrendPoint {
    name: string;
    wardA: number;
    wardB: number;
    wardC: number;
}

export interface CategoryDistributionPoint {
    name: string;
    value: number;
    color: string;
}

export interface ResolutionTrendPoint {
    name: string;
    resolved: number;
    incoming: number;
}

export interface SLACompliancePoint {
    name: string;
    withinSla: number;
    breached: number;
}

export interface PriorityDistributionPoint {
    name: string;
    count: number;
}

export interface EscalationPoint {
    name: string;
    escalations: number;
    risk: number;
}
