import type { Locale } from "@/lib/i18n/locales";

export const FAQ_CATEGORY_ORDER = [
  "general",
  "pricing",
  "technical",
  "features",
  "getting_started",
] as const;

export type FaqCategoryId = (typeof FAQ_CATEGORY_ORDER)[number];

export const FAQ_CATEGORY_LABELS: Record<FaqCategoryId, Record<Locale, string>> = {
  general: { nl: "Algemeen", en: "General" },
  pricing: { nl: "Prijzen", en: "Pricing" },
  technical: { nl: "Technisch", en: "Technical" },
  features: { nl: "Functies", en: "Features" },
  getting_started: { nl: "Aan de slag", en: "Getting started" },
};

export function getFaqCategoryLabel(id: FaqCategoryId, lang: Locale): string {
  return FAQ_CATEGORY_LABELS[id][lang];
}
