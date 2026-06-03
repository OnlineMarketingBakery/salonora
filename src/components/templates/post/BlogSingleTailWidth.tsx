import type { ReactNode } from "react";

/** Figma 1643:54 — FAQ / conclusion / related share a 1156px content band. */
export function BlogSingleTailWidth({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[72.25rem] ${className}`}>{children}</div>;
}
