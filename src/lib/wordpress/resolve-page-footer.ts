import { isLegalUrlSlug } from "@/lib/legal/legal-slugs";
import type { FooterSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import type { GlobalSettings } from "@/types/globals";
import { fetchHomePage, fetchPageBySlug } from "./fetch-page";
import { fetchServiceBySlug } from "./fetch-service";
import { slugPartsFromPathname } from "./page-from-pathname";

export type ResolvedPageFooter =
  | { mode: "default" }
  | { mode: "custom"; footer: FooterSectionT };

function resolveFromFooterFields(
  useCustomFooter: boolean,
  footerSections: FooterSectionT[],
): ResolvedPageFooter {
  if (!useCustomFooter) {
    return { mode: "default" };
  }
  const footer = footerSections[0];
  if (!footer) {
    return { mode: "default" };
  }
  return { mode: "custom", footer };
}

/**
 * Default global footer (OMB Footer settings) unless the current route’s document has
 * ACF `use_custom_footer` enabled — then `page_footer_sections` flexible rows render instead.
 *
 * Supports **pages** (incl. homepage) and **service** CPT posts. Service URLs such as
 * `/nl/nagelsalons` are not WordPress pages; footer ACF on the service post was ignored
 * before this resolver also checked `fetchServiceBySlug`.
 */
export async function resolvePageFooter(
  globals: GlobalSettings,
  lang: Locale,
  pathname: string,
): Promise<ResolvedPageFooter> {
  const parts = slugPartsFromPathname(pathname, lang);

  if (parts.length === 0) {
    const home = await fetchHomePage(lang, globals);
    if (!home) return { mode: "default" };
    return resolveFromFooterFields(home.doc.useCustomFooter, home.doc.footerSections);
  }

  const last = parts[parts.length - 1];
  if (!last) return { mode: "default" };

  if (isLegalUrlSlug(lang, last)) {
    return { mode: "default" };
  }

  const page = await fetchPageBySlug(lang, last, globals);
  if (page) {
    return resolveFromFooterFields(page.doc.useCustomFooter, page.doc.footerSections);
  }

  const service = await fetchServiceBySlug(lang, last, globals);
  if (service) {
    return resolveFromFooterFields(service.doc.useCustomFooter, service.doc.footerSections);
  }

  return { mode: "default" };
}
