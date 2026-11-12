
"use client";

import { useSyncExternalStore } from "react";
import { Bell, ChevronRight, Menu } from "lucide-react";

const subscribe = () => () => {};

const getSnapshot = () =>
  new Intl.DateTimeFormat("en-MY", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date());

const getServerSnapshot = () => "";

interface TopNavbarProps {
  workspace: string;
  currentPage: string;
  onMenuClick: () => void;
}

export default function TopNavbar({
  workspace,
  currentPage,
  onMenuClick,
}: TopNavbarProps) {
  const currentDate = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-4 sm:px-6 xl:px-8">

      {/* Left section */}
      <div className="flex min-w-0 items-center gap-3">

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-foreground md:hidden"
        >
          <Menu size={21} />
        </button>

        {/* Breadcrumb */}
        <div className="hidden items-center gap-3 text-sm sm:flex">
          <span className="text-muted">{workspace}</span>
          <ChevronRight size={16} className="text-muted" />
        </div>

        {/* Current page */}
        <span className="truncate text-sm font-semibold text-foreground">
          {currentPage}
        </span>
      </div>

      {/* Right section */}
      <div className="flex shrink-0 items-center gap-3 lg:gap-6">

        {/* Current date */}
        <span className="hidden text-sm text-muted lg:block">
          {currentDate}
        </span>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-foreground"
        >
          <Bell size={20} />
        </button>

      </div>
    </header>
  );
}
