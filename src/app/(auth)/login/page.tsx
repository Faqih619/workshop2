
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } = await supabase
        .from("users")
        .select("user_id, email, role")
        .eq("email", email.trim().toLowerCase())
        .eq("password_hash", password)
        .maybeSingle();

      if (loginError) {
        throw loginError;
      }

      if (!data) {
        setError("Invalid email or password.");
        return;
      }

      if (data.role !== "student" && data.role !== "employer") {
        setError("Invalid user role. Please contact the administrator.");
        return;
      }

      // Store the logged-in user information.
      localStorage.setItem(
        "skillbridge_user",
        JSON.stringify({
          user_id: data.user_id,
          email: data.email,
          role: data.role,
        })
      );

      // Redirect according to user role.
      if (data.role === "employer") {
        router.push("/employer/dashboard");
      } else {
        router.push("/student/dashboard");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">

        {/* BRAND */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-slate-900">
            SkillBridge <span className="text-blue-600">AI</span>
          </Link>

          <p className="mt-3 text-sm text-slate-500">
            Sign in to continue to your workspace.
          </p>
        </div>

        {/* LOGIN CARD */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <h1 className="text-xl font-semibold text-slate-900">
            Welcome back
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Enter your email and password to sign in.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-5">

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 pr-16 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 text-xs font-medium text-slate-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          {/* REGISTER */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create an account
            </Link>
          </p>

        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          SkillBridge AI · Bridge Your Skills. Build Your Future.
        </p>

      </div>
    </main>
  );
}
