/**
 * Shared horizontal layout with SiteHeader (logo ↔ CTA).
 * Header: outer padding + inner `max-w-[82rem]` shell.
 *
 * Mobile gutters (Campaign artboard 764:2841): 412px frame, content at x=24 → 24px each side.
 */
export const SITE_CONTENT_MAX_WIDTH_CLASS = "max-w-[82rem]";

/** Matches SiteHeader responsive side padding. */
export const SITE_CONTENT_PADDING_CLASS =
  "px-6 sm:px-6 md:px-8 lg:px-10 xl:px-12";

export const SITE_CONTENT_OUTER_CLASS = `mx-auto w-full ${SITE_CONTENT_MAX_WIDTH_CLASS} ${SITE_CONTENT_PADDING_CLASS}`;
