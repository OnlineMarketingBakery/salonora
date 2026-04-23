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
          ? "border-[#0c1d3a] bg-[#0c1d3a] text-white shadow-lg"
          : "border-sky-100/80 bg-white/90 shadow-sm shadow-sky-100/50"
      } ${className}`}
    >
      {children}
    </div>
  );
}
