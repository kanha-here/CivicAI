import { apiClient } from "../api/client";

export const dashboardService = {
  dashboard: () => apiClient.get<any>("/analytics/dashboard"),
  governance: () => apiClient.get<any>("/analytics/governance"),
  trust: (complaintId?: string) => apiClient.get<any>("/analytics/trust", complaintId ? { complaintId } : undefined),
  incidents: () => apiClient.get<any>("/incidents"),
  users: () => apiClient.get<any>("/admin/users"),
  officerPerformance: () => apiClient.get<any>("/admin/officers/performance"),
  citizens: (params?: Record<string, unknown>) => apiClient.get<any>("/admin/citizens", params),
  intelligence: () => apiClient.get<any>("/admin/intelligence"),
  settings: () => apiClient.get<any>("/admin/settings"),
  leaderboard: () => apiClient.get<any>("/leaderboard"),
  citizenProfile: () => apiClient.get<any>("/citizen/profile"),
  updateCitizenProfile: (data: { phone?: string; address?: string }) => apiClient.put<any>("/citizen/profile", data),
  community: () => apiClient.get<any>("/citizen/community"),
  support: (data: { requestType: string; subject?: string; message: string; email?: string }) =>
    apiClient.post<any>("/citizen/support", data),
  landing: () => apiClient.get<any>("/public/landing"),
  analyzeComplaint: (complaint: string) => apiClient.post<any>("/public/analyze", { complaint }),
  speechToken: () => apiClient.get<{ token: string; region: string; expiresInSeconds: number }>("/speech/token"),
};
