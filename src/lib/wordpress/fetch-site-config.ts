import { cache } from "react";
import { wpFetchOptional } from "@/lib/wordpress/client";
import { getOmbHeadlessRestPrefix } from "@/lib/wordpress/config";
import { defaultLocale, isLocale, supportedLocales } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/locales";

export type SiteLanguageConfig = {
  slug: Locale;
  locale: string;
  home: string;
  urlPrefix: string | null;
  isPrimary: boolean;
};

export type SiteConfig = {
  primaryLanguage: Locale;
  languages: SiteLanguageConfig[];
};

type WpSiteLanguage = {
  slug: string;
  locale?: string;
  home?: string;
  url_prefix?: string | null;
  is_primary?: boolean;
};

type WpSitePayload = {
  primary_language?: string;
  languages?: WpSiteLanguage[];
};

function toSiteLanguage(raw: WpSiteLanguage, primary: Locale): SiteLanguageConfig | null {
  if (!isLocale(raw.slug)) return null;
  return {
    slug: raw.slug,
    locale: raw.locale ?? raw.slug,
    home: raw.home ?? "",
    urlPrefix: raw.url_prefix ?? raw.slug,
    isPrimary: raw.is_primary ?? raw.slug === primary,
  };
}

export const fetchSiteConfig = cache(async (): Promise<SiteConfig> => {
  const payload = await wpFetchOptional<WpSitePayload>(`${getOmbHeadlessRestPrefix()}/site`, {
    revalidate: 3600,
  });

  const primaryRaw = payload?.primary_language;
  const primary: Locale =
    primaryRaw && isLocale(primaryRaw) ? primaryRaw : defaultLocale;

  const languages: SiteLanguageConfig[] = [];
  if (Array.isArray(payload?.languages)) {
    for (const raw of payload.languages) {
      const lang = toSiteLanguage(raw, primary);
      if (lang) languages.push(lang);
    }
  }

  if (!languages.length) {
    for (const slug of supportedLocales) {
      languages.push({
        slug,
        locale: slug,
        home: "",
        urlPrefix: slug,
        isPrimary: slug === primary,
      });
    }
  }

  return { primaryLanguage: primary, languages };
});

export async function getPrimaryLocale(): Promise<Locale> {
  const cfg = await fetchSiteConfig();
  return cfg.primaryLanguage;
}
