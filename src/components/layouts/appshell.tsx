"use client";

import { type ReactNode, Suspense, useState } from "react";
import { usePathname } from "next/navigation";

import Sidebar from "./sidebar";
import TopNavbar from "./top-navbar";
import Footer from "./footer";

import { studentNavigation } from "@/lib/navigation/student-nav";
import { employerNavigation } from "@/lib/navigation/employer-nav";
import { adminNavigation } from "@/lib/navigation/admin-nav";

type UserRole = "student" | "employer" | "admin";

interface AppShellProps {
  role: UserRole;
  children: ReactNode;
}

const workspaceConfig = {
  student: {
    workspaceLabel: "Student Workspace",
    institutionName: "Universiti Teknikal Malaysia Melaka (UTeM)",
    accountName: "Student Account",
    accountEmail: "student@utem.edu.my",
  },
  employer: {
    workspaceLabel: "Employer Workspace",
    institutionName: "Company Workspace",
    accountName: "Employer Account",
    accountEmail: "employer@company.com",
  },
  admin: {
    workspaceLabel: "Admin Workspace",
    institutionName: "SkillBridge AI Administration",
    accountName: "Administrator",
    accountEmail: "admin@skillbridge.ai",
  },
};

function ShellContent({ role, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation =
    role === "student"
      ? studentNavigation
      : role === "employer"
        ? employerNavigation
        : adminNavigation;

  const config = workspaceConfig[role];
  const pathname = usePathname();

  const currentPage =
    [...navigation]
      .sort((a, b) => b.href.length - a.href.length)
      .find(
        (item) =>
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`)
      )?.name ?? "Dashboard";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        navigation={navigation}
        workspaceLabel={config.workspaceLabel}
        institutionName={config.institutionName}
        accountName={config.accountName}
        accountEmail={config.accountEmail}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar
          workspace={config.workspaceLabel}
          currentPage={currentPage}
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Scrollable page content */}
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 xl:p-8">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default function AppShell({ role, children }: AppShellProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-sm text-gray-500">
          Loading workspace...
        </div>
      }
    >
      <ShellContent role={role}>{children}</ShellContent>
    </Suspense>
  );
}