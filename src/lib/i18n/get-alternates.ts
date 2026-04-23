import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/wordpress/config";
import type { Locale } from "./locales";
import { supportedLocales } from "./config";

export function buildLocalePath(lang: Locale, path = ""): string {
  const clean = path.replace(/^\//, "");
  return `/${lang}${clean ? `/${clean}` : ""}`;
}

export function buildAlternatesForPath(path: string): NonNullable<Metadata["alternates"]> {
  const site = getSiteUrl();
  const clean = path.replace(/^\//, "");
  const languages: Record<string, string> = {};
  for (const locale of supportedLocales) {
    languages[locale] = `${site}/${locale}${clean ? `/${clean}` : ""}`;
  }
  return { languages, canonical: `${site}/nl${clean ? `/${clean}` : ""}` };
}
