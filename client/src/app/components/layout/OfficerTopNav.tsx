import {
    Bell,
    BrainCircuit,
    LogOut,
    Moon,
    Search,
    Signal,
    Sun,
    UserCircle2,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";

interface OfficerTopNavProps {
    onOpenMobile: () => void;
    onToggleTheme: () => void;
    onLogout: () => void;
    theme: string | undefined;
    user?: { name?: string; role?: string; email?: string } | null;
}

export function OfficerTopNav({
    onOpenMobile,
    onToggleTheme,
    onLogout,
    theme,
    user,
}: OfficerTopNavProps) {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const displayName = user?.name || "Officer";
    const displayRole = user?.role?.replaceAll("_", " ") || "Field officer";

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-slate-600 dark:text-slate-300"
                    onClick={onOpenMobile}
                >
                    <span className="sr-only">Open menu</span>
                    <div className="h-4 w-4 border-2 border-slate-400 rounded" />
                </Button>

                <div className="hidden sm:flex relative w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="AI search: cases, wards, signals"
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 transition-shadow text-slate-900 dark:text-white placeholder:text-slate-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Signal className="h-3 w-3" />
                    {user ? "Live sync" : "Guest session"}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-slate-600 dark:text-slate-400"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </Button>

                <Button className="hidden md:inline-flex bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    AI Copilot
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleTheme}
                    className="text-slate-600 dark:text-slate-400"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </Button>

                <Button
                    variant="ghost"
                    className="hidden sm:flex h-10 items-center gap-2 px-2 text-slate-600 dark:text-slate-400"
                    title={user?.email || displayName}
                >
                    <UserCircle2 className="h-5 w-5" />
                    <span className="max-w-32 truncate text-left text-xs">
                        <span className="block font-semibold text-slate-800 dark:text-slate-100">
                            {displayName}
                        </span>
                        <span className="block capitalize text-slate-500 dark:text-slate-400">
                            {displayRole}
                        </span>
                    </span>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-600 dark:text-slate-400 hover:text-red-500"
                    onClick={async () => {
                        await signOut();
                        navigate("/");
                    }}
                    aria-label="Sign out"
                    title="Sign out"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
