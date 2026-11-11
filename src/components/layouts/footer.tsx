
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex min-h-[64px] shrink-0 items-center justify-between border-t border-border bg-background px-8">

      {/* Copyright */}
      <p className="text-xs text-muted">
        © 2026 SkillBridge AI · Your next step, made clearer.
      </p>

      {/* Footer links */}
      <div className="flex items-center gap-6">
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
