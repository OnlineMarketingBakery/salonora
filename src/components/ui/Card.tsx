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
      className={`rounded-[20px] border p-6 ${
        highlight
          ? "border-navy-deep bg-navy-deep text-white shadow-lg"
          : "border-surface/80 bg-white shadow-[0_2px_24px_-4px_rgba(21,41,81,0.08),0_4px_12px_-2px_rgba(57,144,240,0.08)]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
