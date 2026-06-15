import type { Locale } from "@/lib/i18n/locales";
import { getPrimaryLocaleSync, getSecondaryLocales } from "@/lib/i18n/locale-url";
import type { SiteConfig } from "@/lib/wordpress/fetch-site-config";

export type PostWithLink = {
  link?: string;
};

function wpLinkPrefixPath(prefix: string): string {
  return `/${prefix}/`;
}

function otherWpLinkPrefixes(siteConfig: SiteConfig, lang: Locale): string[] {
  return siteConfig.languages
    .filter((l) => l.slug !== lang && l.urlPrefix)
    .map((l) => wpLinkPrefixPath(l.urlPrefix!));
}

/**
 * Match REST `link` URLs to a locale using WP Polylang `url_prefix` from site config.
 * WP default language posts have no prefix; translated posts use `/{prefix}/`.
 */
function postMatchesLocaleWithWpPrefixes<T extends PostWithLink>(
  post: T,
  lang: Locale,
  siteConfig: SiteConfig
): boolean {
  const link = post.link ?? "";
  const langConfig = siteConfig.languages.find((l) => l.slug === lang);

  if (langConfig?.urlPrefix) {
    return link.includes(wpLinkPrefixPath(langConfig.urlPrefix));
  }

  const otherPrefixes = otherWpLinkPrefixes(siteConfig, lang);
  if (otherPrefixes.length > 0) {
    return !otherPrefixes.some((p) => link.includes(p));
  }

  return postMatchesLocaleLegacy(post, lang);
}

/** Fallback when site config is unavailable (dev / offline WP). */
function postMatchesLocaleLegacy<T extends PostWithLink>(post: T, lang: Locale): boolean {
  const link = post.link ?? "";
  const ownSlug = lang === getPrimaryLocaleSync() ? null : `/${lang}/`;

  if (ownSlug) {
    return link.includes(ownSlug);
  }

  const secondaryPrefixes = getSecondaryLocales().map((l) => `/${l}/`);
  return !secondaryPrefixes.some((s) => link.includes(s));
}

export function postMatchesLocale<T extends PostWithLink>(
  post: T,
  lang: Locale,
  siteConfig?: SiteConfig
): boolean {
  if (siteConfig?.languages.length) {
    return postMatchesLocaleWithWpPrefixes(post, lang, siteConfig);
  }
  return postMatchesLocaleLegacy(post, lang);
}

export function filterPostsByLocale<T extends PostWithLink>(
  posts: T[],
  lang: Locale,
  siteConfig?: SiteConfig
): T[] {
  return posts.filter((p) => postMatchesLocale(p, lang, siteConfig));
}
