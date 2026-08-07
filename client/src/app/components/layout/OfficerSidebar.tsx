import { motion } from "motion/react";
import { Link, useLocation } from "react-router";
import { Shield, ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";
import { officerNavigation } from "../../config/navigation/officerNavigation";

interface OfficerSidebarProps {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    onToggleCollapse: () => void;
    onCloseMobile: () => void;
    user?: { name?: string; role?: string } | null;
}

export function OfficerSidebar({
    isCollapsed,
    isMobileOpen,
    onToggleCollapse,
    onCloseMobile,
    user,
}: OfficerSidebarProps) {
    const location = useLocation();
    const displayName = user?.name || "Officer User";
    const displayRole = user?.role?.replaceAll("_", " ") || "Field Officer";
    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "OF";

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 ${
                isCollapsed ? "w-20" : "w-64"
            } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <div className="h-full flex flex-col">
                <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                                GrievanceAI
                            </h2>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                                Officer Console
                            </p>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleCollapse}
                        className={`ml-auto text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white ${
                            isCollapsed ? "rotate-180" : ""
                        } hidden lg:inline-flex`}
                        aria-label="Toggle sidebar"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {officerNavigation.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                onClick={onCloseMobile}
                                className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="officer-nav-active"
                                        className="absolute inset-0 -z-10 rounded-md bg-blue-50 dark:bg-blue-900/50"
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 24,
                                        }}
                                    />
                                )}
                                <item.icon
                                    className={`w-4 h-4 relative z-10 ${
                                        isActive
                                            ? "text-blue-700 dark:text-blue-400"
                                            : "text-slate-400 dark:text-slate-500"
                                    }`}
                                />
                                {!isCollapsed && (
                                    <span className="relative z-10">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                {initials}
                            </span>
                        </div>
                        {!isCollapsed && (
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {displayName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {displayRole}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
