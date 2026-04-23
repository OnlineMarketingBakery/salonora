import { locales, type Locale } from "./locales";

export const defaultLocale: Locale = (process.env.DEFAULT_LOCALE as Locale) || "nl";

export const supportedLocales = (process.env.SUPPORTED_LOCALES || "nl,en")
  .split(",")
  .map((s) => s.trim())
  .filter((s): s is Locale => (locales as readonly string[]).includes(s));

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
