/**
 * Shared horizontal layout with SiteHeader (logo ↔ CTA).
 *
 * Figma homepage **1714:110** (1440px artboard): primary content column is **1300px**
 * (e.g. 1714:1112, 597:3128 at x≈70). Side gutters (~70px on 1440) sit **outside**
 * that column — see `Container` (padding on outer wrapper, max-width on inner).
 *
 * Mobile gutters (Campaign artboard 764:2841): 412px frame, content at x=24 → 24px each side.
 */
export const SITE_CONTENT_MAX_WIDTH_CLASS = "max-w-[81.25rem]";

/**
 * Do not use Tailwind `max-w-340` on layout shells — it resolves to 85rem (1360px), not 1300px,
 * and will misalign header/footer vs page sections. Use `SITE_CONTENT_MAX_WIDTH_CLASS` instead.
 */

/** Figma **1714:759** testimonials frame — 1298px. */
export const SITE_CONTENT_WIDTH_TESTIMONIALS = "max-w-[1298px]";

/** Figma **1714:1007** feature highlight grid content — 1237px. */
export const SITE_CONTENT_WIDTH_FEATURE_GRID = "max-w-[1237px]";

/** Figma **1714:1332** how-it-works steps frame — 1246px. */
export const SITE_CONTENT_WIDTH_STEPS_FRAME = "max-w-[1246px]";

/** Figma **1714:707** faq / talk dual inner row — 1156px (72.25rem). */
export const SITE_CONTENT_WIDTH_FAQ_ROW = "max-w-[72.25rem]";

/** Matches SiteHeader / SiteFooter / Container responsive side gutters. */
export const SITE_CONTENT_PADDING_CLASS =
  "px-6 sm:px-6 md:px-8 lg:px-10 xl:px-12";

/** Outer shell — gutters only (pair with `SITE_CONTENT_INNER_CLASS` on a child). */
export const SITE_CONTENT_GUTTER_CLASS = `mx-auto w-full ${SITE_CONTENT_PADDING_CLASS}`;

/** Inner column — 1300px max, centered inside gutter wrapper. */
export const SITE_CONTENT_INNER_CLASS = `mx-auto w-full min-w-0 ${SITE_CONTENT_MAX_WIDTH_CLASS}`;

/** @deprecated Prefer `SITE_CONTENT_GUTTER_CLASS` + `SITE_CONTENT_INNER_CLASS` (see Container). */
export const SITE_CONTENT_OUTER_CLASS = `mx-auto w-full ${SITE_CONTENT_MAX_WIDTH_CLASS} ${SITE_CONTENT_PADDING_CLASS}`;
