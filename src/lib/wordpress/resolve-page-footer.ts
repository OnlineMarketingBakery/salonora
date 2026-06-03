import type { FooterSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import type { GlobalSettings } from "@/types/globals";
import { fetchPageDocumentForPathname } from "./page-from-pathname";

export type ResolvedPageFooter =
  | { mode: "default" }
  | { mode: "custom"; footer: FooterSectionT };

/**
 * Default global footer (OMB Footer settings) unless the current page has
 * ACF `use_custom_footer` enabled — then `page_footer_sections` flexible rows render instead.
 */
export async function resolvePageFooter(
  globals: GlobalSettings,
  lang: Locale,
  pathname: string,
): Promise<ResolvedPageFooter> {
  const doc = await fetchPageDocumentForPathname(globals, lang, pathname);
  if (!doc?.useCustomFooter) {
    return { mode: "default" };
  }

  const footer = doc.footerSections[0];
  if (!footer) {
    return { mode: "default" };
  }

  return { mode: "custom", footer };
}
