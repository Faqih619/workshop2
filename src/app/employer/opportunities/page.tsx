
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Opportunity = {
  opportunity_id: string;
  title: string;
  opportunity_type: string | null;
  status: string | null;
  created_at: string;
  application_deadline: string | null;
  location: string | null;
  arrangement: string | null;
};

type StatusFilter = "all" | "open" | "draft" | "closed";

const PAGE_SIZE = 8;

const statusLabels: Record<string, string> = {
  open: "Published",
  draft: "Draft",
  closed: "Closed",
};

export default function EmployerOpportunities() {
  const router = useRouter();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateSort, setDateSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
  let cancelled = false;

  const loadOpportunities = async () => {
    try {
      const storedSession = localStorage.getItem("skillbridge_user");

      if (!storedSession) {
        if (!cancelled) {
          setErrorMessage("Please log in to view your opportunities.");
          setOpportunities([]);
          setLoading(false);
        }
        return;
      }

      const employer = JSON.parse(storedSession);

      if (!employer.user_id || employer.role !== "employer") {
        if (!cancelled) {
          setErrorMessage("Invalid employer session.");
          setOpportunities([]);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("opportunity")
        .select(
          "opportunity_id, title, opportunity_type, status, created_at, application_deadline, location, arrangement"
        )
        .eq("organizer_id", employer.user_id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setErrorMessage(error.message);
        setOpportunities([]);
      } else {
        setOpportunities(data ?? []);
      }
    } catch {
      if (!cancelled) {
        setErrorMessage("Unable to retrieve your employer session.");
        setOpportunities([]);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadOpportunities();

  return () => {
    cancelled = true;
  };
}, []);


  const filteredOpportunities = useMemo(() => {
    let result = [...opportunities];

    if (statusFilter !== "all") {
      result = result.filter(
        (item) => item.status === statusFilter
      );
    }

    const searchTerm = search.trim().toLowerCase();

    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm) ||
          (item.opportunity_type ?? "")
            .toLowerCase()
            .includes(searchTerm) ||
          (item.location ?? "").toLowerCase().includes(searchTerm)
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return dateSort === "oldest"
        ? dateA - dateB
        : dateB - dateA;
    });

    return result;
  }, [opportunities, statusFilter, search, dateSort]);

  const counts = useMemo(() => {
    return {
      all: opportunities.length,
      open: opportunities.filter((item) => item.status === "open").length,
      draft: opportunities.filter((item) => item.status === "draft").length,
      closed: opportunities.filter((item) => item.status === "closed").length,
    };
  }, [opportunities]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOpportunities.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

const paginatedOpportunities = filteredOpportunities.slice(
  (safeCurrentPage - 1) * PAGE_SIZE,
  safeCurrentPage * PAGE_SIZE
);


  const handleEdit = (opportunity: Opportunity) => {
    if (opportunity.status === "draft") {
      router.push(
        `/employer/opportunities/create?id=${encodeURIComponent(
          opportunity.opportunity_id
        )}`
      );
      return;
    }

    router.push(
      `/employer/opportunities/edit/${encodeURIComponent(
        opportunity.opportunity_id
      )}`
    );
  };

  const handleDelete = async (opportunity: Opportunity) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${opportunity.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(opportunity.opportunity_id);
    setErrorMessage("");

    const { error } = await supabase
      .from("opportunity")
      .delete()
      .eq("opportunity_id", opportunity.opportunity_id);

    if (error) {
      setErrorMessage(`Unable to delete opportunity: ${error.message}`);
    } else {
      setOpportunities((previous) =>
        previous.filter(
          (item) =>
            item.opportunity_id !== opportunity.opportunity_id
        )
      );
    }

    setDeletingId(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status: string | null) => {
    switch (status) {
      case "open":
        return "bg-green-50 text-green-700";

      case "draft":
        return "bg-amber-50 text-amber-700";

      case "closed":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const tabs: {
    label: string;
    value: StatusFilter;
    count: number;
  }[] = [
    { label: "All opportunities", value: "all", count: counts.all },
    { label: "Published", value: "open", count: counts.open },
    { label: "Drafts", value: "draft", count: counts.draft },
    { label: "Closed", value: "closed", count: counts.closed },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      {/* Heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Employer / Opportunities
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Manage Opportunities
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create, edit and manage your published opportunities and drafts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/employer/opportunities/create")}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Create Opportunity
        </button>
      </div>

      {/* Main listing */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Tabs */}
        <div className="border-b border-slate-200 px-5 pt-5">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {tabs.map((tab) => {
              const active = statusFilter === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`border-b-2 pb-3 text-sm font-medium transition ${
                    active
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by opportunity title, type or location"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="all">All statuses</option>
              <option value="open">Published</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mx-5 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto px-5">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">Actions</th>
                <th className="px-3 py-3">Opportunity</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Date Created</th>
                <th className="px-3 py-3">Application Deadline</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-12 text-center text-sm text-slate-500"
                  >
                    Loading opportunities...
                  </td>
                </tr>
              ) : paginatedOpportunities.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-slate-700">
                      No opportunities found.
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Try changing your search or filters, or create a new
                      opportunity.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedOpportunities.map((opportunity) => (
                  <tr
                    key={opportunity.opportunity_id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Actions */}
                    <td className="whitespace-nowrap px-3 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(opportunity)}
                          className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={
                            deletingId === opportunity.opportunity_id
                          }
                          onClick={() => handleDelete(opportunity)}
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingId === opportunity.opportunity_id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>

                    {/* Opportunity */}
                    <td className="px-3 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {opportunity.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {opportunity.location || "Location not specified"}
                        {opportunity.arrangement
                          ? ` · ${opportunity.arrangement}`
                          : ""}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {opportunity.opportunity_id}
                      </p>
                    </td>

                    {/* Type */}
                    <td className="px-3 py-4 text-sm capitalize text-slate-600">
                      {opportunity.opportunity_type?.replaceAll("_", " ") ||
                        "Not specified"}
                    </td>

                    {/* Created */}
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                      {formatDate(opportunity.created_at)}
                    </td>

                    {/* Deadline */}
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                      {opportunity.application_deadline
                        ? formatDate(opportunity.application_deadline)
                        : "Not specified"}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                          opportunity.status
                        )}`}
                      >
                        {statusLabels[opportunity.status ?? ""] ??
                          opportunity.status ??
                          "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            {filteredOpportunities.length === 0
              ? "Showing 0 opportunities"
              : `Showing ${
                  (currentPage - 1) * PAGE_SIZE + 1
                }–${Math.min(
                  currentPage * PAGE_SIZE,
                  filteredOpportunities.length
                )} of ${filteredOpportunities.length} opportunities`}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((previous) => Math.max(1, previous - 1))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-2 text-xs text-slate-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((previous) =>
                  Math.min(totalPages, previous + 1)
                )
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
