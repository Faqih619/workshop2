CREATE TABLE "public"."ai_analysis" (
  "ai_analysis_id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "compatibility_score"       numeric(5,2),
  "missing_skills"            jsonb                    DEFAULT '[]'::jsonb,
  "recommended_learning_path" jsonb                    DEFAULT '[]'::jsonb,
  "generated_at"              timestamp with time zone NOT NULL DEFAULT now(),
  "opportunity_id"            uuid                     NOT NULL,
  "student_id"                uuid                     NOT NULL,
  CONSTRAINT "ai_analysis_pkey" PRIMARY KEY (ai_analysis_id)
);

ALTER TABLE "public"."ai_analysis"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."application" (
  "application_id" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "status"         text                     DEFAULT 'submitted'::text,
  "applied_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "opportunity_id" uuid                     NOT NULL,
  "student_id"     uuid                     NOT NULL,
  CONSTRAINT "application_opportunity_id_student_id_key" UNIQUE (opportunity_id, student_id),
  CONSTRAINT "application_pkey" PRIMARY KEY (application_id)
);

ALTER TABLE "public"."application"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."deliverable" (
  "deliverable_id"    uuid    NOT NULL DEFAULT gen_random_uuid(),
  "file_url"          text,
  "submission_status" text    DEFAULT 'pending'::text,
  "rating"            integer,
  "employer_feedback" text,
  "verified_flag"     boolean DEFAULT false,
  "milestone_id"      uuid    NOT NULL,
  "application_id"    uuid    NOT NULL,
  CONSTRAINT "deliverable_pkey" PRIMARY KEY (deliverable_id),
  CONSTRAINT "deliverable_rating_check" CHECK (((rating >= 1) AND (rating <= 5)))
);

ALTER TABLE "public"."deliverable"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."milestone" (
  "milestone_id"   uuid NOT NULL DEFAULT gen_random_uuid(),
  "title"          text NOT NULL,
  "description"    text,
  "due_date"       date,
  "opportunity_id" uuid NOT NULL,
  CONSTRAINT "milestone_pkey" PRIMARY KEY (milestone_id)
);

ALTER TABLE "public"."milestone"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."opportunity" (
  "opportunity_id"        uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "title"                 text                     NOT NULL,
  "opportunity_type"      text,
  "duration_hours"        integer,
  "description"           text,
  "required_skills"       text[],
  "field_of_study_target" text,
  "status"                text                     DEFAULT 'open'::text,
  "created_at"            timestamp with time zone NOT NULL DEFAULT now(),
  "organizer_id"          uuid                     NOT NULL,
  "application_deadline"  date,
  CONSTRAINT "opportunity_pkey" PRIMARY KEY (opportunity_id)
);

ALTER TABLE "public"."opportunity"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profile" (
  "profile_id"    uuid NOT NULL DEFAULT gen_random_uuid(),
  "full_name"     text,
  "university"    text,
  "matric_no"     text,
  "faculty"       text,
  "company_name"  text,
  "staff_no"      text,
  "bio_summary"   text,
  "academic_year" text,
  "user_id"       uuid NOT NULL,
  CONSTRAINT "profile_pkey" PRIMARY KEY (profile_id),
  CONSTRAINT "profile_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "public"."profile"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."resume" (
  "resume_id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "generated_summary"      text,
  "compiled_verified_data" jsonb                    DEFAULT '[]'::jsonb,
  "file_url"               text,
  "last_generated"         timestamp with time zone NOT NULL DEFAULT now(),
  "student_id"             uuid                     NOT NULL,
  CONSTRAINT "resume_pkey" PRIMARY KEY (resume_id),
  CONSTRAINT "resume_student_id_key" UNIQUE (student_id)
);

ALTER TABLE "public"."resume"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."skill" (
  "skill_id"   uuid NOT NULL DEFAULT gen_random_uuid(),
  "skill_name" text NOT NULL,
  "category"   text,
  CONSTRAINT "skill_pkey" PRIMARY KEY (skill_id),
  CONSTRAINT "skill_skill_name_key" UNIQUE (skill_name)
);

ALTER TABLE "public"."skill"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."user_skill" (
  "user_id"           uuid NOT NULL,
  "skill_id"          uuid NOT NULL,
  "proficiency_level" text,
  CONSTRAINT "user_skill_pkey" PRIMARY KEY (user_id, skill_id)
);

ALTER TABLE "public"."user_skill"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."users" (
  "user_id"       uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "email"         text                     NOT NULL,
  "password_hash" text,
  "role"          text,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "users_email_key" UNIQUE (email),
  CONSTRAINT "users_pkey" PRIMARY KEY (user_id)
);

ALTER TABLE "public"."users"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."deliverable"
  ADD CONSTRAINT "deliverable_application_id_fkey" FOREIGN KEY (application_id) REFERENCES public.application(application_id) ON DELETE CASCADE;

ALTER TABLE "public"."deliverable"
  ADD CONSTRAINT "deliverable_milestone_id_fkey" FOREIGN KEY (milestone_id) REFERENCES public.milestone(milestone_id) ON DELETE CASCADE;

ALTER TABLE "public"."ai_analysis"
  ADD CONSTRAINT "ai_analysis_opportunity_id_fkey" FOREIGN KEY (opportunity_id) REFERENCES public.opportunity(opportunity_id) ON DELETE CASCADE;

ALTER TABLE "public"."application"
  ADD CONSTRAINT "application_opportunity_id_fkey" FOREIGN KEY (opportunity_id) REFERENCES public.opportunity(opportunity_id) ON DELETE CASCADE;

ALTER TABLE "public"."milestone"
  ADD CONSTRAINT "milestone_opportunity_id_fkey" FOREIGN KEY (opportunity_id) REFERENCES public.opportunity(opportunity_id) ON DELETE CASCADE;

ALTER TABLE "public"."user_skill"
  ADD CONSTRAINT "user_skill_skill_id_fkey" FOREIGN KEY (skill_id) REFERENCES public.skill(skill_id) ON DELETE CASCADE;

ALTER TABLE "public"."ai_analysis"
  ADD CONSTRAINT "ai_analysis_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE "public"."application"
  ADD CONSTRAINT "application_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE "public"."opportunity"
  ADD CONSTRAINT "opportunity_organizer_id_fkey" FOREIGN KEY (organizer_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE "public"."profile"
  ADD CONSTRAINT "profile_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE "public"."resume"
  ADD CONSTRAINT "resume_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

ALTER TABLE "public"."user_skill"
  ADD CONSTRAINT "user_skill_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ai_analysis" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."ai_analysis" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ai_analysis" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ai_analysis" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."application" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."application" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."application" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."application" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."deliverable" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."deliverable" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."deliverable" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."deliverable" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."milestone" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."milestone" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."milestone" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."milestone" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."opportunity" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."opportunity" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."opportunity" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."opportunity" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profile" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."profile" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profile" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profile" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."resume" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."resume" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."resume" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."resume" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."skill" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."skill" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."skill" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."skill" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_skill" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."user_skill" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_skill" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_skill" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."users" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "service_role";

