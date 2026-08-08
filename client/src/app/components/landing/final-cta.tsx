import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { getRoleDashboard } from "../../../lib/roleDashboard";

export function FinalCTA() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const isLoggedIn = !!(session && user);

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-600 to-indigo-800 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[150px] animate-pulse" />
      </div>
      <div className="absolute inset-0 bg-grid-light opacity-20" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm mb-6">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-semibold text-white">
            {isLoggedIn ? `Welcome back, ${user?.name?.split(" ")[0] || "there"}` : "Join thousands of citizens today"}
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
          Ready to transform
          <br />
          <span className="bg-gradient-to-r from-amber-300 via-white to-emerald-300 bg-clip-text text-transparent animate-gradient">
            grievance redressal?
          </span>
        </h2>
        <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto">
          {isLoggedIn
            ? "Pick up right where you left off — file a new grievance or check on the ones you've already submitted."
            : "Join citizens who are getting faster, smarter responses to their complaints. It takes less than a minute to register."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isLoggedIn ? (
            <button
              onClick={() => navigate(getRoleDashboard(user?.role))}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-indigo-700 bg-white hover:bg-slate-100 rounded-2xl transition-all active:scale-95 shadow-2xl shadow-indigo-900/20"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-indigo-700 bg-white hover:bg-slate-100 rounded-2xl transition-all active:scale-95 shadow-2xl shadow-indigo-900/20"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm rounded-2xl transition-all active:scale-95"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
