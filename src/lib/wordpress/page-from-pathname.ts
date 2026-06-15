import { cache } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { GlobalSettings } from "@/types/globals";
import type { PageDocument } from "@/types/documents";
import { localeFromPathname, pathAfterLocale } from "@/lib/i18n/locale-url";
import { fetchHomePage, fetchPageBySlug } from "./fetch-page";

/** Slug path segments after locale prefix (empty array = homepage). */
export function slugPartsFromPathname(pathname: string, lang: Locale): string[] {
  const resolvedLang = localeFromPathname(pathname);
  if (resolvedLang !== lang) {
    const after = pathAfterLocale(pathname);
    return after ? after.split("/").filter(Boolean) : [];
  }
  const after = pathAfterLocale(pathname);
  return after ? after.split("/").filter(Boolean) : [];
}

/** Cached page fetch for the current pathname (homepage or last slug segment). */
export const fetchPageDocumentForPathname = cache(async (
  globals: GlobalSettings,
  lang: Locale,
  pathname: string,
): Promise<PageDocument | null> => {
  const parts = slugPartsFromPathname(pathname, lang);
  if (parts.length === 0) {
    const home = await fetchHomePage(lang, globals);
    return home?.doc ?? null;
  }
  const last = parts[parts.length - 1];
  if (!last) return null;
  const page = await fetchPageBySlug(lang, last, globals);
  return page?.doc ?? null;
});
