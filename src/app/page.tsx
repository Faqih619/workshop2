
import AppShell from "@/components/layouts/appshell";

export default function Home() {
  return (
    <AppShell role="student">
      <h1 className="text-2xl font-semibold">
        Welcome to SkillBridge AI
      </h1>

      <p className="mt-2 text-sm text-muted">
        Your student career development platform.
      </p>
    </AppShell>
  );
}
