import type { ReactNode } from "react";

type Props = {
  className?: string;
  children?: ReactNode;
  borderClassName?: string;
  /** For dark pill: white border; for brand pill: white/20 */
  variant?: "on-dark" | "on-brand" | "on-light";
};

export function ArrowInCircle({ className = "", children, borderClassName, variant = "on-dark" }: Props) {
  const ring =
    borderClassName ||
    (variant === "on-brand" ? "border border-white/25" : variant === "on-light" ? "border border-brand/30" : "border border-white/80");
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${ring} ${className}`}
      aria-hidden
    >
      {children ?? (
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" className="text-current">
          <path
            d="M2 7h9M8 3l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
