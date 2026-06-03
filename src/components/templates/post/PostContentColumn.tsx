import type { ReactNode } from "react";

/** Figma 1643:54 — TOC column 307px + 24px gap + main column max 969px. */
export const POST_TOC_COLUMN_CLASS = "minmax(0,19.1875rem)";
export const POST_MAIN_MAX_CLASS = "min-w-0 lg:max-w-[60.5625rem]";

export function PostTwoColumnGrid({
  aside,
  children,
  className = "",
}: {
  aside: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-10 lg:grid-cols-[minmax(0,19.1875rem)_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-0 ${className}`}
    >
      <div className={`min-w-0 lg:col-start-2 lg:row-start-1 ${POST_MAIN_MAX_CLASS}`}>{children}</div>
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">{aside}</div>
    </div>
  );
}

/** Aligns tail blocks (conclusion) with the main article column beside the TOC. */
export function PostTailMainColumn({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`grid gap-10 lg:grid-cols-[minmax(0,19.1875rem)_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-0 ${className}`}
    >
      <div className="hidden min-w-0 lg:block" aria-hidden />
      <div className={POST_MAIN_MAX_CLASS}>{children}</div>
    </div>
  );
}
