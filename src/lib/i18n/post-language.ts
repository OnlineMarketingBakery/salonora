import type { Locale } from "@/lib/i18n/locales";

/**
 * Maps each locale to its URL slug in Polylang's pretty permalinks.
 * The default locale (en) has NO URL prefix on this WordPress install,
 * so its slug is null. Non-default locales appear as /{slug}/ in the link.
 */
const LOCALE_URL_SLUG: Record<Locale, string | null> = {
  en: null,    // default locale, no prefix
  nl: "/nl/",
  // extend as locales are added — string for non-default, null for default
};

export type PostWithLink = {
  link?: string;
};

export function postMatchesLocale<T extends PostWithLink>(
  post: T,
  lang: Locale
): boolean {
  const link = post.link ?? "";
  const ownSlug = LOCALE_URL_SLUG[lang];

  if (ownSlug) {
    // Non-default locale: link must contain its slug
    return link.includes(ownSlug);
  }
  // Default locale: link must contain none of the non-default slugs
  return !Object.values(LOCALE_URL_SLUG)
    .filter((s): s is string => s !== null)
    .some((s) => link.includes(s));
}

export function filterPostsByLocale<T extends PostWithLink>(
  posts: T[],
  lang: Locale
): T[] {
  return posts.filter((p) => postMatchesLocale(p, lang));
}
