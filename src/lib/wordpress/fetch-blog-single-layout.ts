import { cache } from "react";
import type { AnySectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import type { GlobalSettings } from "@/types/globals";
import { enrichSections } from "@/lib/acf/enrich-sections";
import { fetchPageBySlug } from "./fetch-page";
import { getBlogSingleLayoutSlug } from "./config";

const loadLayoutPage = cache(async (lang: Locale, gs: GlobalSettings) => {
  const slug = getBlogSingleLayoutSlug(lang);
  return fetchPageBySlug(lang, slug, gs);
});

/**
 * Legacy fallback: layout page with `is_blog_single_layout`.
 * Prefer global Templates options — see `fetch-blog-single-tail-sections.ts`.
 */
export async function fetchBlogSingleLayoutSections(
  lang: Locale,
  gs: GlobalSettings
): Promise<AnySectionT[]> {
  const page = await loadLayoutPage(lang, gs);
  if (!page?.doc.isBlogSingleLayout) return [];
  const slug = getBlogSingleLayoutSlug(lang);
  return enrichSections(page.doc.sections, {
    lang,
    globals: gs,
    pageSlugPath: slug,
  });
}

export function pickBlogLayoutFaqSections(sections: AnySectionT[]): AnySectionT[] {
  return sections.filter((s) => s.type === "faq_contact_split");
}

export function pickBlogLayoutTailSections(sections: AnySectionT[]): AnySectionT[] {
  return sections.filter((s) => s.type !== "faq_contact_split");
}
