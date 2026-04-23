import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import type { WpAcfLink } from "@/types/wordpress";
import { getWordpressBaseUrl, getSiteUrl } from "@/lib/wordpress/config";

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
      return { href: path, label, target: link.target || undefined };
    }
    if (url.startsWith(wp) || url.startsWith(`${wp}/`)) {
      const path = new URL(url).pathname;
      if (path.startsWith(`/${lang}/`) || path === `/${lang}`) {
        return { href: path, label, target: link.target || undefined };
      }
      return { href: buildLocalePath(lang, path.replace(/^\//, "")), label, target: link.target || undefined };
    }
    return { href: url, label, target: link.target || undefined };
  }
  if (url.startsWith("/")) {
    if (url.startsWith(`/${lang}/`) || url === `/${lang}`) {
      return { href: url, label, target: link.target || undefined };
    }
    if (url.startsWith("/") && !url.startsWith(`/${lang}`)) {
      return { href: buildLocalePath(lang, url.replace(/^\//, "")), label, target: link.target || undefined };
    }
  }
  return { href: url, label, target: link.target || undefined };
}
