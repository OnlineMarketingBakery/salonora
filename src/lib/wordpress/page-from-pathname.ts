import { cache } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { GlobalSettings } from "@/types/globals";
import type { PageDocument } from "@/types/documents";
import { fetchHomePage, fetchPageBySlug } from "./fetch-page";

/** Slug path segments after `/{lang}/` (empty array = homepage). */
export function slugPartsFromPathname(pathname: string, lang: Locale): string[] {
  const path = (pathname.split("?")[0] ?? pathname).replace(/\/+$/, "") || "/";
  const prefix = `/${lang}`;
  if (path === prefix) return [];
  if (path.startsWith(`${prefix}/`)) {
    return path.slice(prefix.length + 1).split("/").filter(Boolean);
  }
  return [];
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
