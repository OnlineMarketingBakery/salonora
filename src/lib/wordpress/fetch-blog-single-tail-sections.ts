import type { AnySectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import type { GlobalSettings } from "@/types/globals";
import { asBool } from "@/lib/acf/field-mappers";
import { normalizePageSections } from "@/lib/acf/normalize-page-sections";
import { enrichSections } from "@/lib/acf/enrich-sections";
import { fetchAcfOptions, getOmbGlobalsPayload } from "./fetch-globals";
import { fetchBlogSingleLayoutSections } from "./fetch-blog-single-layout";

/** ACF options page slugs (OMB Headless → Templates menu). */
const TEMPLATE_OPTIONS_SLUGS = ["omb-templates-settings", "omb-template-settings"] as const;

/** Flexible content field keys for blog single tail (clone of page_sections layouts). */
const BLOG_SINGLE_SECTION_FIELD_KEYS = [
  "blog_single_sections",
  "blog_single_page_sections",
  "page_sections",
] as const;

function unwrapAcfOptionsPayload(data: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!data) return null;
  const acf = data.acf;
  const acfRecord =
    acf && typeof acf === "object" && !Array.isArray(acf) ? (acf as Record<string, unknown>) : null;
  if (!acfRecord) return data;
  return { ...data, ...acfRecord };
}

/**
 * ACF clone of `page_sections` often nests rows under `page_sections` inside `blog_single_sections`
 * (object), not as a top-level array. `/bakery/v1/globals` returns that shape.
 */
function extractFlexibleSectionRows(value: unknown): unknown[] | null {
  if (Array.isArray(value) && value.length > 0) return value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const o = value as Record<string, unknown>;
  for (const key of BLOG_SINGLE_SECTION_FIELD_KEYS) {
    const nested = o[key];
    if (Array.isArray(nested) && nested.length > 0) return nested;
  }
  return null;
}

function pickTemplatesShowRelatedPosts(
  source: Record<string, unknown> | null | undefined
): boolean | null {
  const flat = unwrapAcfOptionsPayload(source ?? null);
  if (!flat) return null;
  if (!Object.prototype.hasOwnProperty.call(flat, "show_related_posts")) return null;
  return asBool(flat.show_related_posts);
}

/**
 * Whether the related-posts grid should load for this blog single.
 * Templates OFF → hidden. Templates ON or missing from API → shown (per-post can still force ON).
 */
export function resolveBlogShowRelatedPosts(
  templateShowRelated: boolean | null,
  perPostShowRelated: boolean
): boolean {
  if (templateShowRelated === false) return false;
  if (templateShowRelated === true) return true;
  return perPostShowRelated || true;
}

/**
 * Global Templates toggle for the related-posts grid on blog singles.
 * When true, all blog singles show related posts; when false, none; when unset/missing, default on.
 */
export async function fetchBlogSingleTemplateShowRelatedPosts(lang: Locale): Promise<boolean | null> {
  const omb = await getOmbGlobalsPayload(lang);
  let value = pickTemplatesShowRelatedPosts(omb?.templates);
  if (value !== null) return value;

  for (const slug of TEMPLATE_OPTIONS_SLUGS) {
    const opt = await fetchAcfOptions(slug, lang);
    value = pickTemplatesShowRelatedPosts(opt);
    if (value !== null) return value;
  }
  return null;
}

function pickBlogSingleSectionsRaw(source: Record<string, unknown> | null | undefined): unknown {
  const flat = unwrapAcfOptionsPayload(source ?? null);
  if (!flat) return undefined;
  for (const key of BLOG_SINGLE_SECTION_FIELD_KEYS) {
    const rows = extractFlexibleSectionRows(flat[key]);
    if (rows) return rows;
  }
  return undefined;
}

async function fetchBlogSingleSectionsFromTemplates(
  lang: Locale,
  gs: GlobalSettings
): Promise<AnySectionT[]> {
  let rawRows: unknown;

  const omb = await getOmbGlobalsPayload(lang);
  rawRows = pickBlogSingleSectionsRaw(omb?.templates);

  if (rawRows == null) {
    for (const slug of TEMPLATE_OPTIONS_SLUGS) {
      const opt = await fetchAcfOptions(slug, lang);
      rawRows = pickBlogSingleSectionsRaw(opt);
      if (rawRows != null) break;
    }
  }

  if (rawRows == null) return [];

  const sections = normalizePageSections(rawRows);
  if (sections.length === 0) return [];

  return enrichSections(sections, {
    lang,
    globals: gs,
    pageSlugPath: "_templates/blog-single",
  });
}

/**
 * Shared tail sections for all blog posts (FAQ, etc.).
 * 1. Global **Templates** options (`blog_single_sections`) — preferred.
 * 2. Legacy layout page (`is_blog_single_layout`) — fallback.
 */
export async function fetchBlogSingleTailSections(
  lang: Locale,
  gs: GlobalSettings
): Promise<AnySectionT[]> {
  const fromTemplates = await fetchBlogSingleSectionsFromTemplates(lang, gs);
  if (fromTemplates.length > 0) return fromTemplates;
  return fetchBlogSingleLayoutSections(lang, gs);
}

export function pickBlogTailFaqSections(sections: AnySectionT[]): AnySectionT[] {
  return sections.filter((s) => s.type === "faq_contact_split");
}

export function pickBlogTailConclusionSections(sections: AnySectionT[]): AnySectionT[] {
  return sections.filter((s) => s.type === "blog_conclusion_panel");
}

export function pickBlogTailNonFaqSections(sections: AnySectionT[]): AnySectionT[] {
  return sections.filter(
    (s) => s.type !== "faq_contact_split" && s.type !== "blog_conclusion_panel"
  );
}

/** @deprecated Use pickBlogTailFaqSections */
export const pickBlogLayoutFaqSections = pickBlogTailFaqSections;

/** @deprecated Use pickBlogTailNonFaqSections */
export const pickBlogLayoutTailSections = pickBlogTailNonFaqSections;
