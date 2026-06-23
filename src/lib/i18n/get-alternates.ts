import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/wordpress/config";
import type { Locale } from "@/lib/i18n/locales";
import { supportedLocales, defaultLocale } from "./config";
import { buildLocalePath } from "./locale-url";

export { buildLocalePath } from "./locale-url";

/** Absolute self-referencing canonical for the current locale + path (headless frontend URL). */
export function buildAbsoluteCanonical(lang: Locale, path = ""): string {
  const site = getSiteUrl().replace(/\/$/, "");
  return `${site}${buildLocalePath(lang, path)}`;
}

export function buildAlternatesForPath(path: string): NonNullable<Metadata["alternates"]> {
  const site = getSiteUrl();
  const clean = path.replace(/^\//, "");
  const languages: Record<string, string> = {};
  for (const locale of supportedLocales) {
    const localePath = buildLocalePath(locale, clean);
    languages[locale] = `${site}${localePath === "/" ? "" : localePath}`;
  }
  const canonicalPath = buildLocalePath(defaultLocale, clean);
  return {
    languages,
    canonical: `${site}${canonicalPath === "/" ? "" : canonicalPath}`,
  };
}
