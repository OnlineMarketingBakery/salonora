import type { Locale } from "@/lib/i18n/locales";

/** `nl-NL` month:long can render lowercase ("mei 2026"); capitalize first letter for UI. */
function capitalizeFirstLetter(s: string, locale: string): string {
  if (!s) return s;
  const c = s.charAt(0).toLocaleUpperCase(locale);
  return c + s.slice(1);
}

export function formatPostMonthYear(iso: string | undefined, lang: Locale): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const locale = lang === "nl" ? "nl-NL" : "en-GB";
  const raw = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(d);
  return capitalizeFirstLetter(raw, locale);
}
