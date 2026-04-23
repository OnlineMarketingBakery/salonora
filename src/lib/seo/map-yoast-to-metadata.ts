import type { Metadata } from "next";
import type { WpYoastHeadJson } from "@/types/wordpress";
import type { GlobalSettings } from "@/types/globals";
import type { SeoPayload } from "@/types/seo";
import { toPlainText } from "@/lib/utils/strings";
import { getImageUrl } from "@/lib/utils/media";
import { getSiteUrl } from "@/lib/wordpress/config";

export function mapYoastToSeo(
  document: { yoast_head_json?: WpYoastHeadJson; title?: { rendered: string } },
  gs: GlobalSettings,
  { fallbackTitle }: { fallbackTitle: string }
): SeoPayload {
  const y = document.yoast_head_json;
  const defaultDesc = toPlainText(gs.defaultSeo.defaultSeoDescription);
  const title = y?.title || document.title?.rendered || fallbackTitle;
  const description = y?.description || defaultDesc;
  const ogImage = y?.og_image?.[0]?.url || getImageUrl(gs.defaultSeo.defaultShareImage) || undefined;
  const noindex = y?.robots?.index === "noindex";
  return {
    title,
    description: description || "",
    canonical: y?.og_url || y?.canonical,
    noindex: noindex,
    ogImage,
  };
}

export function mergeSeo(
  a: Partial<SeoPayload>,
  b: SeoPayload
): SeoPayload {
  return {
    title: a.title || b.title,
    description: a.description ?? b.description,
    canonical: a.canonical || b.canonical,
    noindex: a.noindex ?? b.noindex,
    ogImage: a.ogImage || b.ogImage,
    alternates: a.alternates || b.alternates,
  };
}

export function seoToMetadata(
  payload: SeoPayload,
  site: string
): Partial<Metadata> {
  return {
    title: payload.title,
    description: payload.description,
    robots: payload.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: payload.title,
      description: payload.description,
      url: payload.canonical,
      images: payload.ogImage ? [{ url: payload.ogImage }] : undefined,
    },
    alternates: { canonical: payload.canonical || site },
  };
}

export function withAlternates(
  m: Partial<Metadata>,
  alternates: { languages: Record<string, string> } | undefined
): Partial<Metadata> {
  if (!alternates) return m;
  return { ...m, alternates: { ...m.alternates, languages: alternates.languages } };
}

export function getSiteName(gs: GlobalSettings): string {
  return gs.site.siteNameOverride || getSiteUrl();
}
