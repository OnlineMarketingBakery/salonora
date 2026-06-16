import type { ReactNode } from "react";
import { SITE_CONTENT_WIDTH_FAQ_ROW } from "@/lib/layout/site-content-width";

/** Blog single tail blocks (FAQ, conclusion) — same max width as the FAQ dual-card row. */
export function BlogSingleTailWidth({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full min-w-0 ${SITE_CONTENT_WIDTH_FAQ_ROW} ${className}`.trim()}>
      {children}
    </div>
  );
}
