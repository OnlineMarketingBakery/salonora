import type { Locale } from "@/lib/i18n/locales";
import { getFaqUrlSlug, isFaqPageSlug, resolveFaqFetchSlug } from "./faq-slugs";

export const LEGAL_PAGE_KEYS = ["privacy", "terms", "faq"] as const;
export type LegalPageKey = (typeof LEGAL_PAGE_KEYS)[number];

/** Public URL slug per locale (matches WordPress page slugs). */
export const LEGAL_URL_SLUGS: Record<Locale, Record<LegalPageKey, string>> = {
  nl: {
    privacy: "privacybeleid",
    terms: "algemene-voorwaarden",
    faq: getFaqUrlSlug("nl"),
  },
  en: {
    privacy: "privacy-policy",
    terms: "terms-conditions",
    faq: getFaqUrlSlug("en"),
  },
};

/** Old EN-style slugs still present in NL WP — redirect to Dutch URLs. */
export const LEGAL_LEGACY_REDIRECTS: Partial<
  Record<Locale, Partial<Record<string, LegalPageKey>>>
> = {
  nl: {
    "privacy-policy": "privacy",
    "terms-conditions": "terms",
  },
};

export function getLegalUrlSlug(lang: Locale, key: LegalPageKey): string {
  return LEGAL_URL_SLUGS[lang][key];
}

export function resolveLegalPageKey(lang: Locale, urlSlug: string): LegalPageKey | null {
  const normalized = urlSlug.trim().toLowerCase();
  for (const key of LEGAL_PAGE_KEYS) {
    if (LEGAL_URL_SLUGS[lang][key].toLowerCase() === normalized) return key;
  }
  const legacy = LEGAL_LEGACY_REDIRECTS[lang];
  if (legacy?.[urlSlug] || legacy?.[normalized]) {
    return legacy[urlSlug] ?? legacy[normalized] ?? null;
  }
  if (isFaqPageSlug(lang, urlSlug)) return "faq";
  return null;
}

export function isLegalUrlSlug(lang: Locale, slug: string): boolean {
  return resolveLegalPageKey(lang, slug) != null;
}

/** WordPress REST slug to fetch for this URL segment. */
export function resolveLegalFetchSlug(lang: Locale, urlSlug: string): string {
  if (isFaqPageSlug(lang, urlSlug)) return resolveFaqFetchSlug(lang);
  const key = resolveLegalPageKey(lang, urlSlug);
  if (key) return getLegalUrlSlug(lang, key);
  return urlSlug;
}

export function getLegalLegacyRedirectPath(
  lang: Locale,
  urlSlug: string
): string | null {
  const normalized = urlSlug.trim().toLowerCase();
  const key =
    LEGAL_LEGACY_REDIRECTS[lang]?.[urlSlug] ??
    LEGAL_LEGACY_REDIRECTS[lang]?.[normalized];
  if (!key) return null;
  return `/${lang}/${getLegalUrlSlug(lang, key)}`;
}
