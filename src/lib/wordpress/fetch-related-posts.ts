import { wpFetchOptional } from "@/lib/wordpress/client";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import { filterPostsByLocale } from "@/lib/i18n/post-language";
import type { SiteConfig } from "@/lib/wordpress/fetch-site-config";
import type { Locale } from "@/lib/i18n/locales";
import type { BlogPostOverviewCardT } from "@/types/sections";
import { stripTags, toPlainText } from "@/lib/utils/strings";
import { estimateReadMinutes } from "@/lib/blog/read-minutes";
import { formatPostMonthYear } from "@/lib/i18n/format-post-month-year";

type WpEmbeddedAuthor = {
  name?: string;
  avatar_urls?: Record<string, string | undefined>;
};

type WpPostListRow = {
  id: number;
  slug: string;
  link?: string;
  date?: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: { source_url?: string; alt_text?: string }[];
    author?: WpEmbeddedAuthor[];
  };
};

function mapRow(p: WpPostListRow, lang: Locale): BlogPostOverviewCardT {
  const titlePlain = stripTags(p.title.rendered);
  const featured = p._embedded?.["wp:featuredmedia"]?.[0];
  const author = p._embedded?.author?.[0];
  const avatar =
    author?.avatar_urls?.["96"] || author?.avatar_urls?.["48"] || author?.avatar_urls?.["24"] || null;
  const image =
    featured?.source_url && featured.source_url !== ""
      ? { url: featured.source_url, alt: featured.alt_text || titlePlain }
      : null;
  return {
    id: p.id,
    title: titlePlain,
    excerpt: toPlainText(p.excerpt?.rendered || ""),
    href: buildLocalePath(lang, p.slug),
    dateLabel: formatPostMonthYear(p.date, lang),
    authorName: author?.name?.trim() || "",
    authorAvatarUrl: avatar ?? null,
    readMinutes: estimateReadMinutes(p.content?.rendered),
    image,
  };
}

/**
 * Same-locale posts (NL/EN via `link` path), excluding the current post.
 * Prefers shared category; falls back to latest posts in that language when uncategorized.
 */
export async function fetchRelatedPostCards(
  lang: Locale,
  excludePostId: number,
  categoryIds: number[],
  limit: number,
  siteConfig?: SiteConfig
): Promise<BlogPostOverviewCardT[]> {
  const safeLimit = Math.min(12, Math.max(1, limit));
  const per = Math.min(24, Math.max(safeLimit, safeLimit * 4));
  const base = `exclude=${excludePostId}&per_page=${per}&orderby=date&order=desc&_embed=1`;
  const cat = categoryIds.find((id) => Number.isFinite(id) && id > 0);
  const path = cat ? `/wp/v2/posts?categories=${cat}&${base}` : `/wp/v2/posts?${base}`;
  const rows = await wpFetchOptional<WpPostListRow[]>(path, { lang, revalidate: 60 });
  if (!Array.isArray(rows)) return [];
  const localeScoped = filterPostsByLocale(rows, lang, siteConfig);
  const pool = localeScoped.length > 0 ? localeScoped : rows;
  return pool.slice(0, safeLimit).map((p) => mapRow(p, lang));
}
