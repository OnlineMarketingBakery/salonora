import type { Locale } from "@/lib/i18n/locales";
import type { GlobalSettings } from "@/types/globals";
import { fetchPageDocumentForPathname } from "./page-from-pathname";

/**
 * Whether primary menu links (Home, About, …) should be hidden for the current path,
 * from the WordPress page ACF field `hide_site_navigation`.
 */
export async function getHidePrimaryMenu(
  globals: GlobalSettings,
  lang: Locale,
  pathname: string
): Promise<boolean> {
  const doc = await fetchPageDocumentForPathname(globals, lang, pathname);
  return doc?.hidePrimaryMenu ?? false;
}
