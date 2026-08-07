import { apiClient } from "./client";

export const govDataService = {
  // Enhanced leaderboard with government data
  getEnhancedLeaderboard: async () => {
    try {
      return await apiClient.get("/analytics/leaderboard/enhanced");
    } catch (error) {
      console.error("Error fetching enhanced leaderboard:", error);
      throw error;
    }
  },

  // Department leaderboard with real metrics
  getDepartmentLeaderboard: async () => {
    try {
      return await apiClient.get("/analytics/leaderboard/departments");
    } catch (error) {
      console.error("Error fetching department leaderboard:", error);
      throw error;
    }
  },

  // Fetch governance analytics with real-time data
  getGovernanceMetrics: async () => {
    try {
      return await apiClient.get("/analytics/governance");
    } catch (error) {
      console.error("Error fetching governance metrics:", error);
      throw error;
    }
  },

  // Get comprehensive dashboard with government data
  getComprehensiveDashboard: async () => {
    try {
      return await apiClient.get("/analytics/dashboard");
    } catch (error) {
      console.error("Error fetching comprehensive dashboard:", error);
      throw error;
    }
  },

  // Get performance trends
  getPerformanceTrends: async (timeframe = "week") => {
    try {
      return await apiClient.get(`/analytics/trends?timeframe=${timeframe}`);
    } catch (error) {
      console.error("Error fetching performance trends:", error);
      throw error;
    }
  },

  // Get department comparison data
  getDepartmentComparison: async (departmentIds?: string[]) => {
    try {
      const params = departmentIds ? { departmentIds: departmentIds.join(",") } : {};
      return await apiClient.get("/analytics/comparison", params);
    } catch (error) {
      console.error("Error fetching department comparison:", error);
      throw error;
    }
  },

  // Get category-wise complaint distribution
  getCategoryDistribution: async () => {
    try {
      return await apiClient.get("/analytics/categories");
    } catch (error) {
      console.error("Error fetching category distribution:", error);
      throw error;
    }
  },

  // Get real-time statistics
  getRealtimeStats: async () => {
    try {
      return await apiClient.get("/analytics/realtime");
    } catch (error) {
      console.error("Error fetching realtime stats:", error);
      throw error;
    }
  },

  // Get historical data for charts
  getHistoricalData: async (days = 30) => {
    try {
      return await apiClient.get(`/analytics/history?days=${days}`);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      throw error;
    }
  },

  // Get SLA and compliance metrics
  getComplianceMetrics: async () => {
    try {
      return await apiClient.get("/analytics/compliance");
    } catch (error) {
      console.error("Error fetching compliance metrics:", error);
      throw error;
    }
  },
};
