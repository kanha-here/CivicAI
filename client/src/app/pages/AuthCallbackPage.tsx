import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        const role = user.role.toLowerCase();
        const dashboard = (role === "admin" || role === "super_admin") ? "/admin" : role === "officer" ? "/office" : "/dashboard";
        navigate(dashboard, { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1020] flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Authenticating...</h2>
      <p className="text-slate-500 dark:text-slate-400 mt-2">Finishing your secure login</p>
    </div>
  );
}
