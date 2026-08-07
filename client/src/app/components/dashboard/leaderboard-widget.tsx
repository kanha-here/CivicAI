import { useQuery } from "@/lib/simple-query";
import { Trophy, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Link } from "react-router";

interface DashboardLeaderboardProps {
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
  showViewAll?: boolean;
  navigateTo?: string;
}

export function DashboardLeaderboard({
  limit = 5,
  showHeader = true,
  compact = false,
  showViewAll = true,
  navigateTo = "/admin/leaderboard",
}: DashboardLeaderboardProps) {
  const { data: departmentData, isLoading } = useQuery({
    queryKey: ["analytics", "leaderboard", "departments"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/leaderboard/departments");
      if (!response.ok) throw new Error("Failed to fetch department leaderboard");
      return response.json();
    },
  });

  const departments = departmentData?.data || [];
  const topDepartments = departments.slice(0, limit);

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Gold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "Silver":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
      case "Bronze":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    }
  };

  const getRankBgColor = (badge: string) => {
    switch (badge) {
      case "Gold":
        return "bg-gradient-to-br from-yellow-400 to-yellow-600";
      case "Silver":
        return "bg-gradient-to-br from-gray-400 to-gray-600";
      case "Bronze":
        return "bg-gradient-to-br from-orange-400 to-orange-600";
      default:
        return "bg-gradient-to-br from-blue-400 to-blue-600";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-slate-400">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      {showHeader && (
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Department Rankings</h3>
            </div>
            {showViewAll && (
              <Link to={navigateTo}>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={compact ? "p-3" : "p-6"}>
        {topDepartments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No data available
          </div>
        ) : (
          <div className="space-y-2">
            {topDepartments.map((dept) => (
              <div
                key={dept.id}
                className={`flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  compact ? "text-sm" : ""
                }`}
              >
                {/* Rank and Department */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-sm ${getRankBgColor(
                      dept.badge
                    )}`}
                  >
                    {dept.rank}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {dept.name}
                      </span>
                      {!compact && (
                        <Badge className={getBadgeColor(dept.badge)} size="sm">
                          {dept.badge}
                        </Badge>
                      )}
                    </div>
                    {!compact && (
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Resolved: {dept.metrics.resolved} • Rating: {dept.metrics.avgRating}/5
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                  {!compact && (
                    <div className="text-right">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Compliance</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {dept.metrics.complianceScore}%
                      </div>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Points</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {dept.points}
                    </div>
                  </div>
                  {!compact && dept.changePercent > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    dept.changePercent < 0 && (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {showViewAll && !compact && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <Link to={navigateTo}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
              View Full Leaderboard <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
