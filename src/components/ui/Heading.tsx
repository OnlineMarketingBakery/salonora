import type { ReactNode } from "react";

type Level = 1 | 2 | 3 | 4;

const sizes: Record<Level, string> = {
  1: "text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground",
  2: "text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground",
  3: "text-xl sm:text-2xl font-semibold text-foreground",
  4: "text-lg font-semibold text-foreground",
};

export function Heading({
  as: Tag = "h2",
  level = 2,
  className = "",
  children,
}: {
  as?: "h1" | "h2" | "h3" | "h4";
  level?: Level;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={`${sizes[level]} ${className}`}>{children}</Tag>;
}
