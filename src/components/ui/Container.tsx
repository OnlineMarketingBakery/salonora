import type { ReactNode } from "react";
import {
  SITE_CONTENT_MAX_WIDTH_CLASS,
  SITE_CONTENT_PADDING_CLASS,
} from "@/lib/layout/site-content-width";

type ContainerPadding = "default" | "header";

export function Container({
  children,
  className = "",
  padding = "default",
}: {
  children: ReactNode;
  className?: string;
  /** `header` — same side padding as SiteHeader so content aligns with the nav shell. */
  padding?: ContainerPadding;
}) {
  const pad = padding === "header" ? SITE_CONTENT_PADDING_CLASS : "px-4 sm:px-6";
  return (
    <div
      className={`mx-auto w-full ${SITE_CONTENT_MAX_WIDTH_CLASS} ${pad} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
