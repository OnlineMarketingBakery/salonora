import { wpFetchOptional } from "./client";
import { getCptRestBase } from "./config";
import type { WpServiceRaw } from "@/types/wordpress";
import type { Locale } from "@/lib/i18n/locales";
import { normalizeServiceSections } from "@/lib/acf/normalize-service-sections";
import { asString } from "@/lib/acf/field-mappers";
import { mapYoastToSeo } from "@/lib/seo/map-yoast-to-metadata";
import type { GlobalSettings } from "@/types/globals";
import type { ServiceDocument } from "@/types/documents";

function toDoc(p: WpServiceRaw, gs: GlobalSettings): { doc: ServiceDocument; raw: WpServiceRaw } {
  const acf = p.acf || {};
  const sections = normalizeServiceSections((acf as { service_sections?: unknown }).service_sections);
  const highlights = Array.isArray((acf as { service_highlights?: { text?: string }[] }).service_highlights)
    ? (acf as { service_highlights: { text: string }[] }).service_highlights
        .map((h) => h.text)
        .filter(Boolean)
    : [];
  const doc: ServiceDocument = {
    kind: "service",
    id: p.id,
    slug: p.slug,
    title: p.title?.rendered || "",
    excerpt: p.excerpt?.rendered || "",
    serviceIntro: asString((acf as { service_intro?: string }).service_intro),
    serviceHighlights: highlights,
    sections,
    seo: mapYoastToSeo(p, gs, { fallbackTitle: p.title?.rendered || "Service" }),
  };
  return { doc, raw: p };
}

export async function fetchServiceBySlug(
  lang: Locale,
  slug: string,
  gs: GlobalSettings
): Promise<{ doc: ServiceDocument; raw: WpServiceRaw } | null> {
  const rest = getCptRestBase("service");
  const list = await wpFetchOptional<WpServiceRaw[]>(
    `/wp/v2/${rest}?slug=${encodeURIComponent(slug)}&_embed=1&acf_format=standard`,
    { lang, revalidate: 60 }
  );
  if (list?.[0]) return toDoc(list[0], gs);
  return null;
}
