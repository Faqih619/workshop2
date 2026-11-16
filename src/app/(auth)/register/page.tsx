
"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import {
  Layers3,
  GraduationCap,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Role = "student" | "employer";

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("student");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [university, setUniversity] = useState(
    "Universiti Teknikal Malaysia Melaka (UTeM)"
  );

  const [otherUniversity, setOtherUniversity] = useState("");
  const [matricNo, setMatricNo] = useState("");
  const [faculty, setFaculty] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [staffNo, setStaffNo] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setMessage(
        "Password must have at least 8 characters, one uppercase letter and one number."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!accepted) {
      setMessage("Please accept the Terms and Privacy Policy.");
      return;
    }

    if (
      role === "student" &&
      university === "Other" &&
      !otherUniversity.trim()
    ) {
      setMessage("Please enter your university name.");
      return;
    }

    setLoading(true);

    try {
      const fullName =
        `${firstName.trim()} ${lastName.trim()}`.trim();

      const selectedUniversity =
        university === "Other"
          ? otherUniversity.trim()
          : university;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,

        options: {
          emailRedirectTo: `${window.location.origin}/login`,

          data: {
            role,
            full_name: fullName,

            university:
              role === "student" ? selectedUniversity : null,

            matric_no:
              role === "student" ? matricNo.trim() : null,

            faculty:
              role === "student" ? faculty.trim() : null,

            company_name:
              role === "employer" ? companyName.trim() : null,

            staff_no:
              role === "employer" ? staffNo.trim() : null,
          },
        },
      });

      if (error) throw error;

      setSuccess(true);

      if (data.session) {
        setMessage(
          "Account created successfully! You can now sign in."
        );
      } else {
        setMessage(
          "Registration successful! Please check your email to verify your account."
        );
      }
    } catch (err: unknown) {
      setSuccess(false);

      setMessage(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white md:grid md:grid-cols-[41%_59%]">

      {/* LEFT BRAND PANEL */}
      <section className="hidden min-h-screen flex-col justify-between bg-[#1e293b] p-12 text-white md:flex lg:p-16">

        <div>
          {/* SKILLBRIDGE AI LOGO */}
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
              <Layers3 className="h-7 w-7 text-white" strokeWidth={2.2} />
            </div>

            <span className="text-2xl font-medium tracking-tight">
              SkillBridge
              <span className="ml-1 text-blue-400">AI</span>
            </span>
          </Link>

          <div className="mt-16">
            <span className="rounded-md bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600">
              YOUR CAREER, CONNECTED
            </span>

            <h1 className="mt-8 text-4xl font-bold leading-tight lg:text-5xl">
              The right skills.
              <br />
              The right opportunity.
            </h1>

            <p className="mt-7 max-w-lg text-base leading-7 text-slate-300">
              Turn your potential into a clear path forward.
              Discover opportunities, close skill gaps, and
              build a career that fits you.
            </p>

            {/* CAREER CARD */}
            <div className="mt-14 rounded-xl bg-[#293a52] p-6 lg:p-7">
              <div className="mb-7 flex items-center justify-between">
                <h2 className="font-semibold">
                  Your career, in focus
                </h2>

                <span className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                  Personalized
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex gap-5">
                  <span className="font-semibold text-blue-300">01</span>
                  <div>
                    <p className="font-medium">Discover your strengths</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Map your skills to real-world roles.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <span className="font-semibold text-blue-300">02</span>
                  <div>
                    <p className="font-medium">Build what comes next</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Follow a focused learning roadmap.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <span className="font-semibold text-blue-300">03</span>
                  <div>
                    <p className="font-medium">Connect with opportunity</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Apply with clarity and confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* STATISTICS */}
            <div className="mt-12 flex gap-12">
              <div>
                <h2 className="text-3xl font-bold">12,000+</h2>
                <p className="mt-1 text-sm text-slate-300">
                  students moving forward
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold">350+</h2>
                <p className="mt-1 text-sm text-slate-300">
                  employer partners
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Built for students. Trusted by employers.
        </p>
      </section>

      {/* RIGHT REGISTER PANEL */}
      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-12 lg:px-20">
        <div className="w-full max-w-2xl">

          {/* MOBILE LOGO */}
          <div className="mb-8 md:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <Layers3 className="h-6 w-6 text-white" strokeWidth={2.2} />
              </div>

              <span className="text-xl font-medium tracking-tight text-slate-900">
                SkillBridge
                <span className="ml-1 text-blue-600">AI</span>
              </span>
            </Link>
          </div>

          <div className="mb-10 text-right text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign in
              <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </div>

          <h1 className="text-3xl font-medium text-slate-800">
            Create your account
          </h1>

          <p className="mb-8 mt-3 text-sm text-slate-500">
            A clearer career path starts here.
          </p>

          <form onSubmit={handleRegister} className="space-y-5">

            {/* ROLE SELECTION */}
            <div>
              <label className="mb-3 block text-xs font-semibold text-slate-800">
                I'm joining as a
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                    role === "student"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <GraduationCap className="h-6 w-6 shrink-0" />

                  <span>
                    <strong className="block text-sm">Student</strong>
                    <span className="mt-1 block text-xs text-slate-500">
                      Discover & grow
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("employer")}
                  className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                    role === "employer"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Building2 className="h-6 w-6 shrink-0" />

                  <span>
                    <strong className="block text-sm">Employer</strong>
                    <span className="mt-1 block text-xs text-slate-500">
                      Find your next hire
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* FIRST AND LAST NAME */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-xs font-semibold text-slate-800"
                >
                  First name
                </label>

                <input
                  id="firstName"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  autoComplete="given-name"
                  className="w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-xs font-semibold text-slate-800"
                >
                  Last name
                </label>

                <input
                  id="lastName"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  autoComplete="family-name"
                  className="w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold text-slate-800"
              >
                {role === "student" ? "University email" : "Work email"}
              </label>

              <input
                id="email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* STUDENT DETAILS */}
            {role === "student" && (
              <>
                <div>
                  <label
                    htmlFor="university"
                    className="mb-2 block text-xs font-semibold text-slate-800"
                  >
                    University
                  </label>

                  <select
                    id="university"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Universiti Teknikal Malaysia Melaka (UTeM)">
                      Universiti Teknikal Malaysia Melaka (UTeM)
                    </option>

                    <option value="Universiti Malaya (UM)">
                      Universiti Malaya (UM)
                    </option>

                    <option value="Universiti Teknologi Malaysia (UTM)">
                      Universiti Teknologi Malaysia (UTM)
                    </option>

                    <option value="Other">Other</option>
                  </select>
                </div>

                {university === "Other" && (
                  <div>
                    <label
                      htmlFor="otherUniversity"
                      className="mb-2 block text-xs font-semibold text-slate-800"
                    >
                      Enter university name
                    </label>

                    <input
                      id="otherUniversity"
                      required
                      value={otherUniversity}
                      onChange={(e) => setOtherUniversity(e.target.value)}
                      placeholder="Your university"
                      className="w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}

                {/* MATRIC AND FACULTY */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="matricNo"
                      className="mb-2 block text-xs font-semibold text-slate-800"
                    >
                      Matric number
                    </label>

                    <input
                      id="matricNo"
                      required
                      value={matricNo}
                      onChange={(e) => setMatricNo(e.target.value)}
                      placeholder="e.g. B032410001"
                      className="w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="faculty"
                      className="mb-2 block text-xs font-semibold text-slate-800"
                    >
                      Faculty
                    </label>

                    <input
                      id="faculty"
                      required
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      placeholder="Your faculty"
                      className="w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </>
            )}

            {/* EMPLOYER DETAILS */}
            {role === "employer" && (
              <>
                <div>
                  <label
                    htmlFor="companyName"
                    className="mb-2 block text-xs font-semibold text-slate-800"
                  >
                    Company name
                  </label>

                  <input
                    id="companyName"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name"
                    className="w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="staffNo"
                    className="mb-2 block text-xs font-semibold text-slate-800"
                  >
                    Staff number
                  </label>

                  <input
                    id="staffNo"
                    required
                    value={staffNo}
                    onChange={(e) => setStaffNo(e.target.value)}
                    placeholder="Your staff number"
                    className="w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </>
            )}

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold text-slate-800"
              >
                Password
              </label>

              <div className="flex rounded-md border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  id="password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className="w-full rounded-md p-3 text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="px-3 text-slate-500 hover:text-blue-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                At least 8 characters, one number and one uppercase letter.
              </p>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-xs font-semibold text-slate-800"
              >
                Confirm password
              </label>

              <div className="flex rounded-md border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  id="confirmPassword"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="w-full rounded-md p-3 text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="px-3 text-slate-500 hover:text-blue-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* TERMS AND PRIVACY */}
            <label className="flex items-start gap-2 text-xs leading-5 text-slate-500">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 accent-blue-600"
              />

              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Privacy Policy
                </Link>.
              </span>
            </label>

            {/* SUCCESS OR ERROR MESSAGE */}
            {message && (
              <div
                role={success ? "status" : "alert"}
                className={`rounded-md border p-3 text-sm ${
                  success
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* CREATE ACCOUNT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* FOOTER */}
          <footer className="mt-10 flex justify-between text-xs text-slate-400">
            <span>© {currentYear ?? ""} SkillBridge AI</span>
            <span>Privacy · Terms · Help</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
