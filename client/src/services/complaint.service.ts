import { apiClient } from "../api/client";

export type Complaint = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  department?: { id: string; name: string } | null;
  prediction?: {
    complaint: string;
    validity?: string;
    validity_confidence?: number;
    priority?: string;
    priority_confidence?: number;
    trust_score?: number;
    unavailable?: boolean;
    error?: string;
  };
  aiModelOutputs?: Array<{
    id: string;
    modelName: string;
    status: string;
    confidenceScore?: number | string | null;
    aiRecommendation?: string | null;
    priorityScore?: number | string | null;
    severityAnalysis?: string | null;
    severityScore?: number | string | null;
    emergencyLevel?: string | null;
    estimatedResolutionHours?: number | null;
    suggestedDepartment?: string | null;
    riskCategory?: string | null;
    classification?: string | null;
    priorityLevel?: string | null;
    escalationRecommendation?: string | null;
    areaImpact?: string | null;
    spamRisk?: string | null;
    processedOutput?: Record<string, unknown> | null;
  }>;
  resolutionPredictions?: Array<{
    estimatedResolutionHours?: number;
    estimatedResolvedAt?: string | null;
    actualResolutionHours?: number | string | null;
    accuracyScore?: number | string | null;
    officerEfficiencyScore?: number | string | null;
  }>;
  whatsappNotification?: {
    sent?: boolean;
    reason?: string;
    sid?: string;
  };
  attachments?: Array<{
    id: string;
    fileUrl: string;
    fileName?: string | null;
    createdAt: string;
  }>;
  feedback?: Array<{
    id: string;
    rating: number;
    review?: string | null;
    createdAt: string;
    user?: { id: string; name: string; role: string } | null;
  }>;
  predictions?: Array<{
    validity?: string | null;
    validityConfidence?: number | string | null;
    priority?: string | null;
    priorityConfidence?: number | string | null;
    trustScore?: number | string | null;
  }>;
  statusHistory?: Array<{ id: string; oldStatus?: string | null; newStatus: string; createdAt: string; note?: string; changedBy?: { name?: string } | null }>;
};

export type ComplaintList = {
  items: Complaint[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export const complaintService = {
  list: (params?: Record<string, unknown>) => apiClient.get<ComplaintList>("/complaints", params),
  create: (data: { title: string; description: string; priority?: string; departmentId?: string; category?: string; subCategory?: string; attachments?: Array<{ fileUrl: string; fileName?: string }> }) =>
    apiClient.post<Complaint>("/complaints", data),
  getById: (id: string) => apiClient.get<Complaint>(`/complaints/${id}`),
  update: (id: string, data: Partial<Complaint>) => apiClient.put<Complaint>(`/complaints/${id}`, data),
  addProgress: (id: string, data: { comment?: string; imageUrl?: string; fileName?: string; status?: "assigned" | "in_progress" | "resolved" }) =>
    apiClient.post<Complaint>(`/complaints/${id}/progress`, data),
  addFeedback: (id: string, data: { rating: number; review?: string }) =>
    apiClient.post<NonNullable<Complaint["feedback"]>[number]>(`/complaints/${id}/feedback`, data),
  workReport: (id: string) => apiClient.get<any>(`/complaints/${id}/work-report`),
  downloadWorkReport: (id: string) => apiClient.download(`/complaints/${id}/work-report`, { download: "1" }),
  delete: (id: string) => apiClient.delete<{ id: string }>(`/complaints/${id}`),
  aiOutputs: (id: string) => apiClient.get<NonNullable<Complaint["aiModelOutputs"]>>(`/ai/complaints/${id}/outputs`),
  completionReport: (id: string) => apiClient.get<any>(`/ai/complaints/${id}/report`),
  rerunAI: (id: string) => apiClient.post<NonNullable<Complaint["aiModelOutputs"]>>(`/ai/complaints/${id}/rerun`),
};
