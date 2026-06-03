import type { ReactNode } from "react";

/** Figma 1643:54 — TOC 307px + 43px gap + main max 968px. */
export const POST_TOC_COLUMN_CLASS = "minmax(0,19.1875rem)";
export const POST_MAIN_MAX_CLASS = "min-w-0 lg:max-w-[60.5rem]";

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
      className={`grid items-start gap-10 lg:grid-cols-[19.1875rem_minmax(0,60.5rem)] lg:gap-x-[2.6875rem] lg:gap-y-0 ${className}`}
    >
      <div className={`relative z-[1] min-w-0 w-full lg:col-start-2 lg:row-start-1 ${POST_MAIN_MAX_CLASS}`}>
        {children}
      </div>
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">{aside}</div>
    </div>
  );
}

/** Aligns tail blocks (conclusion) with the main article column beside the TOC. */
export function PostTailMainColumn({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`grid items-start gap-10 lg:grid-cols-[19.1875rem_minmax(0,60.5rem)] lg:gap-x-[2.6875rem] lg:gap-y-0 ${className}`}
    >
      <div className="hidden min-w-0 lg:block" aria-hidden />
      <div className={POST_MAIN_MAX_CLASS}>{children}</div>
    </div>
  );
}
