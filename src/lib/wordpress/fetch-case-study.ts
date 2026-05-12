import { wpFetchOptional } from "@/lib/wordpress/client";
import { getCptRestBase } from "@/lib/wordpress/config";
import type { WpCaseStudyRaw } from "@/types/wordpress";
import type { Locale } from "@/lib/i18n/locales";
import { mapYoastToSeo } from "@/lib/seo/map-yoast-to-metadata";
import type { GlobalSettings } from "@/types/globals";
import type { CaseStudyDocument } from "@/types/documents";
import { normalizePageSections } from "@/lib/acf/normalize-page-sections";

function toDoc(p: WpCaseStudyRaw, gs: GlobalSettings): { doc: CaseStudyDocument; raw: WpCaseStudyRaw } {
  const acf = p.acf || {};
  const featured = p._embedded?.["wp:featuredmedia"]?.[0];
  const doc: CaseStudyDocument = {
    kind: "case_study",
    id: p.id,
    slug: p.slug,
    title: p.title?.rendered || "",
    content: p.content?.rendered || "",
    excerpt: p.excerpt?.rendered || "",
    featuredImage: featured?.source_url || null,
    featuredImageAlt: featured?.alt_text || "",
    sections: normalizePageSections((acf as { page_sections?: unknown }).page_sections),
    seo: mapYoastToSeo(p, gs, { fallbackTitle: p.title?.rendered || "Case study" }),
  };
  return { doc, raw: p };
}

export async function fetchCaseStudyBySlug(
  lang: Locale,
  slug: string,
  gs: GlobalSettings
): Promise<{ doc: CaseStudyDocument; raw: WpCaseStudyRaw } | null> {
  const rest = getCptRestBase("case_study");
  const list = await wpFetchOptional<WpCaseStudyRaw[]>(
    `/wp/v2/${rest}?slug=${encodeURIComponent(slug)}&_embed=1&acf_format=standard`,
    { lang, revalidate: 60 }
  );
  if (list?.[0]) return toDoc(list[0], gs);
  return null;
}
