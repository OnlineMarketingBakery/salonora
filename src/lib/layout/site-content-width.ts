/**
 * Shared horizontal layout with SiteHeader (logo ↔ CTA).
 *
 * Figma homepage **1714:110** (1440px artboard): primary content column is **1300px**
 * (e.g. 1714:1112, 1714:976, 1714:121 at x≈70). Full-bleed bands use width 1440 on
 * the `<section>` shell only; inner content still uses the tokens below.
 *
 * Mobile gutters (Campaign artboard 764:2841): 412px frame, content at x=24 → 24px each side.
 */
export const SITE_CONTENT_MAX_WIDTH_CLASS = "max-w-[81.25rem]";

/** Figma **1714:759** testimonials frame — 1298px. */
export const SITE_CONTENT_WIDTH_TESTIMONIALS = "max-w-[1298px]";

/** Figma **1714:1007** feature highlight grid content — 1237px. */
export const SITE_CONTENT_WIDTH_FEATURE_GRID = "max-w-[1237px]";

/** Figma **1714:1332** how-it-works steps frame — 1246px. */
export const SITE_CONTENT_WIDTH_STEPS_FRAME = "max-w-[1246px]";

/** Figma **1714:707** faq / talk dual inner row — 1156px (72.25rem). */
export const SITE_CONTENT_WIDTH_FAQ_ROW = "max-w-[72.25rem]";

/** Matches SiteHeader responsive side padding. */
export const SITE_CONTENT_PADDING_CLASS =
  "px-6 sm:px-6 md:px-8 lg:px-10 xl:px-12";

export const SITE_CONTENT_OUTER_CLASS = `mx-auto w-full ${SITE_CONTENT_MAX_WIDTH_CLASS} ${SITE_CONTENT_PADDING_CLASS}`;
