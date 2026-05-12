import { wpFetchCollectionOptional, wpFetchOptional } from "@/lib/wordpress/client";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import type { BlogPostOverviewCardT } from "@/types/sections";
import { stripTags, toPlainText } from "@/lib/utils/strings";
import { estimateReadMinutes } from "@/lib/blog/read-minutes";
import { formatPostMonthYear } from "@/lib/i18n/format-post-month-year";

type WpEmbeddedAuthor = {
  name?: string;
  slug?: string;
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

export function mapWpPostListRowToBlogOverviewCard(p: WpPostListRow, lang: Locale): BlogPostOverviewCardT {
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

export async function fetchBlogPostsCollection(options: {
  lang: Locale;
  page: number;
  perPage: number;
  search: string;
}): Promise<{ items: BlogPostOverviewCardT[]; total: number; totalPages: number } | null> {
  const { lang, page, perPage, search } = options;
  const safePer = Math.min(100, Math.max(1, perPage));
  const safePage = Math.max(1, page);
  const params = new URLSearchParams({
    per_page: String(safePer),
    page: String(safePage),
    _embed: "1",
    orderby: "date",
    order: "desc",
  });
  const q = search.trim();
  if (q) params.set("search", q);
  const path = `/wp/v2/posts?${params.toString()}`;
  const res = await wpFetchCollectionOptional<WpPostListRow[]>(path, { lang, revalidate: 30 });
  if (!res) return null;
  const items = Array.isArray(res.data) ? res.data.map((p) => mapWpPostListRowToBlogOverviewCard(p, lang)) : [];
  return { items, total: res.total, totalPages: res.totalPages };
}

/** Single post for pinned “featured” slot on the blog archive (page 1). */
export async function fetchBlogOverviewPostCardById(
  lang: Locale,
  postId: number
): Promise<BlogPostOverviewCardT | null> {
  if (!Number.isFinite(postId) || postId < 1) return null;
  const row = await wpFetchOptional<WpPostListRow>(`/wp/v2/posts/${postId}?_embed=1`, { lang, revalidate: 30 });
  if (!row?.id) return null;
  return mapWpPostListRowToBlogOverviewCard(row, lang);
}
