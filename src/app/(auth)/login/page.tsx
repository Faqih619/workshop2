
"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Layers3,
  GraduationCap,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Role = "student" | "employer";

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (loginError) throw loginError;

      const userRole = data.user.user_metadata?.role;

      if (userRole !== "student" && userRole !== "employer") {
        await supabase.auth.signOut();
        throw new Error("Invalid account role. Please contact support.");
      }

      if (userRole !== role) {
        await supabase.auth.signOut();
        throw new Error(
          `This account is registered as ${userRole}. Please select ${userRole}.`
        );
      }

      localStorage.setItem(
        "skillbridge_user",
        JSON.stringify({
          user_id: data.user.id,
          email: data.user.email,
          role: userRole,
        })
      );

      router.push(
        userRole === "employer"
          ? "/employer/dashboard"
          : "/student/dashboard"
      );

      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
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

      {/* RIGHT LOGIN PANEL */}
      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-12 lg:px-20">
        <div className="w-full max-w-2xl">

          {/* MOBILE LOGO */}
          <div className="mb-10 md:hidden">
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

          <div className="mb-16 text-right text-sm text-slate-500">
            New to SkillBridge?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:underline"
            >
              Create an account
              <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </div>

          <h1 className="text-3xl font-medium text-slate-800">
            Welcome back
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Sign in to take the next step in your career.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">

            {/* ROLE SELECTION */}
            <div>
              <label className="mb-3 block text-xs font-semibold text-slate-800">
                Sign in as
              </label>

              <div className="grid grid-cols-2 rounded-lg bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex items-center justify-center gap-2 rounded-md border p-3 text-sm transition ${
                    role === "student"
                      ? "border-blue-200 bg-white font-semibold text-blue-600 shadow-sm"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <GraduationCap className="h-5 w-5" />
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => setRole("employer")}
                  className={`flex items-center justify-center gap-2 rounded-md border p-3 text-sm transition ${
                    role === "employer"
                      ? "border-blue-200 bg-white font-semibold text-blue-600 shadow-sm"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Building2 className="h-5 w-5" />
                  Employer
                </button>
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
                className="w-full rounded-md border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-2 flex justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-800"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="flex rounded-md border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  id="password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
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
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* SIGN IN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* SECURITY INFORMATION */}
          <div className="my-8 flex items-center gap-4 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            Secure access
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex items-start justify-center gap-2 text-center text-xs leading-5 text-slate-500">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <p>
              Secure access with your university or employer account.
              <br />
              Your profile is only shared when you choose to apply.
            </p>
          </div>

          {/* FOOTER */}
          <footer className="mt-16 flex justify-between text-xs text-slate-400">
            <span>© {currentYear ?? ""} SkillBridge AI</span>
            <span>Privacy · Terms · Help</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
