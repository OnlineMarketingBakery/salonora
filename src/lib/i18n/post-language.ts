import type { Locale } from "@/lib/i18n/locales";
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
 * All locales use `/{prefix}/` on the Next.js frontend.
 */
function postMatchesLocaleWithWpPrefixes<T extends PostWithLink>(
  post: T,
  lang: Locale,
  siteConfig: SiteConfig
): boolean {
  const link = post.link ?? "";
  const langConfig = siteConfig.languages.find((l) => l.slug === lang);
  const otherPrefixes = otherWpLinkPrefixes(siteConfig, lang);

  if (langConfig?.urlPrefix) {
    if (link.includes(wpLinkPrefixPath(langConfig.urlPrefix))) {
      return true;
    }
    // Polylang primary-language CPTs often omit /{prefix}/ in REST `link` URLs (e.g. /services/…).
    if (lang === siteConfig.primaryLanguage && !otherPrefixes.some((p) => link.includes(p))) {
      return true;
    }
    return false;
  }

  if (otherPrefixes.length > 0) {
    return !otherPrefixes.some((p) => link.includes(p));
  }

  return postMatchesLocaleLegacy(post, lang);
}

function postMatchesLocaleLegacy<T extends PostWithLink>(post: T, lang: Locale): boolean {
  const link = post.link ?? "";
  return link.includes(`/${lang}/`);
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
