import { defaultLocale, supportedLocales } from "@/lib/i18n/config";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import { getSiteUrl } from "@/lib/wordpress/config";
import { getLocaleHrefsForPathname } from "@/lib/wordpress/polylang-locale-hrefs";

function toAbsoluteUrl(path: string): string {
  const site = getSiteUrl().replace(/\/$/, "");
  if (!path || path === "/") return site;
  return `${site}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Polylang-aware hreflang map for Next metadata (`alternates.languages`), including `x-default`.
 */
export async function buildMetadataLanguageAlternates(
  pathname: string,
  pathAfterLocale = ""
): Promise<Record<string, string>> {
  const resolved = await getLocaleHrefsForPathname(pathname);

  const languages: Record<string, string> = {};

  if (resolved) {
    for (const locale of supportedLocales) {
      const path = resolved[locale as Locale];
      if (path) {
        languages[locale] = toAbsoluteUrl(path);
      }
    }
  } else {
    for (const locale of supportedLocales) {
      languages[locale] = toAbsoluteUrl(buildLocalePath(locale, pathAfterLocale));
    }
  }

  const xDefaultPath =
    (resolved?.[defaultLocale as Locale] as string | undefined) ??
    buildLocalePath(defaultLocale, pathAfterLocale);
  languages["x-default"] = toAbsoluteUrl(xDefaultPath);

  return languages;
}
