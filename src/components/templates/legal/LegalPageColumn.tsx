import type { ReactNode } from "react";

/** Full width inside Container — same 82rem band as the nav shell. */
export const LEGAL_PAGE_COLUMN_CLASS = "legal-page-column w-full min-w-0";

export function LegalPageColumn({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${LEGAL_PAGE_COLUMN_CLASS} ${className}`.trim()}>{children}</div>;
}
