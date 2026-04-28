import type { Locale } from "@/lib/i18n/locales";
import type { GlobalSettings } from "@/types/globals";
import { fetchHomePage, fetchPageBySlug } from "./fetch-page";

function slugPartsFromPathname(pathname: string, lang: Locale): string[] {
  const path = (pathname.split("?")[0] ?? pathname).replace(/\/+$/, "") || "/";
  const prefix = `/${lang}`;
  if (path === prefix) return [];
  if (path.startsWith(`${prefix}/`)) {
    return path.slice(prefix.length + 1).split("/").filter(Boolean);
  }
  return [];
}

/**
 * Whether primary menu links (Home, About, …) should be hidden for the current path,
 * from the WordPress page ACF field `hide_site_navigation`.
 */
export async function getHidePrimaryMenu(
  globals: GlobalSettings,
  lang: Locale,
  pathname: string
): Promise<boolean> {
  const parts = slugPartsFromPathname(pathname, lang);
  if (parts.length === 0) {
    const home = await fetchHomePage(lang, globals);
    return home?.doc.hidePrimaryMenu ?? false;
  }
  const last = parts[parts.length - 1];
  if (!last) return false;
  const page = await fetchPageBySlug(lang, last, globals);
  return page?.doc.hidePrimaryMenu ?? false;
}
