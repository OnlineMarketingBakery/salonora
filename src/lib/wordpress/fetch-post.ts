import { wpFetchOptional } from "./client";
import type { WpPostRaw } from "@/types/wordpress";
import type { Locale } from "@/lib/i18n/locales";
import { normalizePostSections } from "@/lib/acf/normalize-post-sections";
import { mapYoastToSeo } from "@/lib/seo/map-yoast-to-metadata";
import type { GlobalSettings } from "@/types/globals";
import type { PostAuthorT, PostBreadcrumbParentT, PostDocument } from "@/types/documents";
import { asBool, asLink } from "@/lib/acf/field-mappers";
import { injectHeadingIds, markStyleTintedDivs } from "@/lib/blog/post-html";
import { estimateReadMinutes } from "@/lib/blog/read-minutes";
import { toPlainText } from "@/lib/utils/strings";
import { fetchRelatedPostCards } from "./fetch-related-posts";
import { getBlogPageSlug } from "./config";
import { formatPostMonthYear } from "@/lib/i18n/format-post-month-year";

function mapEmbeddedAuthor(p: WpPostRaw): PostAuthorT {
  const u = p._embedded?.author?.[0];
  const name = u?.name?.trim() || "";
  const avatarUrl =
    u?.avatar_urls?.["96"] || u?.avatar_urls?.["48"] || u?.avatar_urls?.["24"] || null;
  const rawUrl = typeof u?.url === "string" && u.url.trim() ? u.url.trim() : null;
  const linkedinUrl = rawUrl && /linkedin\.com/i.test(rawUrl) ? rawUrl : null;
  const profileUrl = rawUrl && !linkedinUrl ? rawUrl : null;
  const bio = toPlainText(u?.description || "");
  return {
    name,
    avatarUrl,
    bio,
    profileUrl,
    linkedinUrl,
  };
}

function mapBreadcrumbParent(acf: Record<string, unknown>): PostBreadcrumbParentT | null {
  const link = asLink(acf.breadcrumb_parent);
  if (!link?.url?.trim()) return null;
  const href = link.url.trim();
  const label = (link.title && link.title.trim()) || href;
  return { label, href };
}

function mapPostLeadHtml(acf: Record<string, unknown>): string | null {
  const raw = acf.post_lead;
  const html = typeof raw === "string" ? raw.trim() : "";
  if (!html || !toPlainText(html).trim()) return null;
  return html;
}

function mapShowToc(acf: Record<string, unknown>): boolean {
  const v = acf.show_toc;
  if (v === undefined || v === null) return true;
  return asBool(v);
}

function toDoc(p: WpPostRaw, gs: GlobalSettings, lang: Locale): PostDocument {
  const acf = p.acf || {};
  const featured = p._embedded?.["wp:featuredmedia"]?.[0];
  const featuredForm = (acf as { featured_form?: { id?: number } | null }).featured_form;
  const showRelatedPosts = asBool((acf as { show_related_posts?: unknown }).show_related_posts);
  const rawHtml = p.content?.rendered || "";
  const content = injectHeadingIds(markStyleTintedDivs(rawHtml));
  return {
    kind: "post",
    id: p.id,
    slug: p.slug,
    title: p.title?.rendered || "",
    content,
    excerpt: p.excerpt?.rendered || "",
    postLeadHtml: mapPostLeadHtml(acf),
    featuredImage: featured?.source_url || null,
    featuredImageAlt: featured?.alt_text || "",
    featuredFormId: featuredForm && typeof featuredForm === "object" ? featuredForm.id || null : null,
    sections: normalizePostSections((acf as { post_sections?: unknown }).post_sections),
    seo: mapYoastToSeo(p, gs, { fallbackTitle: p.title?.rendered || "Post" }),
    publishedAt: p.date || "",
    dateLabel: formatPostMonthYear(p.date, lang),
    readMinutes: estimateReadMinutes(rawHtml),
    author: mapEmbeddedAuthor(p),
    showRelatedPosts,
    relatedPosts: [],
    blogArchivePath: getBlogPageSlug(lang),
    breadcrumbParent: mapBreadcrumbParent(acf),
    showToc: mapShowToc(acf),
  };
}

export async function fetchPostBySlug(
  lang: Locale,
  slug: string,
  gs: GlobalSettings
): Promise<{ doc: PostDocument; raw: WpPostRaw } | null> {
  const list = await wpFetchOptional<WpPostRaw[]>(
    `/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1&acf_format=standard`,
    { lang, revalidate: 60 }
  );
  if (!list?.[0]) return null;
  const raw = list[0];
  const doc = toDoc(raw, gs, lang);
  if (doc.showRelatedPosts) {
    const cats = Array.isArray(raw.categories) ? raw.categories : [];
    const relatedPosts = await fetchRelatedPostCards(lang, doc.id, cats, 3);
    return { doc: { ...doc, relatedPosts }, raw };
  }
  return { doc, raw };
}
