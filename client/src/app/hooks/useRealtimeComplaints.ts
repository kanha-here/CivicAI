import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { complaintService } from "../../services/complaint.service";
import { useCurrentUser } from "../../hooks/useAuth";
import { useSocketUpdates } from "./useSocketUpdates";
import { aiSuggestions as baseSuggestions } from "../services/operations-data";
import type {
  ActivityEvent,
  AISuggestion,
  ComplaintItem,
  KPIStat,
} from "../types/operations";

interface RealtimeState {
  complaints: ComplaintItem[];
  kpis: KPIStat[];
  activity: ActivityEvent[];
  aiSuggestions: AISuggestion[];
  lastUpdated: string;
  isLive: boolean;
  isUpdating: boolean;
  isOfficerReady: boolean;
  assignComplaint: (complaintId: string) => void;
  startComplaint: (complaintId: string) => void;
  resolveComplaint: (complaintId: string) => void;
  shareProgress: (complaintId: string, payload: { comment?: string; imageUrl?: string; fileName?: string; status?: "assigned" | "in_progress" | "resolved" }) => void;
  downloadReport: (complaintId: string) => void;
  activeComplaintId: string | null;
}

function formatRelativeDate(input?: string) {
  if (!input) return "just now";
  const date = new Date(input);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function extractLocation(description: string) {
  const match = description.match(/^Location:\s*(.+)$/im);
  return match?.[1]?.trim() || "Location pending";
}

function extractCategory(description: string) {
  const match = description.match(/^Category:\s*(.+)$/im);
  return match?.[1]?.trim() || "General";
}

function mapStatus(status: string) {
  switch (status) {
    case "TRIAGED":
      return "Triaged";
    case "ASSIGNED":
      return "Assigned";
    case "IN_PROGRESS":
      return "In Progress";
    case "RESOLVED":
      return "Resolved";
    case "CLOSED":
      return "Closed";
    case "REJECTED":
      return "Rejected";
    default:
      return "New";
  }
}

function mapActivityType(status: string): ActivityEvent["type"] {
  switch (status) {
    case "ASSIGNED":
      return "assigned";
    case "RESOLVED":
    case "CLOSED":
      return "resolved";
    case "TRIAGED":
      return "classified";
    case "REJECTED":
      return "escalated";
    default:
      return "received";
  }
}

export function useRealtimeComplaints(): RealtimeState {
  const [data, setData] = useState<any>(null);
  const [dataUpdatedAt, setDataUpdatedAt] = useState<number>(Date.now());
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null);
  const { data: currentUser } = useCurrentUser();

  const fetchData = useCallback(async () => {
    try {
      const result = await complaintService.list({ page: 1, limit: 50 });
      setData(result);
      setDataUpdatedAt(Date.now());
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useSocketUpdates("operations", fetchData);

  const updateStatus = useCallback(async (complaintId: string, payload: Record<string, unknown>) => {
    setIsUpdating(true);
    setActiveComplaintId(complaintId);
    try {
      await complaintService.update(complaintId, payload as never);
      await fetchData();
    } catch (error) {
      console.error("Failed to update complaint:", error);
    } finally {
      setIsUpdating(false);
      setActiveComplaintId(null);
    }
  }, [fetchData]);

  const addProgress = useCallback(async (complaintId: string, payload: { comment?: string; imageUrl?: string; fileName?: string; status?: "assigned" | "in_progress" | "resolved" }) => {
    setIsUpdating(true);
    setActiveComplaintId(complaintId);
    try {
      await complaintService.addProgress(complaintId, payload);
      await fetchData();
    } catch (error) {
      console.error("Failed to add progress:", error);
    } finally {
      setIsUpdating(false);
      setActiveComplaintId(null);
    }
  }, [fetchData]);

  const complaints = useMemo<ComplaintItem[]>(() => {
    const items = data?.items ?? [];

    return items.map((complaint: any) => {
      const priority = String(complaint.priority || "MEDIUM").toLowerCase();
      const statusHistory = complaint.statusHistory?.[0];
      const model1 = complaint.aiModelOutputs?.find((output: any) => output.modelName === "MODEL_1_AUTHENTICITY_PRIORITY");
      const model2 = complaint.aiModelOutputs?.find((output: any) => output.modelName === "MODEL_2_CLASSIFICATION_SEVERITY");
      const savedPrediction = complaint.predictions?.[0];
      const resolution = complaint.resolutionPredictions?.[0];
      const confidenceScore = Number(model2?.confidenceScore || model1?.confidenceScore || complaint.predictions?.[0]?.priorityConfidence || complaint.prediction?.priority_confidence || 75);
      const estimatedHours = Number(model2?.estimatedResolutionHours || resolution?.estimatedResolutionHours || 24);
      const isAssignedToCurrentOfficer = Boolean(currentUser?.id && complaint.assignedOfficerId === currentUser.id);
      const canShareProgress = isAssignedToCurrentOfficer && !["RESOLVED", "CLOSED", "REJECTED"].includes(complaint.status);

      return {
        id: complaint.id,
        title: complaint.title,
        ward: complaint.department?.name || "General ward",
        location: extractLocation(complaint.description),
        category: extractCategory(complaint.description),
        confidence: Math.min(1, Math.max(0.45, confidenceScore / 100)),
        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
        slaMinutes: Math.max(
          0,
          estimatedHours * 60 - Math.round((Date.now() - new Date(complaint.createdAt).getTime()) / 60000),
        ),
        status: mapStatus(complaint.status),
        assignedOfficer: complaint.assignedOfficer?.name || "Unassigned",
        assignedOfficerId: complaint.assignedOfficerId,
        canShareProgress,
        createdAt: formatRelativeDate(complaint.createdAt),
        summary: complaint.description.slice(0, 160),
        aiRecommendation:
          model2?.aiRecommendation ||
          model1?.aiRecommendation ||
          (complaint.status === "RESOLVED" || complaint.status === "CLOSED"
            ? "Work completed and ready for citizen confirmation."
            : complaint.department?.name
              ? `Route work through ${complaint.department.name} and keep the citizen updated.`
              : "Assign an officer and route the complaint to the right department."),
        aiModels: [
          model1
            ? {
                modelName: model1.modelName,
                label: "Model 1",
                status: model1.status,
                confidence: Number(model1.confidenceScore || 0),
                summary: model1.severityAnalysis,
              }
            : savedPrediction && {
                modelName: "MODEL_1_AUTHENTICITY_PRIORITY",
                label: "Model 1",
                status: "COMPLETED",
                confidence: Number(savedPrediction.priorityConfidence || savedPrediction.validityConfidence || 0),
                summary: `Validity: ${savedPrediction.validity || "Pending"}; priority: ${savedPrediction.priority || "Pending"}; trust score: ${savedPrediction.trustScore ?? "Pending"}.`,
              },
          model2 && {
            modelName: model2.modelName,
            label: "Model 2",
            status: model2.status,
            confidence: Number(model2.confidenceScore || 0),
            summary: model2.severityAnalysis || model2.escalationRecommendation,
          },
        ].filter(Boolean) as any,
        tags: [
          complaint.priority?.toLowerCase?.() || "medium",
          model2?.riskCategory?.toLowerCase?.() || complaint.department?.name?.toLowerCase?.() || "unrouted",
          model2?.suggestedDepartment?.toLowerCase?.() || "model-2-pending",
        ],
        comments: (complaint.statusHistory || [])
          .filter((entry: any) => entry.note)
          .map((entry: any) => ({
            id: entry.id,
            author: entry.changedBy?.name || complaint.assignedOfficer?.name || "Operations Desk",
            message: entry.note,
            createdAt: formatRelativeDate(entry.createdAt),
            type: "note" as const,
          })),
        images: (complaint.attachments || []).map((attachment: any) => ({
          id: attachment.id,
          url: attachment.fileUrl,
          fileName: attachment.fileName,
          createdAt: formatRelativeDate(attachment.createdAt),
        })),
        feedback: isAssignedToCurrentOfficer
          ? (complaint.feedback || []).map((feedback: any) => ({
              id: feedback.id,
              author: feedback.user?.name || "Citizen",
              message: `${feedback.rating}/5${feedback.review ? ` - ${feedback.review}` : ""}`,
              createdAt: formatRelativeDate(feedback.createdAt),
              type: "feedback" as const,
            }))
          : [],
      };
    });
  }, [currentUser?.id, data?.items]);

  const kpis = useMemo<KPIStat[]>(() => {
    const active = complaints.filter((item) => !["Resolved", "Closed", "Rejected"].includes(item.status)).length;
    const highPriority = complaints.filter((item) => ["High", "Critical"].includes(item.priority)).length;
    const slaRisk = complaints.filter((item) => item.slaMinutes <= 180 && !["Resolved", "Closed"].includes(item.status)).length;
    const resolved = complaints.filter((item) => ["Resolved", "Closed"].includes(item.status)).length;
    const escalations = complaints.filter((item) => item.status === "Rejected").length;
    const resolutionRate = complaints.length ? Math.round((resolved / complaints.length) * 100) : 0;

    return [
      { id: "active", label: "Active Complaints", value: active, trend: 0, trendLabel: "live queue", intent: "warning", icon: Activity },
      { id: "priority", label: "High Priority", value: highPriority, trend: 0, trendLabel: "needs attention", intent: "negative", icon: AlertTriangle },
      { id: "sla", label: "SLA Risk Cases", value: slaRisk, trend: 0, trendLabel: "under 3 hours", intent: "warning", icon: Clock },
      { id: "resolved", label: "Resolved", value: resolved, trend: 0, trendLabel: "completed cases", intent: "positive", icon: CheckCircle2 },
      { id: "escalations", label: "Escalations", value: escalations, trend: 0, trendLabel: "rejected cases", intent: "warning", icon: ShieldAlert },
      { id: "resolution", label: "Resolution Rate", value: resolutionRate, unit: "%", trend: 0, trendLabel: "overall closure", intent: "positive", icon: Layers },
    ];
  }, [complaints]);

  const activity = useMemo<ActivityEvent[]>(() => {
    const items = data?.items ?? [];

    return items
      .map((complaint: any) => {
        const latest = complaint.statusHistory?.[0];
        return {
          id: latest?.id || complaint.id,
          type: mapActivityType(complaint.status),
          title: `Complaint ${mapStatus(complaint.status)}`,
          description: latest?.note || complaint.title,
          createdAt: formatRelativeDate(latest?.createdAt || complaint.updatedAt || complaint.createdAt),
          actor: complaint.assignedOfficer?.name || complaint.department?.name || "Citizen Portal",
        };
      })
      .slice(0, 8);
  }, [data?.items]);

  const lastUpdated = dataUpdatedAt ? formatRelativeDate(new Date(dataUpdatedAt).toISOString()) : "just now";

  const assignComplaint = (complaintId: string) => {
    if (!currentUser?.id || currentUser.role !== "officer") return;
    updateStatus(complaintId, {
      status: "assigned",
      assignedOfficerId: currentUser.id,
      note: `Assigned to ${currentUser.name || "current officer"}`,
    });
  };

  const startComplaint = (complaintId: string) => {
    updateStatus(complaintId, {
      status: "in_progress",
      note: "Officer has started working on this complaint.",
    });
  };

  const resolveComplaint = (complaintId: string) => {
    updateStatus(complaintId, {
      status: "resolved",
      note: "Work completed by the assigned officer.",
    });
  };

  const shareProgress = (complaintId: string, payload: { comment?: string; imageUrl?: string; fileName?: string; status?: "assigned" | "in_progress" | "resolved" }) => {
    addProgress(complaintId, payload);
  };

  const downloadReport = async (complaintId: string) => {
    const blob = await complaintService.downloadWorkReport(complaintId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `work-report-${complaintId}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return useMemo(
    () => ({
      complaints,
      kpis,
      activity,
      aiSuggestions: baseSuggestions,
      lastUpdated,
      isLive: true,
      isUpdating,
      isOfficerReady: currentUser?.role === "officer" && Boolean(currentUser?.id),
      assignComplaint,
      startComplaint,
      resolveComplaint,
      shareProgress,
      downloadReport,
      activeComplaintId,
    }),
    [activity, complaints, currentUser?.id, currentUser?.role, kpis, lastUpdated, isUpdating, activeComplaintId, assignComplaint, startComplaint, resolveComplaint, shareProgress]
  );
}
