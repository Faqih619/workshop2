"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

// TEMPORARY: Replace this with a Supabase query once your teammate pushes Module 1 (Profile & Skills)
const TEMP_STUDENT_SKILLS = [
  { skill: "React", level: 4 },
  { skill: "TypeScript", level: 3 },
  { skill: "JavaScript", level: 4 },
  { skill: "SQL", level: 4 },
  { skill: "Git", level: 4 },
  { skill: "Unit testing", level: 2 },
];

type Opportunity = {
  opportunity_id: string;
  title: string;
  department: string | null;
  opportunity_type: string | null;
  required_skills: string[] | null;
  description: string | null;
};

// Fallback sample roles in case your Supabase opportunities table is still empty
const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  {
    opportunity_id: "sample-swe",
    title: "Software Engineering Intern",
    department: "Nexora Technologies",
    opportunity_type: "Micro-Internship",
    required_skills: ["React", "TypeScript", "JavaScript", "SQL", "Git", "Unit testing"],
    description: "Build frontend features and write unit tests for web applications.",
  },
  {
    opportunity_id: "sample-data",
    title: "Data Analytics Micro-Intern",
    department: "DataPulse Studio",
    opportunity_type: "Micro-Internship",
    required_skills: ["Python", "SQL", "Data Visualization", "Excel", "Statistics"],
    description: "Clean datasets and build interactive dashboards for business insights.",
  },
];

type SkillComparison = {
  skill: string;
  userLevel: number;
  requiredLevel: number;
};

type ActionStep = {
  title: string;
  description: string;
};

type LearningResource = {
  title: string;
  meta: string;
  skill: string;
  time: string;
  priority: string;
  actionLabel: string;
  url: string;
};

type AnalysisView = {
  roleTitle: string;
  companyAndType: string;
  currentMatch: number;
  potentialMatch: number;
  skillGapsCount: number;
  updatedAt: string;
  skillsComparison: SkillComparison[];
  actionPlan: {
    priorityLabel: string;
    steps: ActionStep[];
    estimatedHours: number;
  };
  recommendedResources: LearningResource[];
};

const DEFAULT_VIEW: AnalysisView = {
  roleTitle: "Software Engineering Intern",
  companyAndType: "Nexora Technologies · Micro-Internship",
  currentMatch: 82,
  potentialMatch: 95,
  skillGapsCount: 2,
  updatedAt: "Oct 26, 2026",
  skillsComparison: [
    { skill: "React", userLevel: 4, requiredLevel: 4 },
    { skill: "TypeScript", userLevel: 3, requiredLevel: 4 },
    { skill: "JavaScript", userLevel: 4, requiredLevel: 4 },
    { skill: "SQL", userLevel: 4, requiredLevel: 3 },
    { skill: "Git", userLevel: 4, requiredLevel: 3 },
    { skill: "Unit testing", userLevel: 2, requiredLevel: 4 },
  ],
  actionPlan: {
    priorityLabel: "HIGH PRIORITY",
    steps: [
      {
        title: "Start with unit testing",
        description:
          "Move from level 2 to 4 by practicing Jest and React Testing Library on a real project.",
      },
      {
        title: "Then strengthen TypeScript",
        description:
          "Build confidence with generics, narrowing and typed API responses to reach level 4.",
      },
    ],
    estimatedHours: 18,
  },
  recommendedResources: [
    {
      title: "Testing React Applications",
      meta: "Coursera · Guided course + project",
      skill: "Unit testing",
      time: "10 hours",
      priority: "High",
      actionLabel: "Start learning",
      url: "https://www.coursera.org",
    },
    {
      title: "TypeScript: From Basics to Generics",
      meta: "Microsoft Learn · 8 modules",
      skill: "TypeScript",
      time: "8 hours",
      priority: "High",
      actionLabel: "Continue",
      url: "https://learn.microsoft.com",
    },
  ],
};

export default function StudentAIAnalysis() {
  const [view, setView] = useState<AnalysisView>(DEFAULT_VIEW);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(SAMPLE_OPPORTUNITIES);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  // Load user, opportunities, and cached analysis on page open
  useEffect(() => {
    async function loadInitialData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let activeStudentId = user?.id ?? null;

      // Fallback: read the user saved by LoginPage in localStorage
      if (!activeStudentId) {
        const stored = localStorage.getItem("skillbridge_user");
        if (stored) {
          activeStudentId = JSON.parse(stored).user_id ?? null;
        }
      }

      if (activeStudentId) {
        setStudentId(activeStudentId);
      }

     // 1. Load open opportunities from Supabase
      const { data: oppRows } = await supabase
        .from("opportunity")
        .select("opportunity_id, title, department, opportunity_type, required_skills, description")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(20);
        
      if (oppRows && oppRows.length > 0) {
        setOpportunities(oppRows);
      }

      // 2. Load latest saved analysis for this student (FR-35 caching)
      if (activeStudentId) {
        const { data: saved } = await supabase
          .from("ai_analysis")
          .select("*")
          .eq("student_id", activeStudentId)
          .order("generated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (saved && saved.missing_skills && saved.recommended_learning_path) {
          const matchedOpp = oppRows?.find(
            (o) => o.opportunity_id === saved.opportunity_id
          );

          setView({
            roleTitle: matchedOpp?.title || "Target Opportunity",
            companyAndType: matchedOpp
              ? `${matchedOpp.department || "Partner Organization"} · ${matchedOpp.opportunity_type || "Opportunity"}`
              : "Saved AI Analysis",
            currentMatch: Number(saved.compatibility_score) || 0,
            potentialMatch: saved.missing_skills.potentialMatch || 0,
            skillGapsCount: saved.missing_skills.skillGapsCount || 0,
            updatedAt: new Date(saved.generated_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            skillsComparison: saved.missing_skills.skillsComparison || [],
            actionPlan: saved.recommended_learning_path.actionPlan || DEFAULT_VIEW.actionPlan,
            recommendedResources:
              saved.recommended_learning_path.recommendedResources || [],
          });
        }
      }
    }

    loadInitialData();
  }, []);

  // Run Gemini AI when student chooses a target role
  async function handleSelectRole(opp: Opportunity, forceRefresh = false) {
    setShowRoleModal(false);
    setErrorMsg(null);
    setStatusNote(null);
    setIsAnalyzing(true);

    try {
      // Check Supabase cache first so we don't waste Gemini API calls (FR-35)
      if (studentId && !forceRefresh) {
        const { data: cached } = await supabase
          .from("ai_analysis")
          .select("*")
          .eq("student_id", studentId)
          .eq("opportunity_id", opp.opportunity_id)
          .order("generated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cached && cached.missing_skills && cached.recommended_learning_path) {
          setView({
            roleTitle: opp.title,
            companyAndType: `${opp.department || "Partner Organization"} · ${opp.opportunity_type || "Opportunity"}`,
            currentMatch: Number(cached.compatibility_score) || 0,
            potentialMatch: cached.missing_skills.potentialMatch || 0,
            skillGapsCount: cached.missing_skills.skillGapsCount || 0,
            updatedAt: new Date(cached.generated_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            skillsComparison: cached.missing_skills.skillsComparison || [],
            actionPlan: cached.recommended_learning_path.actionPlan,
            recommendedResources: cached.recommended_learning_path.recommendedResources,
          });
          setStatusNote("Loaded from your saved analysis (0 AI credits used).");
          setIsAnalyzing(false);
          return;
        }
      }

      // Otherwise call our server-side Gemini API route
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentSkills: TEMP_STUDENT_SKILLS,
          opportunity: opp,
        }),
      });

      const aiResult = await res.json();
      if (!res.ok) {
        throw new Error(aiResult.error || "Failed to run AI analysis.");
      }

      const todayLabel = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      setView({
        roleTitle: opp.title,
        companyAndType: `${opp.department || "Partner Organization"} · ${opp.opportunity_type || "Opportunity"}`,
        currentMatch: aiResult.currentMatch,
        potentialMatch: aiResult.potentialMatch,
        skillGapsCount: aiResult.skillGapsCount,
        updatedAt: todayLabel,
        skillsComparison: aiResult.skillsComparison,
        actionPlan: aiResult.actionPlan,
        recommendedResources: aiResult.recommendedResources,
      });

      // Save result to Supabase ai_analysis table if user is logged in
      if (studentId) {
        const { error: saveError } = await supabase.from("ai_analysis").insert({
          ai_analysis_id: crypto.randomUUID(),
          student_id: studentId,
          opportunity_id: opp.opportunity_id,
          compatibility_score: aiResult.currentMatch,
          missing_skills: {
            potentialMatch: aiResult.potentialMatch,
            skillGapsCount: aiResult.skillGapsCount,
            skillsComparison: aiResult.skillsComparison,
          },
          recommended_learning_path: {
            actionPlan: aiResult.actionPlan,
            recommendedResources: aiResult.recommendedResources,
          },
          generated_at: new Date().toISOString(),
        });

        if (saveError) {
          console.warn("Could not save to ai_analysis:", saveError.message);
        } else {
          setStatusNote("Fresh Gemini AI analysis generated and saved!");
        }
      } else {
        setStatusNote("Gemini AI analysis complete! (Sign in to save results to Supabase.)");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* BLOCK 1A: Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            AI Skill Gap Analysis
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Understand where you stand and focus on the skills that matter most.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowRoleModal(true)}
          disabled={isAnalyzing}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
        >
          {isAnalyzing ? "Analyzing with AI..." : "Change target role"}
        </button>
      </div>

      {/* Status / Error Alerts */}
      {errorMsg && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMsg}
        </div>
      )}
      {statusNote && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs text-blue-700">
          {statusNote}
        </div>
      )}

      {/* BLOCK 1B: Target Role Summary Card */}
      <div className="flex flex-col justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-base font-semibold text-blue-600">
            {view.roleTitle.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {view.roleTitle}
            </h2>
            <p className="text-sm text-slate-500">{view.companyAndType}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Current Match
            </p>
            <p className="mt-0.5 text-2xl font-bold text-blue-600">
              {isAnalyzing ? "..." : `${view.currentMatch}%`}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Potential Match
            </p>
            <p className="mt-0.5 text-2xl font-bold text-emerald-600">
              {isAnalyzing ? "..." : `${view.potentialMatch}%`}
            </p>
          </div>

          <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            {view.skillGapsCount} skill gaps
          </span>
        </div>
      </div>

      {/* Middle 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* BLOCK 2: Your skills vs. role requirements */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Your skills vs. role requirements
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Proficiency level · 1 Beginner to 5 Expert
            </p>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-xs bg-blue-600" />
              <span>Your level</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-xs bg-rose-500" />
              <span>Required level</span>
            </div>
          </div>

          {/* Skill Progress Bars */}
          <div className="mt-6 space-y-5">
            {view.skillsComparison.map((item) => {
              const isMet = item.userLevel >= item.requiredLevel;
              const yourBarWidth = `${(item.userLevel / 5) * 100}%`;
              const requiredBarWidth = `${(item.requiredLevel / 5) * 100}%`;

              return (
                <div
                  key={item.skill}
                  className="grid grid-cols-12 items-center gap-4"
                >
                  <span className="col-span-3 text-sm font-medium text-slate-700">
                    {item.skill}
                  </span>

                  <div className="col-span-7 space-y-1.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: yourBarWidth }}
                      />
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-rose-500 transition-all duration-300"
                        style={{ width: requiredBarWidth }}
                      />
                    </div>
                  </div>

                  <span
                    className={`col-span-2 text-right text-xs font-semibold ${
                      isMet ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {item.userLevel} / {item.requiredLevel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400">
              Based on your skill profile and published role requirements.
              Updated {view.updatedAt}.
            </p>
          </div>
        </div>

        {/* BLOCK 3: Your focused action plan */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Your focused action plan
            </h3>

            <span className="mt-3 inline-block rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
              {view.actionPlan.priorityLabel}
            </span>

            <div className="mt-4 divide-y divide-slate-100">
              {view.actionPlan.steps.map((step, index) => (
                <div key={index} className="py-3.5 first:pt-0">
                  <h4 className="text-sm font-semibold text-slate-900">
                    {step.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Estimated learning time</span>
              <span className="font-semibold text-slate-900">
                {view.actionPlan.estimatedHours} hours
              </span>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add plan to milestones
            </button>

            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              AI recommendations guide your learning. They do not guarantee
              interview or hiring outcomes.
            </p>
          </div>
        </div>
      </div>

      {/* BLOCK 4: Recommended learning resources */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Recommended learning resources
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Practical, prioritized steps to close your skill gaps
            </p>
          </div>

          <a
            href="#"
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            View learning plan →
          </a>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Learning Resource</th>
                <th className="px-4 py-3">Skill</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Next Step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {view.recommendedResources.map((res, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">{res.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{res.meta}</p>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600">
                    {res.skill}
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600">
                    {res.time}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      {res.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {res.actionLabel} ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to choose Target Role */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Choose Target Role to Analyze
              </h3>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Select an opportunity below to run Gemini AI skill-gap analysis.
            </p>

            <div className="mt-4 max-h-80 space-y-2.5 overflow-y-auto">
              {opportunities.map((opp) => (
                <button
                  key={opp.opportunity_id}
                  type="button"
                  onClick={() => handleSelectRole(opp)}
                  className="w-full rounded-lg border border-slate-200 p-3.5 text-left transition hover:border-blue-500 hover:bg-blue-50/40"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {opp.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {opp.department || "Partner Organization"} ·{" "}
                    {opp.opportunity_type || "Opportunity"}
                  </p>
                  {opp.required_skills && opp.required_skills.length > 0 && (
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Skills: {opp.required_skills.join(", ")}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}