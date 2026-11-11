"use client";

import { useSyncExternalStore } from "react";
import { Bell, ChevronRight } from "lucide-react";

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
}

export default function TopNavbar({
  workspace,
  currentPage,
}: TopNavbarProps) {
  const currentDate = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-8">

      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted">{workspace}</span>
        <ChevronRight size={16} className="text-muted" />
        <span className="font-semibold text-foreground">
          {currentPage}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <span className="text-sm text-muted">
          {currentDate}
        </span>

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