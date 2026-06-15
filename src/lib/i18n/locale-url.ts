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
 * `/en/foo` → en; `/foo` or `/` → primary.
 */
export function localeFromPathname(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && isSecondaryLocalePrefix(first)) {
    return first;
  }
  return getPrimaryLocaleSync();
}

/**
 * Path segments after the locale prefix (secondary only).
 * `/en/about` → `about`; `/about` → `about`; `/` → ``.
 */
export function pathAfterLocale(pathname: string): string {
  const clean = (pathname.split("?")[0] ?? pathname).replace(/\/+$/, "") || "/";
  const segments = clean.split("/").filter(Boolean);
  if (segments.length === 0) return "";
  if (isSecondaryLocalePrefix(segments[0]!)) {
    return segments.slice(1).join("/");
  }
  return segments.join("/");
}

/**
 * Build a public frontend path for a locale.
 * Primary: `/` or `/slug`; secondary: `/en` or `/en/slug`.
 */
export function buildLocalePath(lang: Locale, path = ""): string {
  const clean = path.replace(/^\//, "").replace(/\/+$/, "");
  const primary = getPrimaryLocaleSync();

  if (lang === primary) {
    return clean ? `/${clean}` : "/";
  }

  return clean ? `/${lang}/${clean}` : `/${lang}`;
}

/**
 * Strip a legacy primary prefix (`/nl/...`) to the unprefixed public path.
 */
export function stripPrimaryLocalePrefix(pathname: string): string {
  const primary = getPrimaryLocaleSync();
  const clean = (pathname.split("?")[0] ?? pathname).replace(/\/+$/, "") || "/";
  if (clean === `/${primary}`) return "/";
  const prefix = `/${primary}/`;
  if (clean.startsWith(prefix)) {
    return `/${clean.slice(prefix.length)}`;
  }
  return clean;
}

/** Map public pathname to internal `[lang]` route path for middleware rewrite. */
export function toInternalAppPath(pathname: string): string {
  const lang = localeFromPathname(pathname);
  const after = pathAfterLocale(pathname);
  if (!after) return `/${lang}`;
  return `/${lang}/${after}`;
}
