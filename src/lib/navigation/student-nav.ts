
import {
  LayoutDashboard,
  UserRound,
  BriefcaseBusiness,
  ClipboardList,
  Flag,
  ChartNoAxesCombined,
  ShieldCheck,
  BadgeCheck,
  FileText,
} from "lucide-react";

import type { NavigationItem } from "./navigation";

export const studentNavigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Profile & Skill Matrix",
    href: "/student/profile",
    icon: UserRound,
  },
  {
    name: "Opportunity Hub",
    href: "/student/opportunities",
    icon: BriefcaseBusiness,
  },
  {
    name: "Application Tracker",
    href: "/student/applications",
    icon: ClipboardList,
  },
  {
    name: "Milestone Tracker",
    href: "/student/milestones",
    icon: Flag,
  },
  {
    name: "AI Skill Gap Analysis",
    href: "/student/ai-analysis",
    icon: ChartNoAxesCombined,
  },
  {
    name: "Verification Request",
    href: "/student/verification",
    icon: ShieldCheck,
  },
  {
    name: "Verified Portfolio",
    href: "/student/portfolio",
    icon: BadgeCheck,
  },
  {
    name: "Resume Generator",
    href: "/student/resume",
    icon: FileText,
  },
];
