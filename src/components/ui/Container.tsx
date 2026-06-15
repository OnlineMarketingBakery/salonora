import type { ReactNode } from "react";
import {
  SITE_CONTENT_MAX_WIDTH_CLASS,
  SITE_CONTENT_PADDING_CLASS,
} from "@/lib/layout/site-content-width";

type ContainerPadding = "default" | "header";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  /** Kept for call-site compat; all variants use `SITE_CONTENT_PADDING_CLASS` (24px mobile gutters). */
  padding?: ContainerPadding;
}) {
  const pad = SITE_CONTENT_PADDING_CLASS;
  return (
    <div
      className={`mx-auto w-full ${SITE_CONTENT_MAX_WIDTH_CLASS} ${pad} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
