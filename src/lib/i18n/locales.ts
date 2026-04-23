export const locales = ["nl", "en"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  nl: "Nederlands",
  en: "English",
};
