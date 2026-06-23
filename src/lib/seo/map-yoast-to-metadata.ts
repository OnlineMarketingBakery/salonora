import type { Metadata } from "next";
import type { WpYoastHeadJson } from "@/types/wordpress";
import type { GlobalSettings } from "@/types/globals";
import type { SeoPayload } from "@/types/seo";
import type { Locale } from "@/lib/i18n/locales";
import { supportedLocales } from "@/lib/i18n/config";
import { toPlainText } from "@/lib/utils/strings";
import { getImageUrl } from "@/lib/utils/media";
import { getSiteUrl, getWordpressBaseUrl } from "@/lib/wordpress/config";
import { truncateMetaDescription } from "./truncate-meta-description";

/** Map Yoast canonical/og URLs from the WP host to the public marketing site. */
export function rewriteMarketingUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return url;
  const wpBase = getWordpressBaseUrl().replace(/\/$/, "");
  const site = getSiteUrl().replace(/\/$/, "");
  if (!wpBase || !site || wpBase === site) return url;
  if (url.startsWith(`${wpBase}/`) || url === wpBase) {
    return `${site}${url.slice(wpBase.length)}`;
  }
  return url;
}

const OG_LOCALE: Record<Locale, string> = {
  nl: "nl_NL",
  en: "en_GB",
};

function ogAlternateLocales(lang: Locale): string[] {
  return supportedLocales.filter((l) => l !== lang).map((l) => OG_LOCALE[l]);
}

export function mapYoastToSeo(
  document: { yoast_head_json?: WpYoastHeadJson; title?: { rendered: string } },
  gs: GlobalSettings,
  {
    fallbackTitle,
    fallbackDescription,
  }: { fallbackTitle: string; fallbackDescription?: string }
): SeoPayload {
  const y = document.yoast_head_json;
  const defaultDesc = toPlainText(gs.defaultSeo.defaultSeoDescription);
  const title = y?.title || document.title?.rendered || fallbackTitle;
  const description =
    y?.description ||
    defaultDesc ||
    (fallbackDescription ? truncateMetaDescription(toPlainText(fallbackDescription)) : "");
  const ogImage = y?.og_image?.[0]?.url || getImageUrl(gs.defaultSeo.defaultShareImage) || undefined;
  const noindex = y?.robots?.index === "noindex";
  const nofollow = y?.robots?.follow === "nofollow";
  return {
    title,
    description: description || "",
    canonical: rewriteMarketingUrl(y?.og_url || y?.canonical),
    noindex,
    nofollow,
    ogImage,
    twitterTitle: y?.twitter_title,
    twitterDescription: y?.twitter_description,
    schema: y?.schema,
  };
}

export function mergeSeo(a: Partial<SeoPayload>, b: SeoPayload): SeoPayload {
  return {
    title: a.title || b.title,
    description: a.description ?? b.description,
    canonical: rewriteMarketingUrl(a.canonical || b.canonical),
    noindex: a.noindex ?? b.noindex,
    nofollow: a.nofollow ?? b.nofollow,
    ogImage: a.ogImage || b.ogImage,
    twitterTitle: a.twitterTitle || b.twitterTitle,
    twitterDescription: a.twitterDescription || b.twitterDescription,
    schema: a.schema ?? b.schema,
    alternates: a.alternates || b.alternates,
  };
}

export function seoToMetadata(
  payload: SeoPayload,
  site: string,
  opts?: { canonicalUrl?: string; lang?: Locale }
): Partial<Metadata> {
  const canonical =
    opts?.canonicalUrl?.trim() ||
    rewriteMarketingUrl(payload.canonical) ||
    site;

  const robots: Metadata["robots"] =
    payload.noindex || payload.nofollow
      ? {
          index: payload.noindex ? false : true,
          follow: payload.nofollow ? false : true,
        }
      : { index: true, follow: true };

  const lang = opts?.lang;
  const ogLocale = lang ? OG_LOCALE[lang] : undefined;

  return {
    title: payload.title,
    description: payload.description || undefined,
    robots,
    openGraph: {
      title: payload.title,
      description: payload.description || undefined,
      url: canonical,
      locale: ogLocale,
      alternateLocale: lang ? ogAlternateLocales(lang) : undefined,
      images: payload.ogImage ? [{ url: payload.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: payload.twitterTitle || payload.title,
      description: payload.twitterDescription || payload.description || undefined,
      images: payload.ogImage ? [payload.ogImage] : undefined,
    },
    alternates: { canonical },
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
