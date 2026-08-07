import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Building } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export function AuthPage() {
  const navigate = useNavigate();
  const { user, session, signUp, signIn, signInWithGoogle, loading: authLoading } = useAuth();

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"citizen" | "officer" | "admin">("citizen");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRoleDashboard = (r: string) => {
    if (r === "officer") return "/office";
    if (r === "admin") return "/admin";
    return "/dashboard";
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      localStorage.setItem("govops_role", role); // Save the selected role for dashboard redirect upon return
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || "Google authentication failed");
    }
  };

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!authLoading && session && user) {
      const savedRole = localStorage.getItem("govops_role") || "citizen";
      navigate(getRoleDashboard(savedRole), { replace: true });
    }
  }, [authLoading, session, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (authMode === "signup") {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill all fields");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      setLoading(true);
      const result = await signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Signup successful — session is already active, redirect directly
        localStorage.setItem("govops_role", role);
        navigate(getRoleDashboard(role), { replace: true });
      }
    } else {
      if (!formData.email || !formData.password) {
        setError("Please fill all fields");
        return;
      }

      setLoading(true);
      const result = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        localStorage.setItem("govops_role", role);
        navigate(getRoleDashboard(role), { replace: true });
      }
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1020] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1020] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20"
          >
            <Shield className="w-6 h-6 text-white" />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {authMode === "login" && "Sign in to your account"}
            {authMode === "signup" && "Create your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            {authMode === "login" && "Access the GovOps Intelligence Platform"}
            {authMode === "signup" && "Join the smart governance network"}
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={authMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-800"
          >
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select your role</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setRole("citizen")}
                  className={`flex flex-col items-center justify-center py-3 px-2 border rounded-xl transition-all ${
                    role === "citizen" 
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <User className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Citizen</span>
                </button>
                <button
                  onClick={() => setRole("officer")}
                  className={`flex flex-col items-center justify-center py-3 px-2 border rounded-xl transition-all ${
                    role === "officer" 
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Building className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Officer</span>
                </button>
                <button
                  onClick={() => setRole("admin")}
                  className={`flex flex-col items-center justify-center py-3 px-2 border rounded-xl transition-all ${
                    role === "admin" 
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Shield className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Admin</span>
                </button>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {authMode === "signup" && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={authMode === "login" ? "current-password" : "new-password"}
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                {authMode === "signup" && (
                  <p className="mt-1.5 text-xs text-slate-500">Must be at least 8 characters</p>
                )}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2.5 rounded-lg text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-11 text-sm font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {authMode === "login" ? "Sign in" : "Create Account"}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-11 text-sm font-medium"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.45c0,-0.32 -0.03,-0.64 -0.09,-0.93Z" fill="#4285F4" />
                  <path d="M12,20.62c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.58c-0.91,0.61 -2.08,0.98 -3.3,0.98c-2.33,0 -4.3,-1.57 -5,-3.69H2.92v2.66c1.48,2.94 4.51,4.81 7.08,4.81Z" fill="#34A853" />
                  <path d="M7,13.15c-0.18,-0.52 -0.28,-1.08 -0.28,-1.65c0,-0.57 0.1,-1.13 0.28,-1.65V7.19H2.92c-0.62,1.24 -0.98,2.64 -0.98,4.31c0,1.67 0.36,3.07 0.98,4.31L7,13.15Z" fill="#FBBC05" />
                  <path d="M12,6.21c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.47,3.5 14.43,2.7 12,2.7C9.43,2.7 6.4,4.57 2.92,7.19l4.08,4.31C7.7,9.38 9.67,6.21 12,6.21Z" fill="#EA4335" />
                </g>
              </svg>
              Continue with Google
            </Button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">
                    {authMode === "login" ? "New to GovOps?" : "Already have an account?"}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "signup" : "login");
                    setError("");
                  }}
                >
                  {authMode === "login" ? "Create an account" : "Sign in to existing account"}
                </Button>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
              Secured by GovOps Intelligence Platform
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
