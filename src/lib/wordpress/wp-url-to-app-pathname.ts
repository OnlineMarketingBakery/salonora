import { buildLocalePath, getPrimaryLocaleSync, stripPrimaryLocalePrefix } from "@/lib/i18n/locale-url";
import type { Locale } from "@/lib/i18n/locales";
import { getSiteUrl, getWordpressBaseUrl } from "./config";

/**
 * Map a WordPress `link` (permalink) to the app pathname.
 */
export function mapWordPressPermalinkToAppPathname(url: string, lang: Locale): string {
  const site = getSiteUrl();
  const wp = getWordpressBaseUrl();
  const normalize = (p: string) => {
    const t = p.replace(/\/$/, "");
    return t || "/";
  };
  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return buildLocalePath(lang, url.split("?")[0]!.split("#")[0]!.replace(/^\//, ""));
  }
  const n = normalize(pathname);

  const stripSiteBase = (p: string) => {
    const base = new URL(site).pathname.replace(/\/$/, "");
    if (base && p.startsWith(base)) {
      return normalize(p.slice(base.length)) || "/";
    }
    return p;
  };

  const mapPath = (rel: string) => {
    const stripped = stripPrimaryLocalePrefix(rel === "/" ? "/" : rel);
    const slug = stripped === "/" ? "" : stripped.replace(/^\//, "");
    return buildLocalePath(lang, slug);
  };

  if (url.startsWith(site) || url.startsWith(`${site}/`)) {
    return mapPath(stripSiteBase(n));
  }

  if (url.startsWith(wp) || url.startsWith(`${wp}/`)) {
    if (n === "/" || n === "") {
      return buildLocalePath(lang, "");
    }
    const rest = n.replace(/^\//, "").replace("wp-content", "");
    if (!rest || rest === "/") {
      return buildLocalePath(lang, "");
    }
    return mapPath(`/${rest}`);
  }

  return buildLocalePath(lang, n.replace(/^\//, ""));
}

export function isPrimaryLanguage(lang: Locale): boolean {
  return lang === getPrimaryLocaleSync();
}
