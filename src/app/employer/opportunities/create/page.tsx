"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Skill = {
  skill_id: string;
  skill_name: string;
  category: string | null;
};

type SelectedSkill = {
  skill_id: string;
  skill_name: string;
  required_level: number;
};

type EmployerSession = {
  user_id: string;
  email?: string;
  role: string;
};

type OpportunityForm = {
  title: string;
  opportunity_type: string;
  department: string;
  field_of_study_target: string;
  arrangement: string;
  location: string;
  open_positions: string;
  compensation_min: string;
  compensation_max: string;
  compensation_type: string;
  application_deadline: string;
  start_date: string;
  end_date: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  is_visible: boolean;
  allow_ai_matching: boolean;
  notify_new_applicants: boolean;
};

const initialForm: OpportunityForm = {
  title: "",
  opportunity_type: "",
  department: "",
  field_of_study_target: "",
  arrangement: "",
  location: "",
  open_positions: "1",
  compensation_min: "",
  compensation_max: "",
  compensation_type: "",
  application_deadline: "",
  start_date: "",
  end_date: "",
  description: "",
  responsibilities: "",
  qualifications: "",
  is_visible: true,
  allow_ai_matching: true,
  notify_new_applicants: true,
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass = "text-sm font-medium text-slate-700";

const sectionClass =
  "rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

export default function CreateOpportunity() {
  const router = useRouter();

  const [form, setForm] = useState<OpportunityForm>(initialForm);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [today, setToday] = useState("");
  const [opportunityId, setOpportunityId] = useState<string | null>(null);
  const [originalStatus, setOriginalStatus] = useState<string | null>(null);
  const [originalPublishedAt, setOriginalPublishedAt] = useState<string | null>(null);
  const [loadingOpportunity, setLoadingOpportunity] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadSkills = async () => {
      setToday(new Date().toISOString().split("T")[0]);
      setLoadingSkills(true);

      const { data, error } = await supabase
        .from("skill")
        .select("skill_id, skill_name, category")
        .order("category", { ascending: true })
        .order("skill_name", { ascending: true });

      if (error) {
        setErrorMessage(`Unable to load skills: ${error.message}`);
      } else {
        setSkills(data ?? []);
      }

      setLoadingSkills(false);
    };

    loadSkills();
  }, []);

  useEffect(() => {
    const loadExistingOpportunity = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");

      if (!id) return;

      setIsEditing(true);
      setOpportunityId(id);
      setLoadingOpportunity(true);
      setErrorMessage("");

      try {
        const storedSession = localStorage.getItem("skillbridge_user");
        if (!storedSession) throw new Error("Please log in to edit this opportunity.");

        const employer = JSON.parse(storedSession) as EmployerSession;
        if (!employer.user_id || employer.role !== "employer") {
          throw new Error("Invalid employer session.");
        }

        const { data: opportunity, error } = await supabase
          .from("opportunity")
          .select("*")
          .eq("opportunity_id", id)
          .eq("organizer_id", employer.user_id)
          .maybeSingle();

        if (error) throw error;
        if (!opportunity) throw new Error("Opportunity not found or permission denied.");

        setOriginalStatus(opportunity.status);
        setOriginalPublishedAt(opportunity.published_at);

        setForm({
          title: opportunity.title ?? "",
          opportunity_type: opportunity.opportunity_type ?? "",
          department: opportunity.department ?? "",
          field_of_study_target: opportunity.field_of_study_target ?? "",
          arrangement: opportunity.arrangement ?? "",
          location: opportunity.location ?? "",
          open_positions: String(opportunity.open_positions ?? 1),
          compensation_min: opportunity.compensation_min != null ? String(opportunity.compensation_min) : "",
          compensation_max: opportunity.compensation_max != null ? String(opportunity.compensation_max) : "",
          compensation_type: opportunity.compensation_type ?? "",
          application_deadline: opportunity.application_deadline ?? "",
          start_date: opportunity.start_date ?? "",
          end_date: opportunity.end_date ?? "",
          description: opportunity.description ?? "",
          responsibilities: opportunity.responsibilities ?? "",
          qualifications: opportunity.qualifications ?? "",
          is_visible: opportunity.is_visible ?? true,
          allow_ai_matching: opportunity.allow_ai_matching ?? true,
          notify_new_applicants: opportunity.notify_new_applicants ?? true,
        });

        const { data: skillLinks, error: skillError } = await supabase
          .from("opportunity_skill")
          .select("skill_id, required_level")
          .eq("opportunity_id", id);

        if (skillError) throw skillError;

        if (skillLinks && skillLinks.length > 0) {
          const skillIds = skillLinks.map((item) => item.skill_id);
          const { data: skillDetails, error: detailsError } = await supabase
            .from("skill")
            .select("skill_id, skill_name")
            .in("skill_id", skillIds);

          if (detailsError) throw detailsError;

          const selected = skillLinks
            .map((link) => {
              const skill = skillDetails?.find((item) => item.skill_id === link.skill_id);
              if (!skill) return null;
              return {
                skill_id: skill.skill_id,
                skill_name: skill.skill_name,
                required_level: link.required_level,
              };
            })
            .filter((item): item is SelectedSkill => item !== null);

          setSelectedSkills(selected);
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load the opportunity.");
      } finally {
        setLoadingOpportunity(false);
      }
    };

    loadExistingOpportunity();
  }, []);

  function updateField<K extends keyof OpportunityForm>(field: K, value: OpportunityForm[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  const filteredSkills = useMemo(() => {
    const search = skillSearch.trim().toLowerCase();
    if (!search) return skills;
    return skills.filter(
      (skill) =>
        skill.skill_name.toLowerCase().includes(search) ||
        (skill.category ?? "").toLowerCase().includes(search)
    );
  }, [skills, skillSearch]);

  const groupedSkills = useMemo(() => {
    return filteredSkills.reduce<Record<string, Skill[]>>((groups, skill) => {
      const category = skill.category || "Other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(skill);
      return groups;
    }, {});
  }, [filteredSkills]);

  const toggleSkill = (skill: Skill) => {
    setSelectedSkills((previous) => {
      const alreadySelected = previous.some((item) => item.skill_id === skill.skill_id);
      if (alreadySelected) {
        return previous.filter((item) => item.skill_id !== skill.skill_id);
      }
      return [...previous, { skill_id: skill.skill_id, skill_name: skill.skill_name, required_level: 3 }];
    });
  };

  const updateSkillLevel = (skillId: string, level: number) => {
    setSelectedSkills((previous) =>
      previous.map((skill) => (skill.skill_id === skillId ? { ...skill, required_level: level } : skill))
    );
  };

  const validateForm = (isDraft: boolean) => {
    if (!form.title.trim()) return "Please enter an opportunity title.";
    if (!isDraft) {
      if (!form.opportunity_type) return "Please select an opportunity type.";
      if (!form.description.trim()) return "Please enter an opportunity description.";
      if (!form.application_deadline) return "Please select an application deadline.";
      if (form.start_date && form.end_date && form.end_date < form.start_date) {
        return "The end date cannot be earlier than the start date.";
      }
      if (form.compensation_min && form.compensation_max && Number(form.compensation_max) < Number(form.compensation_min)) {
        return "Maximum compensation cannot be lower than minimum compensation.";
      }
      if (!Number.isInteger(Number(form.open_positions)) || Number(form.open_positions) < 1) {
        return "Open positions must be at least 1.";
      }
    }
    return "";
  };

  const handleSubmit = async (isDraft: boolean) => {
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm(isDraft);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    let employer: EmployerSession | null = null;
    try {
      const storedSession = localStorage.getItem("skillbridge_user");
      if (!storedSession) {
        setErrorMessage("Please log in before publishing an opportunity.");
        return;
      }
      employer = JSON.parse(storedSession) as EmployerSession;
    } catch {
      setErrorMessage("Your login session is invalid. Please log in again.");
      return;
    }

    if (!employer.user_id || employer.role !== "employer") {
      setErrorMessage("Only logged-in employers can publish opportunities.");
      return;
    }

    setSubmitting(true);

    try {
      const opportunityPayload = {
        title: form.title.trim(),
        opportunity_type: form.opportunity_type || null,
        department: form.department.trim() || null,
        field_of_study_target: form.field_of_study_target.trim() || null,
        arrangement: form.arrangement || null,
        location: form.location.trim() || null,
        open_positions: Number(form.open_positions) || 1,
        compensation_min: form.compensation_min !== "" ? Number(form.compensation_min) : null,
        compensation_max: form.compensation_max !== "" ? Number(form.compensation_max) : null,
        compensation_type: form.compensation_type || null,
        application_deadline: form.application_deadline || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        description: form.description.trim() || null,
        responsibilities: form.responsibilities.trim() || null,
        qualifications: form.qualifications.trim() || null,
        is_visible: form.is_visible,
        allow_ai_matching: form.allow_ai_matching,
        notify_new_applicants: form.notify_new_applicants,
        organizer_id: employer.user_id,
        status: isEditing
          ? originalStatus === "open" ? "open" : isDraft ? "draft" : "open"
          : isDraft ? "draft" : "open",
        published_at: isEditing
          ? originalStatus === "open" ? originalPublishedAt : isDraft ? null : new Date().toISOString()
          : isDraft ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let savedOpportunityId = opportunityId;

      if (isEditing && opportunityId) {
        const { data, error } = await supabase
          .from("opportunity")
          .update(opportunityPayload)
          .eq("opportunity_id", opportunityId)
          .eq("organizer_id", employer.user_id)
          .select("opportunity_id")
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Opportunity not found or update permission denied.");
        savedOpportunityId = data.opportunity_id;
      } else {
        const { data, error } = await supabase
          .from("opportunity")
          .insert(opportunityPayload)
          .select("opportunity_id")
          .single();

        if (error) throw error;
        savedOpportunityId = data.opportunity_id;
      }

      if (!savedOpportunityId) throw new Error("Unable to retrieve the opportunity ID.");

      if (isEditing) {
        const { error: deleteSkillsError } = await supabase
          .from("opportunity_skill")
          .delete()
          .eq("opportunity_id", savedOpportunityId);

        if (deleteSkillsError) throw deleteSkillsError;
      }

      if (selectedSkills.length > 0) {
        const skillPayload = selectedSkills.map((skill) => ({
          opportunity_id: savedOpportunityId,
          skill_id: skill.skill_id,
          required_level: skill.required_level,
        }));

        const { error: skillError } = await supabase
          .from("opportunity_skill")
          .insert(skillPayload);

        if (skillError) throw skillError;
      }

      setSuccessMessage(isDraft ? "Opportunity saved as a draft." : "Opportunity published successfully.");
      router.push("/employer/opportunities");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong while saving the opportunity.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Employer / Opportunities / Create</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {isEditing ? "Edit Opportunity" : "Publish an Opportunity"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEditing ? "Update the details and requirements of your opportunity." : "Create an opportunity for students to discover and apply."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/employer/opportunities")}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {errorMessage && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        {/* Main form */}
        <div className="space-y-6 xl:col-span-2">
          <section className={sectionClass}>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">1. Opportunity Details</h2>
              <p className="mt-1 text-sm text-slate-500">Provide the basic information about this opportunity.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Opportunity Title *</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Frontend Developer Intern"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Opportunity Type *</label>
                  <select
                    className={inputClass}
                    value={form.opportunity_type}
                    onChange={(e) => updateField("opportunity_type", e.target.value)}
                  >
                    <option value="">Select type</option>
                    <option value="internship">Internship</option>
                    <option value="graduate_role">Graduate Role</option>
                    <option value="micro_internship">Micro-internship</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="recruitment_drive">Recruitment Drive</option>
                    <option value="networking_event">Networking Event</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Department</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Information Technology"
                    value={form.department}
                    onChange={(e) => updateField("department", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Target Field of Study</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Software Engineering, Computer Science"
                  value={form.field_of_study_target}
                  onChange={(e) => updateField("field_of_study_target", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Work Arrangement</label>
                  <select
                    className={inputClass}
                    value={form.arrangement}
                    onChange={(e) => updateField("arrangement", e.target.value)}
                  >
                    <option value="">Select arrangement</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Kuala Lumpur"
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Open Positions</label>
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  value={form.open_positions}
                  onChange={(e) => updateField("open_positions", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">2. Description & Requirements</h2>
              <p className="mt-1 text-sm text-slate-500">Explain the opportunity and what applicants are expected to do.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Opportunity Description *</label>
                <textarea
                  rows={5}
                  className={inputClass}
                  placeholder="Describe the opportunity, its objectives and what students can expect..."
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Responsibilities</label>
                <textarea
                  rows={4}
                  className={inputClass}
                  placeholder="List the main responsibilities..."
                  value={form.responsibilities}
                  onChange={(e) => updateField("responsibilities", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Qualifications</label>
                <textarea
                  rows={4}
                  className={inputClass}
                  placeholder="Describe the qualifications or requirements..."
                  value={form.qualifications}
                  onChange={(e) => updateField("qualifications", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">3. Compensation & Schedule</h2>
              <p className="mt-1 text-sm text-slate-500">Set the compensation and important dates.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Compensation Type</label>
                <select
                  className={inputClass}
                  value={form.compensation_type}
                  onChange={(e) => updateField("compensation_type", e.target.value)}
                >
                  <option value="">Not specified</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="allowance">Allowance</option>
                  <option value="fixed">Fixed Compensation</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Minimum Compensation (RM)</label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    placeholder="e.g. 800"
                    value={form.compensation_min}
                    onChange={(e) => updateField("compensation_min", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Maximum Compensation (RM)</label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    placeholder="e.g. 1200"
                    value={form.compensation_max}
                    onChange={(e) => updateField("compensation_max", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Application Deadline *</label>
                  <input
                    type="date"
                    className={inputClass}
                    min={today || undefined}
                    value={form.application_deadline}
                    onChange={(e) => updateField("application_deadline", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Start Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.start_date}
                    onChange={(e) => updateField("start_date", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>End Date</label>
                <input
                  type="date"
                  className={inputClass}
                  min={form.start_date || undefined}
                  value={form.end_date}
                  onChange={(e) => updateField("end_date", e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <section className={sectionClass}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">4. Required Skills</h2>
              <p className="mt-1 text-sm text-slate-500">Select the skills required for this opportunity.</p>
            </div>

            <input
              className={inputClass}
              placeholder="Search skills..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
            />

            {loadingSkills ? (
              <p className="py-5 text-sm text-slate-500">Loading skills...</p>
            ) : (
              <div className="mt-4 max-h-80 space-y-4 overflow-y-auto pr-1">
                {Object.entries(groupedSkills).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {items.map((skill) => {
                        const selected = selectedSkills.some((item) => item.skill_id === skill.skill_id);
                        return (
                          <label
                            key={skill.skill_id}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleSkill(skill)}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-slate-700">{skill.skill_name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {filteredSkills.length === 0 && (
                  <p className="py-4 text-sm text-slate-500">No matching skills found.</p>
                )}
              </div>
            )}

            <div className="mt-5 border-t border-slate-200 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Selected Skills</h3>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {selectedSkills.length} selected
                </span>
              </div>

              {selectedSkills.length === 0 ? (
                <p className="text-sm text-slate-500">No skills selected yet.</p>
              ) : (
                <div className="space-y-3">
                  {selectedSkills.map((skill) => (
                    <div key={skill.skill_id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-800">{skill.skill_name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSkills((previous) => previous.filter((item) => item.skill_id !== skill.skill_id))
                          }
                          className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <label className="mt-3 block text-xs text-slate-500">Required proficiency level</label>
                      <select
                        className={inputClass}
                        value={skill.required_level}
                        onChange={(e) => updateSkillLevel(skill.skill_id, Number(e.target.value))}
                      >
                        <option value={1}>1 - Beginner</option>
                        <option value={2}>2 - Basic</option>
                        <option value={3}>3 - Intermediate</option>
                        <option value={4}>4 - Advanced</option>
                        <option value={5}>5 - Expert</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className={sectionClass}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">5. Visibility & Publishing</h2>
              <p className="mt-1 text-sm text-slate-500">Configure how your opportunity is managed.</p>
            </div>

            <div className="space-y-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.is_visible}
                  onChange={(e) => updateField("is_visible", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-800">Visible to students</span>
                  <span className="text-xs text-slate-500">Allow students to see this listing.</span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.allow_ai_matching}
                  onChange={(e) => updateField("allow_ai_matching", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-800">Allow AI matching</span>
                  <span className="text-xs text-slate-500">Allow the system to match students with this opportunity.</span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.notify_new_applicants}
                  onChange={(e) => updateField("notify_new_applicants", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-800">Notify about new applicants</span>
                  <span className="text-xs text-slate-500">Enable notifications when students apply.</span>
                </span>
              </label>
            </div>
          </section>

          {/* Preview Section */}
<section className={sectionClass}>
  <h2 className="text-lg font-semibold text-slate-900">Listing Preview</h2>
  <p className="mt-1 text-sm text-slate-500">Preview the full student detail view before saving.</p>

  <button
    type="button"
    onClick={() => setShowPreview(true)}
    className="mt-4 w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 cursor-pointer"
  >
    Preview Full Detail Page
  </button>

  {showPreview && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-slate-50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b bg-white px-6 py-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">Student Detail View Preview</h3>
            <p className="text-xs text-slate-500">Live preview using current form values</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            ✕ Close Preview
          </button>
        </div>

        {/* Scrollable Preview Body (Exact replica of OpportunityDetailPage) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="mx-auto max-w-6xl space-y-6 pb-12">
            
            {/* Back Link Mock */}
            <span className="inline-block text-sm font-medium text-blue-600">
              ← Back to Opportunity Hub
            </span>

            {/* Header Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600">
                    {form.title ? form.title.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{form.title || "Untitled Opportunity"}</h1>
                    <p className="text-sm text-gray-500">Your Company Name</p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm opacity-90 cursor-not-allowed"
                >
                  Apply Now
                </button>
              </div>

              {/* Quick Badges */}
              <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-6 text-xs text-gray-600">
                <span className="rounded-md bg-gray-100 px-3 py-1 font-medium">📍 {form.location || "Remote"}</span>
                <span className="rounded-md bg-gray-100 px-3 py-1 font-medium">💼 {form.arrangement ? form.arrangement.charAt(0).toUpperCase() + form.arrangement.slice(1) : "Unspecified"}</span>
                <span className="rounded-md bg-gray-100 px-3 py-1 font-medium">🏷️ {form.opportunity_type ? form.opportunity_type.replaceAll("_", " ") : "General"}</span>
                {form.department && (
                  <span className="rounded-md bg-gray-100 px-3 py-1 font-medium">🏢 {form.department}</span>
                )}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">About the Opportunity</h2>
                  <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {form.description || "No description provided."}
                  </p>
                </section>

                {form.responsibilities && (
                  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Key Responsibilities</h2>
                    <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {form.responsibilities}
                    </p>
                  </section>
                )}

                {form.qualifications && (
                  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Qualifications & Requirements</h2>
                    <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {form.qualifications}
                    </p>
                  </section>
                )}

                {selectedSkills.length > 0 && (
                  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Required Skills</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedSkills.map((skill) => (
                        <span key={skill.skill_id} className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {skill.skill_name}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Key Details</h3>

                  <div>
                    <p className="text-xs text-gray-400">Application Deadline</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{form.application_deadline || "Not specified"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Timeline</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {form.start_date || "Start"} → {form.end_date || "End"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Compensation</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {form.compensation_min !== "" && form.compensation_max !== ""
                        ? `MYR ${form.compensation_min} - ${form.compensation_max} (${form.compensation_type || "Monthly"})`
                        : "Unspecified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Open Positions</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{form.open_positions || 1} slot(s)</p>
                  </div>
                </div>
              </aside>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t bg-white px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  )}
</section>

/* 
  [Ponytail Log: Replaced card preview with a full-page detail view modal replicating the exact student opportunity detail layout using live form state.]
*/


          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Saving..." : isEditing && originalStatus === "open" ? "Save Changes" : "Publish Opportunity"}
            </button>

            <button
              type="button"
              disabled={submitting || (isEditing && originalStatus === "open")}
              onClick={() => handleSubmit(true)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Saving..." : isEditing && originalStatus === "open" ? "Published Listing" : "Save as Draft"}
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              Publishing makes this opportunity available according to your visibility settings.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

/* 
  [Ponytail Log: Preserved full editing and creation form workflows, skill association synchronization, and status handling with zero added bloat.]
*/