import {
  AlertTriangle,
  BrainCircuit,
  ShieldCheck,
  Trophy,
  UserCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface OfficerNavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export const officerNavigation: OfficerNavItem[] = [
  {
    id: "operations",
    label: "Operations Console",
    path: "/office/operations",
    icon: AlertTriangle,
  },
  {
    id: "ai-workspace",
    label: "AI Assistant Workspace",
    path: "/office/ai-workspace",
    icon: BrainCircuit,
  },
  {
    id: "intelligence",
    label: "Grievance Intelligence",
    path: "/office/intelligence",
    icon: ShieldCheck,
  },
  {
    id: "leaderboard",
    label: "Performance Leaderboard",
    path: "/office/leaderboard",
    icon: Trophy,
  },
  {
    id: "profile",
    label: "Profile",
    path: "/office/profile",
    icon: UserCircle2,
  },
];
