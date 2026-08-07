import { Moon, Sun, Menu, UserCircle, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, session, signOut } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                GrievanceAI
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Civic Intelligence Platform</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Home
            </a>
            {/* <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </a> */}
            <a href="#dashboard" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="#workflow" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Workflow
            </a>
            <a href="#about" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full text-slate-600 dark:text-slate-300"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            {session && user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/citizen-dashboard/profile" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <UserCircle className="w-5 h-5" />
                  {user.name || user.email}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => { await signOut(); navigate("/"); }}
                  className="text-slate-500 hover:text-red-500 rounded-full"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                  Login
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" className="md:hidden text-slate-600 dark:text-slate-300">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
