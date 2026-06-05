import type { Locale } from "@/lib/i18n/locales";

/** Public URL + WordPress page slug per locale. */
export const FAQ_URL_SLUGS: Record<Locale, string> = {
  nl: "veelgestelde-vragen",
  en: "faqs",
};

/** @deprecated Use getFaqUrlSlug(lang) */
export const FAQ_PAGE_SLUG = FAQ_URL_SLUGS.en;

/** Legacy short URLs that resolve to the FAQ page. */
export const FAQ_PAGE_ALIASES = ["faq", "faqs", "veelgestelde-vragen"] as const;

export function getFaqUrlSlug(lang: Locale): string {
  return FAQ_URL_SLUGS[lang];
}

export function isFaqPageSlug(lang: Locale, slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  if (FAQ_URL_SLUGS[lang].toLowerCase() === normalized) return true;
  if (lang === "nl" && (normalized === "faq" || normalized === "faqs")) return true;
  if (lang === "en" && normalized === "faq") return true;
  return false;
}

/** WordPress REST slug to fetch for this URL segment. */
export function resolveFaqFetchSlug(lang: Locale): string {
  return getFaqUrlSlug(lang);
}

/** Redirect old FAQ paths to the locale canonical slug. */
export function getFaqLegacyRedirectPath(lang: Locale, urlSlug: string): string | null {
  const normalized = urlSlug.trim().toLowerCase();
  const canonical = FAQ_URL_SLUGS[lang];
  if (normalized === canonical) return null;
  if (lang === "nl" && (normalized === "faq" || normalized === "faqs")) {
    return `/${lang}/${canonical}`;
  }
  if (lang === "en" && normalized === "faq") {
    return `/${lang}/${canonical}`;
  }
  return null;
}
