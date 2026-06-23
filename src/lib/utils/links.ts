import { buildLocalePath, getPrimaryLocaleSync, stripLocalePrefix } from "@/lib/i18n/locale-url";
import type { Locale } from "@/lib/i18n/locales";
import type { WpAcfLink } from "@/types/wordpress";
import { getWordpressBaseUrl, getSiteUrl } from "@/lib/wordpress/config";

function toAppHref(path: string, lang: Locale): string {
  let p = path.startsWith("/") ? path : `/${path}`;
  p = stripLocalePrefix(p);
  const slug = p === "/" ? "" : p.replace(/^\//, "");
  return buildLocalePath(lang, slug);
}

/**
 * Resolves ACF link field to a front-end path or absolute URL.
 */
export function resolveLink(
  link: WpAcfLink | null | undefined,
  lang: Locale
): { href: string; label: string; target?: string } | null {
  if (!link) return null;
  const label = link.title || link.url || "";
  if (!link.url) return null;
  const site = getSiteUrl();
  const wp = getWordpressBaseUrl();
  const url = link.url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (url.startsWith(site) || url.startsWith(`${site}/`)) {
      const path = new URL(url).pathname.replace(new URL(site).pathname, "") || "/";
      return { href: toAppHref(path, lang), label, target: link.target || undefined };
    }
    if (url.startsWith(wp) || url.startsWith(`${wp}/`)) {
      const path = new URL(url).pathname;
      return { href: toAppHref(path, lang), label, target: link.target || undefined };
    }
    return { href: url, label, target: link.target || undefined };
  }
  if (url.startsWith("/")) {
    return { href: toAppHref(url, lang), label, target: link.target || undefined };
  }
  return { href: url, label, target: link.target || undefined };
}

export function isPrimaryLocale(lang: Locale): boolean {
  return lang === getPrimaryLocaleSync();
}
