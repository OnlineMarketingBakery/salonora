import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import { getSiteUrl, getWordpressBaseUrl } from "./config";

/**
 * Map a WordPress `link` (permalink) to the app pathname: `/{lang}/...`
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
    return buildLocalePath(
      lang,
      url
        .split("?")[0]!
        .split("#")[0]!
        .replace(/^\//, "")
    );
  }
  const n = normalize(pathname);

  const stripSiteBase = (p: string) => {
    const base = new URL(site).pathname.replace(/\/$/, "");
    if (base && p.startsWith(base)) {
      return normalize(p.slice(base.length)) || "/";
    }
    return p;
  };

  if (url.startsWith(site) || url.startsWith(`${site}/`)) {
    const rel = stripSiteBase(n);
    if (rel.startsWith(`/${lang}/`) || rel === `/${lang}`) {
      return rel;
    }
    if (rel === "" || rel === "/") {
      return `/${lang}`;
    }
    return buildLocalePath(
      lang,
      rel
        .replace(/^\//, "")
        .replace(new RegExp(`^${lang}/`), "")
    );
  }

  if (url.startsWith(wp) || url.startsWith(`${wp}/`)) {
    if (n.startsWith(`/${lang}/`) || n === `/${lang}`) {
      return n;
    }
    if (n === "/" || n === "") {
      return `/${lang}`;
    }
    const rest = n
      .replace(/^\//, "")
      .replace("wp-content", "");
    if (!rest || rest === "/") {
      return `/${lang}`;
    }
    if (rest.startsWith(`${lang}/`)) {
      return `/${rest}`;
    }
    return buildLocalePath(lang, rest);
  }

  return buildLocalePath(lang, n.replace(/^\//, ""));
}
