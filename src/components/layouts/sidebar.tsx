
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  ChevronDown,
  CircleHelp,
  X,
} from "lucide-react";

import type { NavigationItem } from "@/lib/navigation/navigation";

interface SidebarProps {
  navigation: NavigationItem[];
  workspaceLabel: string;
  institutionName: string;
  accountName: string;
  accountEmail: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface SidebarContentProps
  extends Omit<SidebarProps, "mobileOpen"> {
  compact?: boolean;
}

function SidebarContent({
  navigation,
  workspaceLabel,
  institutionName,
  accountName,
  accountEmail,
  compact = false,
  onMobileClose,
}: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Branding */}
      <div className="mb-8 flex shrink-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600">
          <GraduationCap size={25} />
        </div>

        <div className={compact ? "hidden min-w-0 lg:block" : "min-w-0"}>
          <h1 className="text-lg font-bold tracking-tight">
            SkillBridge AI
          </h1>
          <p className="text-xs text-slate-400">UTeM</p>
        </div>
      </div>

      {/* Workspace information */}
      <div className={compact ? "mb-4 hidden px-3 lg:block" : "mb-4 px-3"}>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {workspaceLabel}
        </p>

        <p className="mt-2 text-xs text-slate-400">
          {institutionName}
        </p>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden overscroll-contain">
        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              title={compact ? item.name : undefined}
              onClick={onMobileClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Icon size={19} className="shrink-0" />
              <span className={compact ? "hidden truncate lg:inline" : "truncate"}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Account section */}
      <div className="mt-4 shrink-0 border-t border-slate-700 pt-5">
        <button
          type="button"
          title={compact ? accountName : undefined}
          className="mb-4 flex w-full items-center justify-between gap-2 rounded-lg p-2 text-left hover:bg-slate-700"
        >
          <div className={compact ? "hidden min-w-0 lg:block" : "min-w-0"}>
            <p className="truncate text-sm font-semibold">
              {accountName}
            </p>
            <p className="truncate text-xs text-slate-400">
              {accountEmail}
            </p>
          </div>

          <ChevronDown
            size={18}
            className="shrink-0 text-slate-400"
          />
        </button>

        <button
          type="button"
          title={compact ? "Help & Support" : undefined}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <CircleHelp size={19} className="shrink-0" />
          <span className={compact ? "hidden lg:inline" : ""}>
            Help & Support
          </span>
        </button>
      </div>
    </>
  );
}

export default function Sidebar({
  navigation,
  workspaceLabel,
  institutionName,
  accountName,
  accountEmail,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const sidebarProps = {
    navigation,
    workspaceLabel,
    institutionName,
    accountName,
    accountEmail,
    onMobileClose,
  };

  return (
    <>
      {/* Desktop and tablet sidebar */}
      <aside className="hidden h-dvh w-[280px] shrink-0 flex-col bg-sidebar px-5 py-6 text-white md:flex">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onMobileClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* Drawer */}
          <aside className="relative flex h-dvh w-[min(280px,85vw)] flex-col overflow-hidden bg-sidebar px-5 py-6 text-white shadow-xl">
            <div className="mb-4 flex shrink-0 justify-end">
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={onMobileClose}
                className="rounded-lg p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <SidebarContent {...sidebarProps} />
          </aside>
        </div>
      )}
    </>
  );
}
