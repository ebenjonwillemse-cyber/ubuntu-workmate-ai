import { cn } from "@/lib/utils";

/** Brand mark: a briefcase whose handle doubles as a checkmark — "work, done". */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elevated",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
        <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
        <path d="m8.5 13.5 2.5 2.5 4.5-4.5" />
      </svg>
    </span>
  );
}
