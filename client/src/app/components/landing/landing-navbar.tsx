import { useEffect, useState } from "react";
import { Brain, Menu, X, Sun, Moon, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router";
import { useTheme } from "next-themes";
import { useAuth } from "../../contexts/AuthContext";
import { getRoleDashboard } from "../../../lib/roleDashboard";
import { useIsDark } from "./use-landing-theme";

const NAV_LINKS = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How It Works" },
  { id: "departments", label: "Departments" },
  { id: "testimonials", label: "Testimonials" },
  { id: "stats", label: "Stats" },
];

export function LandingNavbar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = useIsDark();
  const { user, session } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-[#020817]/80 backdrop-blur-xl border-b border-indigo-100 dark:border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">CivicAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-transparent dark:border-white/10 flex items-center justify-center transition-all active:scale-90"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {session && user ? (
              <button
                onClick={() => navigate(getRoleDashboard(user.role))}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/auth")}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/auth?mode=signup")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                >
                  Register <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Toggle menu">
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-900 dark:text-white" />
            ) : (
              <Menu className="w-6 h-6 text-slate-900 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#020817]/95 backdrop-blur-xl border-t border-indigo-100 dark:border-white/10">
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Menu</span>
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/10 flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {session && user ? (
              <button
                onClick={() => navigate(getRoleDashboard(user.role))}
                className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl"
              >
                Dashboard
              </button>
            ) : (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate("/auth")}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/15 rounded-xl"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/auth?mode=signup")}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
