import { cache } from "react";
import { wpFetchOptional } from "./client";
import { getHomepageSlug } from "./config";
import type { WpPageRaw } from "@/types/wordpress";
import type { Locale } from "@/lib/i18n/locales";
import { normalizePageSections } from "@/lib/acf/normalize-page-sections";
import { asBool } from "@/lib/acf/field-mappers";
import { mapYoastToSeo } from "@/lib/seo/map-yoast-to-metadata";
import type { GlobalSettings } from "@/types/globals";
import type { PageDocument } from "@/types/documents";

function pageToDoc(
  p: WpPageRaw,
  gs: GlobalSettings
): { doc: PageDocument; raw: WpPageRaw } {
  const acf = p.acf || {};
  const pageSections = normalizePageSections((acf as { page_sections?: unknown }).page_sections);
  const doc: PageDocument = {
    kind: "page",
    id: p.id,
    slug: p.slug,
    title: p.title?.rendered || "",
    content: p.content?.rendered || "",
    hidePageTitle: asBool((acf as { hide_page_title?: unknown }).hide_page_title),
    hidePrimaryMenu: asBool((acf as { hide_site_navigation?: unknown }).hide_site_navigation),
    isBlogArchive: asBool((acf as { is_blog_archive?: unknown }).is_blog_archive),
    isCaseStudyArchive: asBool((acf as { is_case_study_archive?: unknown }).is_case_study_archive),
    sections: pageSections,
    seo: mapYoastToSeo(p, gs, { fallbackTitle: p.title?.rendered || "Page" }),
  };
  return { doc, raw: p };
}

/** Dedupes the REST request within a single RSC render (e.g. layout + page). */
const fetchPageRawBySlug = cache(async (lang: Locale, slug: string): Promise<WpPageRaw | null> => {
  const s = typeof slug === "string" && slug ? slug : undefined;
  const path = s
    ? `/wp/v2/pages?slug=${encodeURIComponent(s)}&_embed=1&acf_format=standard`
    : null;
  if (!path) return null;
  const list = await wpFetchOptional<WpPageRaw[]>(path, { lang, revalidate: 60 });
  return list?.[0] ?? null;
});

export async function fetchPageBySlug(
  lang: Locale,
  slug: string,
  gs: GlobalSettings
): Promise<{ doc: PageDocument; raw: WpPageRaw } | null> {
  const raw = await fetchPageRawBySlug(lang, slug);
  if (!raw) return null;
  return pageToDoc(raw, gs);
}

export async function fetchHomePage(
  lang: Locale,
  gs: GlobalSettings
): Promise<{ doc: PageDocument; raw: WpPageRaw } | null> {
  const slug = getHomepageSlug(lang);
  return fetchPageBySlug(lang, slug, gs);
}
