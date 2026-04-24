import { getSiteUrl, getWordpressBaseUrl, getMenuId } from "./config";
import { wpFetchOptional } from "./client";
import type { MenuItem } from "@/types/menu";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import { logger } from "@/lib/utils/logger";

type WpMenuItem = {
  id: number;
  parent: number;
  title: { rendered: string };
  url: string;
  menu_order: number;
  target: string;
};

function mapUrlToHref(url: string, lang: Locale): string {
  const site = getSiteUrl();
  const wp = getWordpressBaseUrl();
  try {
    if (url.startsWith(site)) {
      const p = new URL(url).pathname.replace(new URL(site).pathname, "");
      if (p.startsWith(`/${lang}/`) || p === `/${lang}`) return p;
      if (p === "" || p === "/") return `/${lang}`;
      return buildLocalePath(lang, p.replace(/^\//, "").replace(new RegExp(`^${lang}/`), ""));
    }
    if (url.startsWith(wp) || url.startsWith(`${wp}/`)) {
      const p = new URL(url).pathname;
      if (p.startsWith(`/${lang}/`) || p === `/${lang}`) return p;
      if (p === "" || p === "/") return `/${lang}`;
      const rest = p.replace(/^\//, "").replace("wp-content", "");
      if (!rest || rest === "/") return `/${lang}`;
      return buildLocalePath(lang, rest);
    }
  } catch {
    /* keep url */
  }
  return url;
}

function toTree(items: WpMenuItem[], lang: Locale): MenuItem[] {
  const sorted = [...items].sort((a, b) => a.menu_order - b.menu_order);
  const byParent = new Map<number | 0, WpMenuItem[]>();
  for (const it of sorted) {
    const p = (it.parent || 0) as 0;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p)!.push(it);
  }
  const build = (parentId: number | 0): MenuItem[] => {
    const ch = byParent.get(parentId) || [];
    return ch.map((it) => ({
      id: it.id,
      label: it.title?.rendered || String(it.id),
      href: mapUrlToHref(it.url, lang),
      target: it.target || undefined,
      children: build(it.id),
    }));
  };
  return build(0);
}

/**
 * Fetches a WordPress menu by id (configure `WP_MENU_{LOCATION}_{LOCALE}`) and returns a tree.
 * Requires a REST route for `menu-items` (core or a small plugin) to be available.
 */
export async function fetchMenu(
  location: "primary" | "footer" | "legal",
  lang: Locale
): Promise<MenuItem[]> {
  const menuId = getMenuId(location, lang);
  if (!menuId) return [];
  try {
    const items = await wpFetchOptional<WpMenuItem[]>(
      `/wp/v2/menu-items?menus=${menuId}&per_page=100&orderby=menu_order&order=asc`,
      { lang, revalidate: 60 }
    );
    if (!items || !Array.isArray(items) || !items.length) {
      return [];
    }
    return toTree(items, lang);
  } catch (e) {
    logger.warn("fetchMenu", e);
    return [];
  }
}
