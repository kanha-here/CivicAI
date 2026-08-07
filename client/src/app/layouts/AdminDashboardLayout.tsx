import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import {
  Users,
  AlertTriangle,
  BarChart3,
  Settings,
  Shield,
  Bell,
  Search,
  Menu,
  Moon,
  Sun,
  UserCircle,
  Map,
  ShieldAlert,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin" },
  { icon: AlertTriangle, label: "Operations", path: "/admin/operations" },
  { icon: BarChart3, label: "Governance", path: "/admin/governance" },
  { icon: Users, label: "Citizens", path: "/admin/citizens" },
  { icon: Shield, label: "Intelligence", path: "/admin/intelligence" },
  { icon: Map, label: "Live Monitoring", path: "/admin/monitoring" },
  { icon: ShieldAlert, label: "Super Admin", path: "/admin/admin" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export function AdminDashboardLayout() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1020] flex transition-colors duration-300">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                GrievanceAI
              </h2>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">GovOps Platform</p>
            </div>
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <link.icon
                    className={`w-4 h-4 ${isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
                  />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || "Admin"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || "admin@govops.ai"}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-500"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-600 dark:text-slate-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden sm:flex relative w-64 group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search cases, officers..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 transition-shadow text-slate-900 dark:text-white placeholder:text-slate-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden group-hover:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-400">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-600 dark:text-slate-400"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-slate-600 dark:text-slate-400"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
