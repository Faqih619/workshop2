
import {
  LayoutDashboard,
  BriefcaseBusiness,
  UserRound,
  BadgeCheck,
  Star,
} from "lucide-react";

import type { NavigationItem } from "./navigation";

export const employerNavigation: NavigationItem[] = [
  {
    name: "Employer Dashboard",
    href: "/employer/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Manage Opportunities",
    href: "/employer/opportunities",
    icon: BriefcaseBusiness,
  },
  {
    name: "Post Opportunity",
    href: "/employer/opportunities/create",
    icon: BriefcaseBusiness,
  },
  {
    name: "View Applicants",
    href: "/employer/applicants",
    icon: UserRound,
  },
  {
    name: "Employer Verification",
    href: "/employer/verification",
    icon: BadgeCheck,
  },
  {
    name: "Employer Rating",
    href: "/employer/rating",
    icon: Star,
  },
];
