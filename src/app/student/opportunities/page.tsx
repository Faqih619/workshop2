"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

type Opportunity = {
  opportunity_id: string;
  title: string;
  opportunity_type: string | null;
  description: string | null;
  required_skills: string[] | null;
  location: string | null;
  arrangement: string | null;
  application_deadline: string | null;
  created_at: string;
  organizer_id: string;
  company: string;
  match: number;
};

const ITEMS_PER_PAGE = 6;

const normalize = (value: string | null | undefined) =>
  (value ?? "").trim().toLowerCase();

// Stable deterministic pseudo-random match score based on IDs so it doesn't shuffle on every render
const getStableMatchScore = (userId: string, oppId: string) => {
  const combined = userId + oppId;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 31) + 70; // Range: 70 to 100
};

export default function StudentOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedArrangements, setSelectedArrangements] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [matchScore, setMatchScore] = useState("Any Match");
  const [postedWithin, setPostedWithin] = useState("All time");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState("Recently Posted");
  const [currentPage, setCurrentPage] = useState(1);

  // Save Opportunity state
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchOpportunitiesAndSaves = async () => {
      setLoading(true);
      setError(null);

      const storedUser = localStorage.getItem("skillbridge_user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const currentUserId = currentUser?.user_id ?? "guest";

      // 1. Fetch open listings and profiles concurrently
      const [oppsResult, savedResult] = await Promise.all([
        supabase.from("opportunity").select("*").eq("status", "open").order("created_at", { ascending: false }),
        currentUserId !== "guest" 
          ? supabase.from("saved_opportunity").select("opportunity_id").eq("user_id", currentUserId)
          : Promise.resolve({ data: [], error: null })
      ]);

      if (oppsResult.error) {
        setError(oppsResult.error.message);
        setLoading(false);
        return;
      }

      if (savedResult.data) {
        setSavedIds(savedResult.data.map((s) => s.opportunity_id));
      }

      const rawOpps = oppsResult.data ?? [];
      if (rawOpps.length === 0) {
        setOpportunities([]);
        setLoading(false);
        return;
      }

      const organizerIds = [...new Set(rawOpps.map((item) => item.organizer_id))];
      const { data: profiles } = await supabase
        .from("profile")
        .select("user_id, company_name")
        .in("user_id", organizerIds);

      const formattedData: Opportunity[] = rawOpps.map((item) => {
        const company = profiles?.find((p) => p.user_id === item.organizer_id);
        return {
          ...item,
          company: company?.company_name ?? "Unknown Company",
          match: getStableMatchScore(currentUserId, item.opportunity_id),
        };
      });

      setOpportunities(formattedData);
      setLoading(false);
    };

    fetchOpportunitiesAndSaves();
  }, []);

  // Dynamic filter options
  const opportunityTypes = useMemo(
    () => [...new Set(opportunities.map((item) => item.opportunity_type?.trim()).filter(Boolean))].sort() as string[],
    [opportunities]
  );

  const arrangements = useMemo(
    () => [...new Set(opportunities.map((item) => item.arrangement?.trim()).filter(Boolean))].sort() as string[],
    [opportunities]
  );

  const locations = useMemo(
    () => [...new Set(opportunities.map((item) => item.location?.trim()).filter(Boolean))].sort() as string[],
    [opportunities]
  );

  const toggleFilter = (value: string, selected: string[], setSelected: (vals: string[]) => void) => {
    setSelected(selected.includes(value) ? selected.filter((i) => i !== value) : [...selected, value]);
    setCurrentPage(1);
  };

  const filteredOpportunities = useMemo(() => {
    let results = [...opportunities];

    if (showSavedOnly) {
      results = results.filter((item) => savedIds.includes(item.opportunity_id));
    }

    if (searchKeyword.trim()) {
      const keyword = normalize(searchKeyword);
      results = results.filter((item) => {
        const searchableText = [
          item.title,
          item.company,
          item.description ?? "",
          ...(item.required_skills ?? []),
        ]
          .map(normalize)
          .join(" ");
        return searchableText.includes(keyword);
      });
    }

    if (selectedLocation) {
      results = results.filter((item) => normalize(item.location) === normalize(selectedLocation));
    }

    if (selectedTypes.length > 0) {
      results = results.filter((item) =>
        selectedTypes.some((type) => normalize(item.opportunity_type) === normalize(type))
      );
    }

    if (selectedArrangements.length > 0) {
      results = results.filter((item) =>
        selectedArrangements.some((arr) => normalize(item.arrangement) === normalize(arr))
      );
    }

    if (matchScore === "70% and above") {
      results = results.filter((item) => item.match >= 70);
    } else if (matchScore === "90% and above") {
      results = results.filter((item) => item.match >= 90);
    }

    if (postedWithin !== "All time") {
      const now = new Date();
      const daysLimit = postedWithin === "24 hours" ? 1 : Number.parseInt(postedWithin, 10);
      results = results.filter((item) => {
        const postedDate = new Date(item.created_at);
        const diffDays = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= daysLimit;
      });
    }

    if (sortBy === "Recently Posted") {
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "Best Match") {
      results.sort((a, b) => b.match - a.match);
    } else if (sortBy === "Closing Soon") {
      results.sort((a, b) => {
        if (!a.application_deadline) return 1;
        if (!b.application_deadline) return -1;
        return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
      });
    }

    return results;
  }, [opportunities, searchKeyword, selectedLocation, selectedTypes, selectedArrangements, matchScore, postedWithin, sortBy, savedIds, showSavedOnly]);

  const totalPages = Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE);
  const paginatedOpportunities = filteredOpportunities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (date: string | null) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
  };

  const handleToggleSave = async (opportunityId: string) => {
    const storedUser = localStorage.getItem("skillbridge_user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const currentUserId = currentUser?.user_id;

    if (!currentUserId) return;

    const isAlreadySaved = savedIds.includes(opportunityId);

    if (isAlreadySaved) {
      await supabase
        .from("saved_opportunity")
        .delete()
        .match({ user_id: currentUserId, opportunity_id: opportunityId });
      setSavedIds(savedIds.filter((id) => id !== opportunityId));
    } else {
      await supabase
        .from("saved_opportunity")
        .insert({ user_id: currentUserId, opportunity_id: opportunityId });
      setSavedIds([...savedIds, opportunityId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Opportunity Hub</h1>
        <button
          onClick={() => {
            setShowSavedOnly(!showSavedOnly);
            setCurrentPage(1);
          }}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
            showSavedOnly 
              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {showSavedOnly ? "Show All Opportunities" : "Saved Opportunities"}
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && { setSearchKeyword: setSearchInput, setCurrentPage: 1 }}
          placeholder="Search by title, company, or skills..."
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <select
          value={selectedLocation}
          onChange={(e) => {
            setSelectedLocation(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-gray-300 px-4 py-3 text-sm bg-white"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <button
          onClick={() => { setSearchKeyword(searchInput); setCurrentPage(1); }}
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 space-y-6 rounded-xl border border-gray-200 bg-white p-5 lg:w-64">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Filters</h2>
            <button onClick={() => { setSelectedTypes([]); setSelectedArrangements([]); setSearchInput(""); setSearchKeyword(""); setSelectedLocation(""); setCurrentPage(1); }} className="text-sm font-medium text-blue-600 hover:underline">
              Clear all
            </button>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Opportunity Type</h3>
            {opportunityTypes.map((item) => (
              <label key={item} className="mb-2 flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(item)}
                  onChange={() => toggleFilter(item, selectedTypes, setSelectedTypes)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {item}
              </label>
            ))}
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Work Arrangement</h3>
            {arrangements.map((item) => (
              <label key={item} className="mb-2 flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedArrangements.includes(item)}
                  onChange={() => toggleFilter(item, selectedArrangements, setSelectedArrangements)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {item}
              </label>
            ))}
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Match Score</h3>
            {["Any Match", "70% and above", "90% and above"].map((item) => (
              <label key={item} className="mb-2 flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="radio"
                  name="matchScore"
                  checked={matchScore === item}
                  onChange={() => { setMatchScore(item); setCurrentPage(1); }}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {item}
              </label>
            ))}
          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">
              {loading ? "Loading..." : `${filteredOpportunities.length} opportunities available`}
            </p>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              <option>Best Match</option>
              <option>Recently Posted</option>
              <option>Closing Soon</option>
            </select>
          </div>

          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Loading opportunities...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
              Failed to load opportunities: {error}
            </div>
          ) : paginatedOpportunities.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              No opportunities match your search or filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {paginatedOpportunities.map((opportunity) => (
                <article
                  key={opportunity.opportunity_id}
                  className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 font-semibold text-blue-600">
                          {opportunity.company.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-gray-900">{opportunity.title}</h3>
                          <p className="truncate text-sm text-gray-500">{opportunity.company}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {opportunity.match}% Match
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>{opportunity.location ?? "Remote / Unspecified"}</span>
                      <span>·</span>
                      <span>{opportunity.arrangement ?? "Arrangement not specified"}</span>
                      <span>·</span>
                      <span>{opportunity.opportunity_type ?? "Type not specified"}</span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-gray-700 leading-relaxed">
                      {opportunity.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {(opportunity.required_skills ?? []).slice(0, 4).map((skill) => (
                        <span key={skill} className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="text-xs text-gray-400">
                      <p>Posted {formatDate(opportunity.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSave(opportunity.opportunity_id)}
                        aria-label="Save opportunity"
                        className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 text-amber-500 transition-colors cursor-pointer"
                      >
                        {savedIds.includes(opportunity.opportunity_id) ? "★" : "☆"}
                      </button>
                      <Link
                        href={`/student/opportunities/${opportunity.opportunity_id}`}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg px-3 py-2 text-sm ${currentPage === page ? "bg-blue-600 text-white" : "border"}`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}