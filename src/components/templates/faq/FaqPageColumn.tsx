import type { ReactNode } from "react";

/**
 * Inner reading column (~800px), centered inside the site content band (82rem / nav width).
 */
export const FAQ_PAGE_INNER_CLASS =
  "faq-page-inner mx-auto w-full min-w-0 max-w-[50rem]";

export function FaqPageInner({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${FAQ_PAGE_INNER_CLASS} ${className}`.trim()}>{children}</div>;
}

/** @deprecated Use FaqPageInner */
export const FAQ_PAGE_COLUMN_CLASS = FAQ_PAGE_INNER_CLASS;

/** @deprecated Use FaqPageInner */
export function FaqPageColumn({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <FaqPageInner className={className}>{children}</FaqPageInner>;
}
