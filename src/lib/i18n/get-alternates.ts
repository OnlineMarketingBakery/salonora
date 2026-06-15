import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/wordpress/config";
import { supportedLocales, defaultLocale } from "./config";
import { buildLocalePath } from "./locale-url";

export { buildLocalePath } from "./locale-url";

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
