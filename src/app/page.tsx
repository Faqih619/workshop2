
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
    <nav className="px-8 py-6">
      <h1 className="text-2xl font-bold">
        SkillBridge AI
      </h1>
    </nav>


      <section className="flex min-h-[75vh] flex-col
        items-center justify-center px-6 text-center">

        <p className="mb-4 rounded-full bg-blue-500/10
          px-4 py-2 text-sm text-blue-400">
          Your Career Journey Starts Here
        </p>

        <h2 className="text-4xl font-bold tracking-tight
          sm:text-6xl">
          Welcome to SkillBridge AI
        </h2>

        <h3 className="mt-5 text-xl font-semibold
          text-blue-400 sm:text-2xl">
          Bridge Your Skills. Build Your Future.
        </h3>

        <p className="mt-6 max-w-2xl text-base
          leading-7 text-slate-400">
          Discover opportunities, identify your skill gaps,
          and develop the experience you need to achieve
          your career goals.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-3
            font-semibold hover:bg-blue-700"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-slate-600
            px-6 py-3 font-semibold hover:bg-slate-800"
          >
            Login
          </Link>
        </div>
      </section>

      <footer className="py-6 text-center text-sm
        text-slate-500">
        SkillBridge AI — Empowering students to reach
        their potential.
      </footer>
    </main>
  );
}
