import { cache } from "react";
import { getSiteUrl, getWordpressBaseUrl, getMenuId, getOmbHeadlessRestPrefix } from "./config";
import { wpFetchOptional } from "./client";
import type { MenuItem } from "@/types/menu";
import { buildLocalePath, stripLocalePrefix } from "@/lib/i18n/locale-url";
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
    const toHref = (pathname: string) => {
      const stripped = stripLocalePrefix(pathname === "/" ? "/" : pathname);
      const slug = stripped === "/" ? "" : stripped.replace(/^\//, "");
      return buildLocalePath(lang, slug);
    };
    if (url.startsWith(site)) {
      const p = new URL(url).pathname.replace(new URL(site).pathname, "") || "/";
      return toHref(p);
    }
    if (url.startsWith(wp) || url.startsWith(`${wp}/`)) {
      const p = new URL(url).pathname;
      return toHref(p);
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

type OmbMenuPayload = {
  location: string;
  lang: string;
  menu_id: number;
  items: WpMenuItem[];
};

/**
 * Fetches a WordPress menu and returns a tree.
 *
 * 1) If `WP_MENU_{LOCATION}_{LOCALE}` is set, uses the core `wp/v2/menu-items` route.
 *    Requires that route to be public (auth-locked by default — set `show_in_rest`
 *    on the menu, or supply an Application Password).
 * 2) Otherwise falls back to the headless plugin route
 *    `/omb-headless/v1/menu?location=…&lang=…` which is public and resolves the
 *    menu ID server-side from the theme location (Polylang-aware).
 */
export const fetchMenu = cache(async (
  location: "primary" | "footer" | "legal",
  lang: Locale
): Promise<MenuItem[]> => {
  const menuId = getMenuId(location, lang);
  if (menuId) {
    try {
      const items = await wpFetchOptional<WpMenuItem[]>(
        `/wp/v2/menu-items?menus=${menuId}&per_page=100&orderby=menu_order&order=asc`,
        { lang, revalidate: 60 }
      );
      if (items && Array.isArray(items) && items.length) {
        return toTree(items, lang);
      }
    } catch (e) {
      logger.warn("fetchMenu", e);
    }
  }

  try {
    const payload = await wpFetchOptional<OmbMenuPayload>(
      `${getOmbHeadlessRestPrefix()}/menu?location=${encodeURIComponent(location)}&lang=${encodeURIComponent(lang)}`,
      { lang, revalidate: 60 }
    );
    if (payload && Array.isArray(payload.items) && payload.items.length) {
      return toTree(payload.items, lang);
    }
  } catch (e) {
    logger.warn("fetchMenu fallback", e);
  }

  return [];
});
