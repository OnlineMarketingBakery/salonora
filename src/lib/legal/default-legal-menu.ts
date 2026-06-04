import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import type { MenuItem } from "@/types/menu";
import { getLegalUrlSlug, type LegalPageKey } from "./legal-slugs";

const LABELS: Record<LegalPageKey, Record<Locale, string>> = {
  privacy: { nl: "Privacybeleid", en: "Privacy Policy" },
  terms: { nl: "Algemene voorwaarden", en: "Terms & Conditions" },
  faq: { nl: "Veelgestelde vragen", en: "FAQ" },
};

/** Footer legal links when the WordPress Legal menu is empty or missing entries. */
export function getDefaultLegalMenuItems(lang: Locale): MenuItem[] {
  const keys: LegalPageKey[] = ["privacy", "terms", "faq"];
  return keys.map((key, index) => ({
    id: -(index + 1),
    label: LABELS[key][lang],
    href: buildLocalePath(lang, getLegalUrlSlug(lang, key)),
    target: "",
    children: [],
  }));
}

export function mergeLegalMenuItems(cmsMenu: MenuItem[], lang: Locale): MenuItem[] {
  if (cmsMenu.length > 0) return cmsMenu;
  return getDefaultLegalMenuItems(lang);
}
