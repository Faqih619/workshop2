"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type RequiredSkillItem = {
  skill: string;
  required_level: number;
};

type Opportunity = {
  opportunity_id: string;
  title: string;
  department: string | null;
  opportunity_type: string | null;
  description: string | null;
  qualifications?: string | null;
  required_skills: RequiredSkillItem[];
};

type StudentSkill = {
  skill: string;
  level: number;
};

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
  opportunityId: string;
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

// Handles both numbers ("3") and words ("Intermediate") from user_skill.proficiency_level
function mapLevelToNumber(level: string | number | null | undefined): number {
  if (typeof level === "number") return level;
  if (!level) return 1;
  const parsed = Number(level);
  if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 5) return parsed;
  const lower = level.toLowerCase();
  if (lower.includes("beginner")) return 2;
  if (lower.includes("intermediate")) return 3;
  if (lower.includes("advanced")) return 4;
  if (lower.includes("expert")) return 5;
  return 2;
}

export default function StudentAIAnalysis() {
  const [view, setView] = useState<AnalysisView | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        // 1. Find logged-in user (Supabase Auth or localStorage fallback)
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let authId = user?.id ?? null;
        let authEmail = user?.email ?? null;

        if (!authId) {
          const stored = localStorage.getItem("skillbridge_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            authId = parsed.user_id ?? null;
            authEmail = parsed.email ?? null;
          }
        }

        // Match against `users` table so we get the exact user_id used by foreign keys
        let activeStudentId = authId;
        if (authId || authEmail) {
          const filters = [
            authId ? `user_id.eq.${authId}` : null,
            authEmail ? `email.eq.${authEmail}` : null,
          ]
            .filter(Boolean)
            .join(",");

          const { data: userRow } = await supabase
            .from("users")
            .select("user_id")
            .or(filters)
            .maybeSingle();

          if (userRow?.user_id) {
            activeStudentId = userRow.user_id;
          }
        }

        if (activeStudentId) {
          setStudentId(activeStudentId);
        }

        // 2. Load opportunities, opportunity_skill, and skill master table together
        const [
          { data: oppRows, error: oppError },
          { data: oppSkillRows },
          { data: skillRows },
        ] = await Promise.all([
          supabase
            .from("opportunity")
            .select("*")
            .eq("status", "open")
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("opportunity_skill")
            .select("opportunity_id, skill_id, required_level"),
          supabase.from("skill").select("skill_id, skill_name"),
        ]);

        if (oppError) {
          console.error("Failed loading opportunities:", oppError.message);
        }

        // Build lookup map: skill_id -> skill_name
        const skillNameMap = new Map<string, string>();
        (skillRows || []).forEach((s: { skill_id: string; skill_name: string }) => {
          skillNameMap.set(s.skill_id, s.skill_name);
        });

        // Attach required_skills array to each opportunity
        const formattedOpps: Opportunity[] = (oppRows || []).map((opp: any) => {
          const matchedSkills = (oppSkillRows || [])
            .filter((os: any) => os.opportunity_id === opp.opportunity_id)
            .map((os: any) => ({
              skill: skillNameMap.get(os.skill_id) || os.skill_id,
              required_level: Number(os.required_level) || 1,
            }));

          return {
            opportunity_id: opp.opportunity_id,
            title: opp.title,
            department: opp.department ?? null,
            opportunity_type: opp.opportunity_type ?? null,
            description: opp.description ?? null,
            qualifications: opp.qualifications ?? null,
            required_skills: matchedSkills,
          };
        });

        setOpportunities(formattedOpps);

        // 3. Load student's skills from `user_skill` + latest saved `ai_analysis`
        if (activeStudentId) {
          const { data: userSkillRows } = await supabase
            .from("user_skill")
            .select("skill_id, proficiency_level")
            .eq("user_id", activeStudentId);

          if (userSkillRows && userSkillRows.length > 0) {
            setStudentSkills(
              userSkillRows.map((us: any) => ({
                skill: skillNameMap.get(us.skill_id) || us.skill_id,
                level: mapLevelToNumber(us.proficiency_level),
              }))
            );
          }

          const { data: saved } = await supabase
            .from("ai_analysis")
            .select("*")
            .eq("student_id", activeStudentId)
            .order("generated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (saved && saved.missing_skills && saved.recommended_learning_path) {
            const matchedOpp = formattedOpps.find(
              (o) => o.opportunity_id === saved.opportunity_id
            );

            setView({
              opportunityId: saved.opportunity_id,
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
              actionPlan: saved.recommended_learning_path.actionPlan,
              recommendedResources:
                saved.recommended_learning_path.recommendedResources || [],
            });
          }
        }
      } finally {
        setIsPageLoading(false);
      }
    }

    loadInitialData();
  }, []);

  async function handleSelectRole(opp: Opportunity, forceRefresh = false) {
    setShowRoleModal(false);
    setErrorMsg(null);
    setStatusNote(null);
    setIsAnalyzing(true);

    try {
      // Check Supabase cache first (FR-35)
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
            opportunityId: opp.opportunity_id,
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
            recommendedResources:
              cached.recommended_learning_path.recommendedResources,
          });
          setStatusNote("Loaded from your saved analysis (0 AI credits used).");
          setIsAnalyzing(false);
          return;
        }
      }

      // Call Gemini AI server route
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentSkills,
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
        opportunityId: opp.opportunity_id,
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

      // Save to Supabase ai_analysis
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
      {/* Page Header */}
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
          {isAnalyzing
            ? "Analyzing with AI..."
            : view
            ? "Change target role"
            : "Choose target role"}
        </button>
      </div>

      {/* Reminder if user_skill is empty */}
      {!isPageLoading && studentSkills.length === 0 && (
        <div className="flex flex-col justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 sm:flex-row sm:items-center">
          <span>
            No skills found in your profile yet. Add your skills in Profile &
            Skill Matrix for more accurate AI match scores.
          </span>
          <Link
            href="/student/profile"
            className="font-semibold underline hover:text-amber-900"
          >
            Go to Profile & Skill Matrix →
          </Link>
        </div>
      )}

      {/* Alerts */}
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

      {isPageLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading your AI skill gap analysis...
        </div>
      ) : !view ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="text-base font-semibold text-slate-900">
            No AI skill gap analysis yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Select an opportunity from the database to compare your skills
            against employer requirements and get a personalized action plan.
          </p>
          <button
            type="button"
            onClick={() => setShowRoleModal(true)}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Choose target role
          </button>
        </div>
      ) : (
        <>
          {/* Target Role Summary Card */}
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
            {/* Your skills vs. role requirements */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Your skills vs. role requirements
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Proficiency level · 1 Beginner to 5 Expert
                </p>
              </div>

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

            {/* Your focused action plan */}
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

          {/* Recommended learning resources */}
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
                        <p className="mt-0.5 text-xs text-slate-500">
                          {res.meta}
                        </p>
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
        </>
      )}

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
              {opportunities.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  No open opportunities found in the database.
                </p>
              ) : (
                opportunities.map((opp) => (
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
                    {opp.required_skills.length > 0 && (
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Skills:{" "}
                        {opp.required_skills
                          .map((s) => `${s.skill} (Lv ${s.required_level})`)
                          .join(", ")}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}