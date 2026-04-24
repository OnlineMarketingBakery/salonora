import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  highlight = false,
}: {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight
          ? "border-navy-deep bg-navy-deep text-white shadow-lg"
          : "border-surface bg-white/90 shadow-sm shadow-brand/10"
      } ${className}`}
    >
      {children}
    </div>
  );
}
