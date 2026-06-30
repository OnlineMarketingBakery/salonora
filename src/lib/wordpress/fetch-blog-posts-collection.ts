import { wpFetchCollectionOptional, wpFetchOptional } from "@/lib/wordpress/client";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import { filterPostsByLocale } from "@/lib/i18n/post-language";
import type { SiteConfig } from "@/lib/wordpress/fetch-site-config";
import { fetchWordPressPostsPerPage } from "@/lib/wordpress/fetch-wordpress-posts-per-page";
import type { BlogPostOverviewCardT } from "@/types/sections";
import { stripTags, toPlainText } from "@/lib/utils/strings";
import { estimateReadMinutes } from "@/lib/blog/read-minutes";
import { formatPostFullDate } from "@/lib/i18n/format-post-month-year";
import { authorFromOmbCard, resolveWpAuthorAvatarUrl } from "@/lib/wordpress/wp-embedded-author";
import { resolvePublicMediaSrc } from "@/lib/utils/media";
import type { OmbAuthorCard, WpEmbeddedAuthor } from "@/types/wordpress";

type WpPostListRow = {
  id: number;
  slug: string;
  date?: string;
  link?: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  author_card?: OmbAuthorCard | null;
  _embedded?: {
    "wp:featuredmedia"?: { source_url?: string; alt_text?: string }[];
    author?: WpEmbeddedAuthor[];
  };
};

const PROBE_PER_PAGE = 100;

function postsListPath(opts: {
  perPage: number;
  page: number;
  search: string;
}): string {
  const params = new URLSearchParams({
    per_page: String(opts.perPage),
    page: String(opts.page),
    _embed: "1",
    orderby: "date",
    order: "desc",
  });
  const q = opts.search.trim();
  if (q) params.set("search", q);
  return `/wp/v2/posts?${params.toString()}`;
}

export function mapWpPostListRowToBlogOverviewCard(p: WpPostListRow, lang: Locale): BlogPostOverviewCardT {
  const titlePlain = stripTags(p.title.rendered);
  const featured = p._embedded?.["wp:featuredmedia"]?.[0];
  const author = p._embedded?.author?.[0];
  // Prefer author_card (works while /wp/v2/users is locked down); fall back to embed.
  const fromCard = authorFromOmbCard(p.author_card);
  const authorName = fromCard?.name || author?.name?.trim() || "";
  const authorAvatarUrl = fromCard?.avatarUrl ?? resolveWpAuthorAvatarUrl(author) ?? null;
  const image =
    featured?.source_url && featured.source_url !== ""
      ? {
          url: resolvePublicMediaSrc(featured.source_url) ?? featured.source_url,
          alt: featured.alt_text || titlePlain,
        }
      : null;
  return {
    id: p.id,
    title: titlePlain,
    excerpt: toPlainText(p.excerpt?.rendered || ""),
    href: buildLocalePath(lang, p.slug),
    dateLabel: formatPostFullDate(p.date, lang),
    authorName,
    authorAvatarUrl,
    readMinutes: estimateReadMinutes(p.content?.rendered),
    image,
  };
}

export type BlogPostsCollectionResult = {
  items: BlogPostOverviewCardT[];
  total: number;
  totalPages: number;
  perPage: number;
};

export async function fetchBlogPostsCollection(options: {
  lang: Locale;
  page: number;
  perPage?: number;
  search: string;
  siteConfig?: SiteConfig;
}): Promise<BlogPostsCollectionResult | null> {
  const { lang, page, search, siteConfig } = options;
  const resolvedPerPage = options.perPage ?? (await fetchWordPressPostsPerPage());
  const safePer = Math.min(100, Math.max(1, resolvedPerPage));
  const safePage = Math.max(1, page);
  const path = postsListPath({ perPage: safePer, page: safePage, search });
  const res = await wpFetchCollectionOptional<WpPostListRow[]>(path, { lang, revalidate: 30 });
  if (!res) return null;

  const raw = Array.isArray(res.data) ? res.data : [];
  const filtered = filterPostsByLocale(raw, lang, siteConfig);
  const items = filtered.map((p) => mapWpPostListRowToBlogOverviewCard(p, lang));

  let total = res.total;
  let totalPages = res.totalPages;

  const searchQ = search.trim();
  const localeLeak = !searchQ && filtered.length < raw.length;

  if (localeLeak) {
    const probePath = postsListPath({ perPage: PROBE_PER_PAGE, page: 1, search: "" });
    const probe = await wpFetchCollectionOptional<WpPostListRow[]>(probePath, { lang, revalidate: 30 });
    if (probe && probe.totalPages === 1) {
      total = probe.total;
      totalPages = probe.totalPages;
    }
  }

  console.log("[salonora] blogArchiveFetch", {
    per_page: safePer,
    page: safePage,
    lang,
    xWpTotal: total,
    xWpTotalPages: totalPages,
    localeLeak,
  });

  return { items, total, totalPages, perPage: safePer };
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
