import type { Locale } from "@/lib/i18n/locales";
import { resolveLegalPageKey, type LegalPageKey } from "./legal-slugs";

/** Display dates for legal pages (update when policy copy changes). */
export const LEGAL_LAST_UPDATED: Partial<Record<LegalPageKey, Partial<Record<Locale, string>>>> = {
  privacy: {
    en: "4 June 2026",
    nl: "4 juni 2026",
  },
  terms: {
    en: "4 June 2026",
    nl: "4 juni 2026",
  },
};

export function legalLastUpdatedLabel(lang: Locale): string {
  return lang === "nl" ? "Laatst bijgewerkt" : "Last updated";
}

export function legalGdprBadge(lang: Locale): string {
  return lang === "nl" ? "AVG / GDPR" : "GDPR compliant";
}

export function getLegalLastUpdated(
  lang: Locale,
  urlSlug: string
): string | null {
  const key = resolveLegalPageKey(lang, urlSlug);
  if (!key || key === "faq") return null;
  return LEGAL_LAST_UPDATED[key]?.[lang] ?? LEGAL_LAST_UPDATED[key]?.en ?? null;
}
