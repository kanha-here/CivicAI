import { ThemeProvider } from "./components/theme-provider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { AdminDashboardLayout } from "./layouts/AdminDashboardLayout";
import { OfficerDashboardLayout } from "./layouts/OfficerDashboardLayout";
import { CitizenLayout } from "./layouts/CitizenLayout";
import { AuthProvider } from "./contexts/AuthContext";

import { OfficerOperations } from "./pages/officer-dashboard/OperationsPage";
import { OfficerAIWorkspace } from "./pages/officer-dashboard/AIWorkspacePage";
import { OfficerIntelligence } from "./pages/officer-dashboard/IntelligencePage";
import { OfficerLeaderboard } from "./pages/officer-dashboard/LeaderboardPage";
import { OfficerProfile } from "./pages/officer-dashboard/ProfilePage";
import { GovernanceDashboard } from "./pages/GovernanceDashboard";
import { Leaderboard } from "./pages/Leaderboard";
import { IntelligenceCenter } from "./pages/IntelligenceCenter";
import { RealTimeMonitoring } from "./pages/RealTimeMonitoring";
import { SuperAdminPanel } from "./pages/SuperAdminPanel";
import { SettingsPage } from "./pages/SettingsPage";
import { ManageCitizens } from "./pages/ManageCitizens";
import { AuthPage } from "./pages/AuthPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { CitizenOverview } from "./pages/citizen-dashboard/CitizenOverviewPage";
import { SubmitGrievance } from "./pages/citizen-dashboard/SubmitGrievancePage";
import { CitizenLeaderboard } from "./pages/citizen-dashboard/LeaderboardPage";
import { CitizenCommunity } from "./pages/citizen-dashboard/CommunityPage";
import { CitizenContact } from "./pages/citizen-dashboard/ContactPage";
import { CitizenProfile } from "./pages/citizen-dashboard/ProfilePage";
import { AdminOperations } from "./pages/AdminOperations";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Citizen Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<CitizenOverview />} />
              <Route path="submit" element={<SubmitGrievance />} />
              <Route path="leaderboard" element={<CitizenLeaderboard />} />
              <Route path="community" element={<CitizenCommunity />} />
              <Route path="contact" element={<CitizenContact />} />
              <Route path="profile" element={<CitizenProfile />} />
            </Route>

            {/* Legacy citizen-dashboard alias */}
            <Route path="/citizen-dashboard" element={<CitizenLayout />}>
              <Route index element={<Navigate to="/dashboard/overview" replace />} />
              <Route path="overview" element={<CitizenOverview />} />
              <Route path="submit" element={<SubmitGrievance />} />
              <Route path="leaderboard" element={<CitizenLeaderboard />} />
              <Route path="community" element={<CitizenCommunity />} />
              <Route path="contact" element={<CitizenContact />} />
              <Route path="profile" element={<CitizenProfile />} />
            </Route>

            {/* Admin Dashboard */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminDashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="operations" replace />} />
              <Route path="operations" element={<AdminOperations />} />
              <Route path="governance" element={<GovernanceDashboard />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="citizens" element={<ManageCitizens />} />
              <Route path="intelligence" element={<IntelligenceCenter />} />
              <Route path="monitoring" element={<RealTimeMonitoring />} />
              <Route path="admin" element={<SuperAdminPanel />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Legacy admin-dashboard alias */}
            <Route path="/admin-dashboard" element={<AdminDashboardLayout />}>
              <Route index element={<Navigate to="/admin/operations" replace />} />
              <Route path="operations" element={<AdminOperations />} />
              <Route path="governance" element={<GovernanceDashboard />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="citizens" element={<ManageCitizens />} />
              <Route path="intelligence" element={<IntelligenceCenter />} />
              <Route path="monitoring" element={<RealTimeMonitoring />} />
              <Route path="admin" element={<SuperAdminPanel />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Officer Dashboard */}
            <Route path="/office" element={<ProtectedRoute allowedRoles={['officer', 'admin']}><OfficerDashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="operations" replace />} />
              <Route path="operations" element={<OfficerOperations />} />
              <Route path="ai-workspace" element={<OfficerAIWorkspace />} />
              <Route path="intelligence" element={<OfficerIntelligence />} />
              <Route path="leaderboard" element={<OfficerLeaderboard />} />
              <Route path="profile" element={<OfficerProfile />} />
            </Route>

            {/* Legacy officer-dashboard alias */}
            <Route path="/officer-dashboard" element={<OfficerDashboardLayout />}>
              <Route index element={<Navigate to="/office/operations" replace />} />
              <Route path="operations" element={<OfficerOperations />} />
              <Route path="ai-workspace" element={<OfficerAIWorkspace />} />
              <Route path="intelligence" element={<OfficerIntelligence />} />
              <Route path="leaderboard" element={<OfficerLeaderboard />} />
              <Route path="profile" element={<OfficerProfile />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
