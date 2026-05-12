import { wpFetchOptional } from "@/lib/wordpress/client";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
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
 * Same-language posts sharing the first category, excluding the current post.
 */
export async function fetchRelatedPostCards(
  lang: Locale,
  excludePostId: number,
  categoryIds: number[],
  limit: number
): Promise<BlogPostOverviewCardT[]> {
  const cat = categoryIds.find((id) => Number.isFinite(id) && id > 0);
  if (!cat) return [];
  const per = Math.min(12, Math.max(1, limit));
  const path = `/wp/v2/posts?categories=${cat}&exclude=${excludePostId}&per_page=${per}&orderby=date&order=desc&_embed=1`;
  const rows = await wpFetchOptional<WpPostListRow[]>(path, { lang, revalidate: 60 });
  if (!Array.isArray(rows)) return [];
  return rows.map((p) => mapRow(p, lang));
}
