
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  ChevronDown,
  CircleHelp,
} from "lucide-react";

import type { NavigationItem } from "@/lib/navigation/navigation";

interface SidebarProps {
  navigation: NavigationItem[];
  workspaceLabel: string;
  institutionName: string;
  accountName: string;
  accountEmail: string;
}

export default function Sidebar({
  navigation,
  workspaceLabel,
  institutionName,
  accountName,
  accountEmail,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[280px] shrink-0 flex-col bg-sidebar px-5 py-6 text-white">

      {/* 1. Branding */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
          <GraduationCap size={25} />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight">
            SkillBridge AI
          </h1>
          <p className="text-xs text-slate-400">
            UTeM
          </p>
        </div>
      </div>

      {/* 2. Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-4 px-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {workspaceLabel}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {institutionName}
          </p>
        </div>

        <nav className="space-y-2">
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
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. Account */}
      <div className="border-t border-slate-700 pt-5">
        <button
          type="button"
          className="mb-4 flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-slate-700"
        >
          <div>
            <p className="text-sm font-semibold">{accountName}</p>
            <p className="text-xs text-slate-400">{accountEmail}</p>
          </div>

          <ChevronDown size={18} className="text-slate-400" />
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <CircleHelp size={19} />
          Help & Support
        </button>
      </div>
    </aside>
  );
}
