import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
    Home,
    PlusCircle,
    Trophy,
    Users,
    MessageSquare,
    UserCircle,
    Bell,
    ShieldCheck,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const citizenLinks = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: PlusCircle, label: "New Grievance", path: "/dashboard/submit" },
    { icon: Trophy, label: "Leaderboard", path: "/dashboard/leaderboard" },
    { icon: Users, label: "Community", path: "/dashboard/community" },
    { icon: MessageSquare, label: "Contact Us", path: "/dashboard/contact" },
];

export function CitizenLayout() {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const location = useLocation();
    const { user, signOut } = useAuth();

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-inter">
            {/* Top Navigation - Glassmorphic */}
            <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        {/* Logo */}
                        <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center shadow-sm">
                                <span className="text-white dark:text-slate-900 font-bold text-sm font-serif">
                                    G
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-slate-900 dark:text-white tracking-tight hidden sm:block leading-none">
                                    Citizen Portal
                                </span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest hidden sm:block mt-0.5">
                                    GovOps Platform
                                </span>
                            </div>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-2">
                            {citizenLinks.map((link) => {
                                const isActive =
                                    location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-300 relative ${
                                            isActive
                                                ? "text-blue-700 dark:text-blue-400"
                                                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-md -z-10"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                        {/* <link.icon
                                            className={`w-4 h-4 ${isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-400"}`}
                                        /> */}
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-slate-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() =>
                                setTheme(theme === "dark" ? "light" : "dark")
                            }
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <Sun className="w-4 h-4 text-yellow-400" />
                            ) : (
                                <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            )}
                        </Button>

                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

                        <Link
                            to="/dashboard/profile"
                            className="hidden sm:flex items-center gap-3 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="text-right">
                                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                                    {user?.name || "Citizen"}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                    {user?.emailVerified ? "Verified Citizen" : "Citizen"}
                                </div>
                            </div>
                            <UserCircle className="w-8 h-8 text-slate-400" />
                        </Link>

                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-md text-xs font-medium ml-2 shadow-sm border-slate-200 dark:border-slate-700"
                            onClick={async () => {
                                await signOut();
                                navigate("/");
                            }}
                        >
                            Sign out
                        </Button>
                    </div>
                </div>

                {/* Mobile Nav Overflow */}
                <div className="md:hidden border-t border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar">
                    <nav className="flex items-center px-4 py-2 gap-2">
                        {citizenLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                                        isActive
                                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                            : "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800"
                                    }`}
                                >
                                    <link.icon className="w-3 h-3" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto p-4 md:p-8">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="max-w-6xl mx-auto pb-20"
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
}
