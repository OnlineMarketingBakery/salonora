import type { Locale } from "@/lib/i18n/locales";
import { defaultLocale, isLocale, supportedLocales } from "@/lib/i18n/config";

/** Primary locale for URL building (sync). Must match WP `headless_primary_language` / DEFAULT_LOCALE. */
export function getPrimaryLocaleSync(): Locale {
  return defaultLocale;
}

export function getSecondaryLocales(): Locale[] {
  return supportedLocales.filter((l) => l !== getPrimaryLocaleSync());
}

export function isSecondaryLocalePrefix(segment: string): segment is Locale {
  return getSecondaryLocales().includes(segment as Locale);
}

export function isAnyLocalePrefix(segment: string): segment is Locale {
  return isLocale(segment);
}

/**
 * Public pathname → app locale.
 * `/nl/foo` or `/en/foo` → that locale; legacy unprefixed paths resolve to primary (middleware redirects).
 */
export function localeFromPathname(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && isAnyLocalePrefix(first)) {
    return first;
  }
  return getPrimaryLocaleSync();
}

/**
 * Path segments after the locale prefix.
 * `/nl/about` → `about`; legacy `/about` → `about`; `/` → ``.
 */
export function pathAfterLocale(pathname: string): string {
  const clean = (pathname.split("?")[0] ?? pathname).replace(/\/+$/, "") || "/";
  const segments = clean.split("/").filter(Boolean);
  if (segments.length === 0) return "";
  if (segments[0] && isAnyLocalePrefix(segments[0])) {
    return segments.slice(1).join("/");
  }
  return segments.join("/");
}

/**
 * Build a public frontend path for a locale.
 * Both locales use an explicit prefix: `/nl`, `/nl/slug`, `/en`, `/en/slug`.
 */
export function buildLocalePath(lang: Locale, path = ""): string {
  const clean = path.replace(/^\//, "").replace(/\/+$/, "");
  return clean ? `/${lang}/${clean}` : `/${lang}`;
}

/**
 * Strip a locale prefix (`/nl/...` or `/en/...`) when normalizing CMS paths.
 */
export function stripLocalePrefix(pathname: string): string {
  const clean = (pathname.split("?")[0] ?? pathname).replace(/\/+$/, "") || "/";
  const segments = clean.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  if (segments[0] && isAnyLocalePrefix(segments[0])) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return clean;
}

/** @deprecated Use stripLocalePrefix */
export const stripPrimaryLocalePrefix = stripLocalePrefix;

/** Map public pathname to internal `[lang]` route path (identity when prefixed). */
export function toInternalAppPath(pathname: string): string {
  const lang = localeFromPathname(pathname);
  const after = pathAfterLocale(pathname);
  if (!after) return `/${lang}`;
  return `/${lang}/${after}`;
}
