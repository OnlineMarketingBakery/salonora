import { supportedLocales } from "@/lib/i18n/config";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import { wpFetchCollectionOptional } from "@/lib/wordpress/client";
import { getCptRestBase, getSiteUrl } from "@/lib/wordpress/config";
import { mapWordPressPermalinkToAppPathname } from "@/lib/wordpress/wp-url-to-app-pathname";
import type { WpYoastHeadJson } from "@/types/wordpress";

export type SitemapEntry = {
  url: string;
  lastModified?: Date;
};

type WpSitemapRaw = {
  slug: string;
  modified?: string;
  modified_gmt?: string;
  link?: string;
  yoast_head_json?: WpYoastHeadJson;
};

function isIndexable(item: WpSitemapRaw): boolean {
  const index = item.yoast_head_json?.robots?.index;
  return index !== "noindex";
}

function parseModified(item: WpSitemapRaw): Date | undefined {
  const raw = item.modified_gmt || item.modified;
  if (!raw) return undefined;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function itemPath(item: WpSitemapRaw, lang: Locale): string {
  if (item.link) {
    return mapWordPressPermalinkToAppPathname(item.link, lang);
  }
  return buildLocalePath(lang, item.slug);
}

async function fetchAllForEndpoint(
  endpoint: string,
  lang: Locale
): Promise<WpSitemapRaw[]> {
  const items: WpSitemapRaw[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const sep = endpoint.includes("?") ? "&" : "?";
    const path = `${endpoint}${sep}per_page=100&page=${page}&status=publish`;
    const res = await wpFetchCollectionOptional<WpSitemapRaw[]>(path, {
      lang,
      revalidate: 3600,
    });
    if (!res?.data?.length) break;
    items.push(...res.data);
    totalPages = res.totalPages;
    page += 1;
  }

  return items;
}

/** Collect public marketing URLs for sitemap.xml from WordPress REST. */
export async function fetchSitemapEntries(): Promise<SitemapEntry[]> {
  const site = getSiteUrl().replace(/\/$/, "");
  const seen = new Set<string>();
  const entries: SitemapEntry[] = [];

  const push = (path: string, lastModified?: Date) => {
    const url = `${site}${path.startsWith("/") ? path : `/${path}`}`;
    if (seen.has(url)) return;
    seen.add(url);
    entries.push({ url, lastModified });
  };

  for (const lang of supportedLocales) {
    push(buildLocalePath(lang, ""));

    const endpoints = [
      "/wp/v2/pages",
      "/wp/v2/posts",
      `/wp/v2/${getCptRestBase("service")}`,
      `/wp/v2/${getCptRestBase("case_study")}`,
    ];

    for (const endpoint of endpoints) {
      const batch = await fetchAllForEndpoint(endpoint, lang as Locale);
      for (const item of batch) {
        if (!item.slug || !isIndexable(item)) continue;
        push(itemPath(item, lang as Locale), parseModified(item));
      }
    }
  }

  return entries;
}
