import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1020]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.toLowerCase())) {
    // Redirect to their own dashboard if they are in the wrong place
    const roleMap: Record<string, string> = { admin: "/admin", super_admin: "/admin", officer: "/office", citizen: "/dashboard" };
    const targetDashboard = roleMap[user.role.toLowerCase()] || "/dashboard";
    
    // Prevent infinite redirect loop if somehow allowedRoles and the target dashboard don't line up
    if (location.pathname.startsWith(targetDashboard)) {
      return <>{children}</>;
    }
    
    return <Navigate to={targetDashboard} replace />;
  }

  return <>{children}</>;
}
