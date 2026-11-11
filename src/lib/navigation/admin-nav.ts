import {
  LayoutDashboard,
  Database,
  Users,
} from "lucide-react";

import type { NavigationItem } from "./navigation";

export const adminNavigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Master Data",
    href: "/admin/master-data",
    icon: Database,
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users,
  },
];