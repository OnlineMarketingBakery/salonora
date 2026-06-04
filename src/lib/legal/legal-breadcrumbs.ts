import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLegalPageKey } from "./legal-slugs";

export type LegalBreadcrumbItem = { label: string; href?: string };

const HOME_LABEL: Record<Locale, string> = {
  nl: "Home",
  en: "Home",
};

export function getLegalBreadcrumbs(
  lang: Locale,
  urlSlug: string,
  pageTitle: string
): LegalBreadcrumbItem[] {
  const key = resolveLegalPageKey(lang, urlSlug);
  const current =
    pageTitle.trim() ||
    (key === "privacy"
      ? lang === "nl"
        ? "Privacybeleid"
        : "Privacy Policy"
      : key === "terms"
        ? lang === "nl"
          ? "Algemene voorwaarden"
          : "Terms & Conditions"
        : pageTitle);

  return [
    { label: HOME_LABEL[lang], href: buildLocalePath(lang) },
    { label: current },
  ];
}
