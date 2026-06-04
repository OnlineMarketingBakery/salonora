import type { Locale } from "@/lib/i18n/locales";
import { resolveLegalPageKey } from "./legal-slugs";

export function legalTocLabel(lang: Locale): string {
  return lang === "nl" ? "Op deze pagina" : "On this page";
}

export function legalHeroEyebrow(urlSlug: string, lang: Locale): string {
  const key = resolveLegalPageKey(lang, urlSlug);
  if (key === "privacy") {
    return lang === "nl" ? "Salonora · Privacy" : "Salonora · Privacy";
  }
  if (key === "terms") {
    return lang === "nl" ? "Salonora · Voorwaarden" : "Salonora · Terms";
  }
  if (key === "faq") {
    return lang === "nl" ? "Salonora · FAQ" : "Salonora · FAQ";
  }
  return lang === "nl" ? "Salonora · Juridisch" : "Salonora · Legal";
}
