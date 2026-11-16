"use client";

import { type ReactNode, Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "./sidebar";
import TopNavbar from "./top-navbar";
import Footer from "./footer";
import { supabase } from "@/lib/supabase/client";

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
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string }>({});
  const router = useRouter();
  const pathname = usePathname();

  const navigation =
    role === "student"
      ? studentNavigation
      : role === "employer"
        ? employerNavigation
        : adminNavigation;

  const config = workspaceConfig[role];

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const raw = localStorage.getItem("skillbridge_user");
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);
        let fullName = parsed.full_name;

        if (!fullName && parsed.user_id) {
          const { data } = await supabase
            .from("profile")
            .select("full_name")
            .eq("user_id", parsed.user_id)
            .single();

          if (data?.full_name) {
            fullName = data.full_name;
            localStorage.setItem(
              "skillbridge_user",
              JSON.stringify({ ...parsed, full_name: fullName })
            );
          }
        }

        if (active) {
          setUserInfo({ name: fullName, email: parsed.email });
        }
      } catch {
        // Ignore malformed storage
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    localStorage.removeItem("skillbridge_user");
    router.push("/login");
    router.refresh();
  }

  const currentPage = pathname.endsWith("/profile")
    ? "Profile"
    : [...navigation]
        .sort((a, b) => b.href.length - a.href.length)
        .find(
          (item) =>
            pathname === item.href || pathname.startsWith(`${item.href}/`)
        )?.name ?? "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        navigation={navigation}
        workspaceLabel={config.workspaceLabel}
        institutionName={config.institutionName}
        accountName={userInfo.name || config.accountName}
        accountEmail={userInfo.email || config.accountEmail}
        profileHref={role === "admin" ? "/admin" : `/${role}/profile`}
        onSignOut={handleSignOut}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar
          workspace={config.workspaceLabel}
          currentPage={currentPage}
          onMenuClick={() => setMobileOpen(true)}
        />

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