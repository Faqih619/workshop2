
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

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

const ITEMS_PER_PAGE = 4;

const normalize = (value: string | null | undefined) =>
  (value ?? "").trim().toLowerCase();

export default function StudentOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedArrangements, setSelectedArrangements] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [matchScore, setMatchScore] = useState("Any Match");
  const [postedWithin, setPostedWithin] = useState("All time");

  // Sorting and pagination
  const [sortBy, setSortBy] = useState("Recently Posted");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch opportunities
  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("opportunity")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching opportunities:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setOpportunities([]);
        setLoading(false);
        return;
      }

      const organizerIds = [
        ...new Set(data.map((item) => item.organizer_id)),
      ];

      const { data: profiles, error: profileError } = await supabase
        .from("profile")
        .select("user_id, company_name")
        .in("user_id", organizerIds);

      if (profileError) {
        console.error("Error fetching company profiles:", profileError);
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const formattedData: Opportunity[] = data.map((item) => {
        const company = profiles?.find(
          (profile) => profile.user_id === item.organizer_id
        );

        return {
          ...item,
          company: company?.company_name ?? "Unknown Company",
          match: 0,
        };
      });

      setOpportunities(formattedData);
      setLoading(false);
    };

    fetchOpportunities();
  }, []);

  // Generate filter options dynamically from Supabase data
  const opportunityTypes = useMemo(
    () =>
      [...new Set(
        opportunities
          .map((item) => item.opportunity_type?.trim())
          .filter((value): value is string => Boolean(value))
      )].sort(),
    [opportunities]
  );

  const arrangements = useMemo(
    () =>
      [...new Set(
        opportunities
          .map((item) => item.arrangement?.trim())
          .filter((value): value is string => Boolean(value))
      )].sort(),
    [opportunities]
  );

  const availableSkills = useMemo(
    () =>
      [...new Set(
        opportunities.flatMap((item) => item.required_skills ?? [])
          .map((skill) => skill.trim())
          .filter(Boolean)
      )].sort(),
    [opportunities]
  );

  const locations = useMemo(
    () =>
      [...new Set(
        opportunities
          .map((item) => item.location?.trim())
          .filter((value): value is string => Boolean(value))
      )].sort(),
    [opportunities]
  );

  // Toggle checkbox filters
  const toggleFilter = (
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void
  ) => {
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );

    setCurrentPage(1);
  };

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let results = [...opportunities];

    // Keyword search
    if (searchKeyword.trim()) {
      const keyword = normalize(searchKeyword);

      results = results.filter((item) => {
        const searchableText = [
          item.title,
          item.company,
          item.description ?? "",
          ...(item.required_skills ?? []),
        ].map(normalize).join(" ");

        return searchableText.includes(keyword);
      });
    }

    // Location filter
    if (selectedLocation) {
      results = results.filter(
        (item) =>
          normalize(item.location) === normalize(selectedLocation)
      );
    }

    // Opportunity type filter (OR within group)
    if (selectedTypes.length > 0) {
      results = results.filter((item) =>
        selectedTypes.some(
          (type) => normalize(item.opportunity_type) === normalize(type)
        )
      );
    }

    // Work arrangement filter (OR within group)
    if (selectedArrangements.length > 0) {
      results = results.filter((item) =>
        selectedArrangements.some(
          (arrangement) =>
            normalize(item.arrangement) === normalize(arrangement)
        )
      );
    }

    // Skills filter (OR within group)
    if (selectedSkills.length > 0) {
      results = results.filter((item) =>
        selectedSkills.some((skill) =>
          (item.required_skills ?? []).some(
            (requiredSkill) => normalize(requiredSkill) === normalize(skill)
          )
        )
      );
    }

    // Match score filter
    if (matchScore === "70% and above") {
      results = results.filter((item) => item.match >= 70);
    } else if (matchScore === "90% and above") {
      results = results.filter((item) => item.match >= 90);
    }

    // Posted within filter
    if (postedWithin !== "All time") {
  const now = new Date();

  const daysLimit =
    postedWithin === "24 hours"
      ? 1
      : Number.parseInt(postedWithin, 10);

  results = results.filter((item) => {
    const postedDate = new Date(item.created_at);

    const difference =
      (now.getTime() - postedDate.getTime()) /
      (1000 * 60 * 60 * 24);

    return difference >= 0 && difference <= daysLimit;
  });
}

    // Sorting
    if (sortBy === "Recently Posted") {
      results.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    } else if (sortBy === "Best Match") {
      results.sort((a, b) => b.match - a.match);
    } else if (sortBy === "Closing Soon") {
      results.sort((a, b) => {
        if (!a.application_deadline) return 1;
        if (!b.application_deadline) return -1;

        return (
          new Date(a.application_deadline).getTime() -
          new Date(b.application_deadline).getTime()
        );
      });
    }

    return results;
  }, [
    opportunities,
    searchKeyword,
    selectedLocation,
    selectedTypes,
    selectedArrangements,
    selectedSkills,
    matchScore,
    postedWithin,
    sortBy,
  ]);

  // Pagination
  const totalPages = Math.ceil(
    filteredOpportunities.length / ITEMS_PER_PAGE
  );

  const paginatedOpportunities = filteredOpportunities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Format dates
  const formatDate = (date: string | null) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Search button
  const handleSearch = () => {
    setSearchKeyword(searchInput);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedArrangements([]);
    setSelectedSkills([]);
    setMatchScore("Any Match");
    setPostedWithin("30 days");
    setSearchInput("");
    setSearchKeyword("");
    setSelectedLocation("");
    setCurrentPage(1);
    setPostedWithin("All time");
  };

  // Opportunity content
  let opportunityContent;

  if (loading) {
    opportunityContent = (
      <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
        Loading opportunities...
      </div>
    );
  } else if (error) {
    opportunityContent = (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
        Failed to load opportunities: {error}
      </div>
    );
  } else if (paginatedOpportunities.length === 0) {
    opportunityContent = (
      <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
        No opportunities match your search or filters.
      </div>
    );
  } else {
    opportunityContent = (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {paginatedOpportunities.map((opportunity) => (
          <article
            key={opportunity.opportunity_id}
            className="flex flex-col rounded-xl border bg-white p-5 transition-shadow hover:shadow-md"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg font-semibold text-blue-600">
                  {opportunity.company.charAt(0)}
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    {opportunity.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {opportunity.company}
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {opportunity.match}% Match
              </span>
            </div>

            {/* Opportunity Details */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
              <span>{opportunity.location ?? "Location not specified"}</span>
              <span>·</span>
              <span>{opportunity.arrangement ?? "Arrangement not specified"}</span>
              <span>·</span>
              <span>{opportunity.opportunity_type ?? "Type not specified"}</span>
            </div>

            {/* Description */}
            <p className="mt-4 line-clamp-2 text-sm font-medium leading-6 text-gray-800">
              {opportunity.description}
            </p>

            {/* Skills */}
            <div className="mt-4 mb-3 flex flex-wrap gap-2">
              {(opportunity.required_skills ?? []).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Card Footer */}
            <div className="mt-auto flex items-center justify-between border-t pt-4">
              <div className="text-xs text-gray-500">
                <p>Posted {formatDate(opportunity.created_at)}</p>
                <p className="mt-1">
                  Deadline: {formatDate(opportunity.application_deadline)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  aria-label="Save opportunity"
                  className="rounded-lg border p-2 hover:bg-gray-50"
                >
                  ☆
                </button>

                <button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700">
                  View Details
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Opportunity Hub</h1>

        <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
          Saved Opportunities
        </button>
      </div>

      {/* Search Section */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSearch();
          }}
          placeholder="Search opportunities..."
          className="min-w-0 flex-1 rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        <select
          value={selectedLocation}
          onChange={(event) => {
            setSelectedLocation(event.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border px-4 py-3 text-sm"
        >
          <option value="">All Locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6 lg:flex-row">

        {/* Filter Sidebar */}
        <aside className="w-full shrink-0 space-y-6 rounded-xl border bg-white p-5 lg:w-64">

          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            <button onClick={clearFilters} className="text-sm text-blue-600">
              Clear all
            </button>
          </div>

          {/* Dynamic Opportunity Type */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">
              Opportunity Type
            </h3>

            {opportunityTypes.map((item) => (
              <label
                key={item}
                className="mb-2 flex items-center gap-2 text-sm text-gray-600"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(item)}
                  onChange={() =>
                    toggleFilter(item, selectedTypes, setSelectedTypes)
                  }
                />
                {item}
              </label>
            ))}
          </div>

          <hr />

          {/* Dynamic Work Arrangement */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">
              Work Arrangement
            </h3>

            {arrangements.length === 0 ? (
              <p className="text-xs text-gray-400">
                No arrangements available
              </p>
            ) : (
              arrangements.map((item) => (
                <label
                  key={item}
                  className="mb-2 flex items-center gap-2 text-sm text-gray-600"
                >
                  <input
                    type="checkbox"
                    checked={selectedArrangements.includes(item)}
                    onChange={() =>
                      toggleFilter(
                        item,
                        selectedArrangements,
                        setSelectedArrangements
                      )
                    }
                  />
                  {item}
                </label>
              ))
            )}
          </div>

          <hr />

          {/* Match Score */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Match Score</h3>

            {["Any Match", "70% and above", "90% and above"].map((item) => (
              <label
                key={item}
                className="mb-2 flex items-center gap-2 text-sm text-gray-600"
              >
                <input
                  type="radio"
                  name="matchScore"
                  checked={matchScore === item}
                  onChange={() => {
                    setMatchScore(item);
                    setCurrentPage(1);
                  }}
                />
                {item}
              </label>
            ))}
          </div>

          <hr />

          {/* Dynamic Skills */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Skills</h3>

            {availableSkills.map((item) => (
              <label
                key={item}
                className="mb-2 flex items-center gap-2 text-sm text-gray-600"
              >
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(item)}
                  onChange={() =>
                    toggleFilter(item, selectedSkills, setSelectedSkills)
                  }
                />
                {item}
              </label>
            ))}
          </div>

          <hr />

          {/* Posted Within */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Posted Within</h3>

              <select
                value={postedWithin}
                onChange={(event) => {
                  setPostedWithin(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
              <option value="All time">All time</option>
              <option value="24 hours">Last 24 hours</option>
              <option value="7 days">Last 7 days</option>
              <option value="14 days">Last 14 days</option>
              <option value="30 days">Last 30 days</option>
            </select>
          </div>
        </aside>

        {/* Opportunity Results */}
        <section className="min-w-0 flex-1 space-y-5">

          {/* Results Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">
              {loading
                ? "Loading opportunities..."
                : `${filteredOpportunities.length} opportunities available`}
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>

              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option>Best Match</option>
                <option>Recently Posted</option>
                <option>Closing Soon</option>
              </select>
            </div>
          </div>

          {/* Opportunity Grid */}
          {opportunityContent}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
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
