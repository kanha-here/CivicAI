import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Users, Shield, Database, Settings, Key, UserCheck, ShieldAlert, MoreVertical, Star, CheckCircle2, BriefcaseBusiness } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { dashboardService } from "../../services/dashboard.service";

export function SuperAdminPanel() {
  const [data, setData] = useState<any>(null);
  const [officerPerformance, setOfficerPerformance] = useState<any>(null);

  useEffect(() => {
    dashboardService.users().then(setData).catch(console.error);
    dashboardService.officerPerformance().then(setOfficerPerformance).catch(console.error);
  }, []);

  const users = data?.users ?? [];
  const stats = data?.stats ?? {};
  const officers = officerPerformance?.officers ?? [];
  const officerStats = officerPerformance?.stats ?? {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Super Admin Console</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Role-Based Access Control (RBAC) and System Configuration.</p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white">
          <Key className="w-4 h-4 mr-2" />
          Generate API Key
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-medium text-slate-600 dark:text-slate-400">Total Users</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalUsers ?? 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-medium text-slate-600 dark:text-slate-400">Admins</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.admins ?? 0}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <span className="font-medium text-slate-600 dark:text-slate-400">System Health</span>
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.systemHealth ?? 0}%</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="font-medium text-slate-600 dark:text-slate-400">Security Alerts</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.securityAlerts ?? 0}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-slate-500" />
            Personnel Access Management
          </h2>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Manage Roles
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`
                      ${user.role === 'super_admin' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : ''}
                      ${user.role === 'admin' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : ''}
                      ${user.role === 'officer' ? 'border-slate-500 text-slate-600 dark:text-slate-400' : ''}
                    `}>
                      {String(user.role).replaceAll("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {user.department}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                      user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BriefcaseBusiness className="w-5 h-5 text-slate-500" />
              Officer Work Feedback
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Cases accepted, solved work, citizen ratings, and recent feedback across all officers.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <div className="text-slate-500">Officers</div>
              <div className="font-bold text-slate-900 dark:text-white">{officerStats.totalOfficers ?? 0}</div>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <div className="text-slate-500">Taken</div>
              <div className="font-bold text-slate-900 dark:text-white">{officerStats.totalCasesTaken ?? 0}</div>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <div className="text-slate-500">Solved</div>
              <div className="font-bold text-slate-900 dark:text-white">{officerStats.totalCasesSolved ?? 0}</div>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <div className="text-slate-500">Avg Rating</div>
              <div className="font-bold text-slate-900 dark:text-white">{officerStats.averageRating ?? 0}/5</div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Officer</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Cases</th>
                <th className="px-6 py-4 font-medium">Feedback</th>
                <th className="px-6 py-4 font-medium">Recent Citizen Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {officers.map((officer: any) => (
                <tr key={officer.id} className="align-top hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{officer.name}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{officer.email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {officer.department}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        <BriefcaseBusiness className="mr-1 h-3 w-3" />
                        {officer.casesTaken} taken
                      </Badge>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {officer.casesSolved} solved
                      </Badge>
                      <Badge variant="outline">
                        {officer.activeCases} active
                      </Badge>
                      <Badge variant="outline">
                        {officer.resolutionRate}% solved
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="font-semibold">{officer.averageRating}/5</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{officer.feedbackCount} feedback</div>
                  </td>
                  <td className="px-6 py-4 min-w-80">
                    {officer.recentFeedback?.length ? (
                      <div className="space-y-2">
                        {officer.recentFeedback.slice(0, 3).map((feedback: any) => (
                          <div key={feedback.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                {feedback.citizen}
                              </span>
                              <span className="text-xs text-amber-600">{feedback.rating}/5</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                              {feedback.review || feedback.complaintTitle}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No citizen feedback yet.</span>
                    )}
                  </td>
                </tr>
              ))}
              {!officers.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    No officer work feedback yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
