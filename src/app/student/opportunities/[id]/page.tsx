"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

type OpportunityDetail = {
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
  department: string | null;
  responsibilities: string | null;
  qualifications: string | null;
  open_positions: number | null;
  compensation_min: number | null;
  compensation_max: number | null;
  compensation_type: string | null;
  start_date: string | null;
  end_date: string | null;
  company: string;
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params.id as string;

  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!opportunityId) return;
      setLoading(true);

      // 1. Fetch opportunity by ID
      const { data: oppData, error: oppError } = await supabase
        .from("opportunity")
        .select("*")
        .eq("opportunity_id", opportunityId)
        .maybeSingle();

      if (oppError || !oppData) {
        setError("Opportunity not found or failed to load.");
        setLoading(false);
        return;
      }

      // 2. Fetch company profile name
      const { data: profileData } = await supabase
        .from("profile")
        .select("company_name")
        .eq("user_id", oppData.organizer_id)
        .maybeSingle();

      // 3. Check if user already applied
      const storedUser = localStorage.getItem("skillbridge_user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      if (currentUser?.user_id) {
        const { data: appData } = await supabase
          .from("application")
          .select("application_id")
          .eq("student_id", currentUser.user_id)
          .eq("opportunity_id", opportunityId)
          .maybeSingle();

        if (appData) {
          setApplied(true);
        }
      }

      setOpportunity({
        ...oppData,
        company: profileData?.company_name ?? "Unknown Company",
      });
      setLoading(false);
    };

    fetchDetails();
  }, [opportunityId]);

  const handleApply = async () => {
    const storedUser = localStorage.getItem("skillbridge_user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const currentUserId = currentUser?.user_id;

    if (!currentUserId) {
      alert("Please log in as a student to apply.");
      router.push("/login");
      return;
    }

    setApplying(true);

    const { error: applyError } = await supabase
      .from("application")
      .insert({
        student_id: currentUserId,
        opportunity_id: opportunityId,
        status: "submitted",
      });

    setApplying(false);

    if (applyError) {
      console.error("Error submitting application:", applyError);
      alert("You may have already applied for this opportunity.");
      return;
    }

    // Redirect to applications tracker
    router.push("/student/applications");
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl rounded-xl border bg-white p-12 text-center text-sm text-gray-500">
        Loading opportunity details...
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
          {error || "Opportunity not found."}
        </div>
        <Link href="/student/opportunities" className="text-sm font-medium text-blue-600 hover:underline">
          ← Back to Opportunity Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Back Link */}
      <Link href="/student/opportunities" className="inline-block text-sm font-medium text-blue-600 hover:underline">
        ← Back to Opportunity Hub
      </Link>

      {/* Header Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600">
              {opportunity.company.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{opportunity.title}</h1>
              <p className="text-sm text-gray-500">{opportunity.company}</p>
            </div>
          </div>

          <button
            onClick={handleApply}
            disabled={applying || applied}
            className={`rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all cursor-pointer ${
              applied
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            }`}
          >
            {applied ? "Already Applied" : applying ? "Submitting..." : "Apply Now"}
          </button>
        </div>

        {/* Quick Badges */}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-6 text-xs text-gray-600">
          <span className="rounded-md bg-gray-100 px-3 py-1 font-medium">📍 {opportunity.location ?? "Remote"}</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-medium">💼 {opportunity.arrangement ?? "Unspecified"}</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-medium">🏷️ {opportunity.opportunity_type ?? "General"}</span>
          {opportunity.department && (
            <span className="rounded-md bg-gray-100 px-3 py-1 font-medium">🏢 {opportunity.department}</span>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Overview */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">About the Opportunity</h2>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {opportunity.description || "No description provided."}
            </p>
          </section>

          {opportunity.responsibilities && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Key Responsibilities</h2>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {opportunity.responsibilities}
              </p>
            </section>
          )}

          {opportunity.qualifications && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Qualifications & Requirements</h2>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {opportunity.qualifications}
              </p>
            </section>
          )}

          {/* Required Skills */}
          {opportunity.required_skills && opportunity.required_skills.length > 0 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Required Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {opportunity.required_skills.map((skill) => (
                  <span key={skill} className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Side: Metadata Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Key Details</h3>

            <div>
              <p className="text-xs text-gray-400">Application Deadline</p>
              <p className="mt-1 text-sm font-medium text-gray-800">{formatDate(opportunity.application_deadline)}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Timeline</p>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {formatDate(opportunity.start_date)} → {formatDate(opportunity.end_date)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Compensation</p>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {opportunity.compensation_min !== null && opportunity.compensation_max !== null
                  ? `MYR ${opportunity.compensation_min} - ${opportunity.compensation_max} (${opportunity.compensation_type ?? "Monthly"})`
                  : "Unspecified"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Open Positions</p>
              <p className="mt-1 text-sm font-medium text-gray-800">{opportunity.open_positions ?? 1} slot(s)</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}