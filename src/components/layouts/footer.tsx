
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-8 flex min-h-[64px] shrink-0 flex-col items-start justify-center gap-3 border-t border-border py-4 sm:flex-row sm:items-center sm:justify-between">

      {/* Copyright */}
      <p className="text-xs text-muted">
        © 2026 SkillBridge AI · Your next step, made clearer.
      </p>

      {/* Footer links */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <Link
          href="/privacy"
          className="text-xs text-muted transition-colors hover:text-primary"
        >
          Privacy policy
        </Link>

        <Link
          href="/terms"
          className="text-xs text-muted transition-colors hover:text-primary"
        >
          Terms of service
        </Link>
      </div>

    </footer>
  );
}
