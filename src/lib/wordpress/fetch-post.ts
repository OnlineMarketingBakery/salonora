import { wpFetchOptional } from "./client";
import type { WpPostRaw } from "@/types/wordpress";
import type { Locale } from "@/lib/i18n/locales";
import { normalizePostSections } from "@/lib/acf/normalize-post-sections";
import { mapYoastToSeo } from "@/lib/seo/map-yoast-to-metadata";
import type { GlobalSettings } from "@/types/globals";
import type { PostAuthorT, PostBreadcrumbParentT, PostDocument } from "@/types/documents";
import { asBool, asLink } from "@/lib/acf/field-mappers";
import {
  injectHeadingIds,
  markStyleTintedDivs,
  preparePostContentHtml,
  stripBlogBodyConclusionDuplicate,
  upgradeNumberedRows,
} from "@/lib/blog/post-html";
import { estimateReadMinutes } from "@/lib/blog/read-minutes";
import { toPlainText } from "@/lib/utils/strings";
import { fetchRelatedPostCards } from "./fetch-related-posts";
import { fetchSiteConfig } from "./fetch-site-config";
import {
  fetchBlogSingleTailSections,
  fetchBlogSingleTemplateShowRelatedPosts,
  resolveBlogShowRelatedPosts,
} from "./fetch-blog-single-tail-sections";
import { getBlogPageSlug } from "./config";
import { formatPostFullDate } from "@/lib/i18n/format-post-month-year";
import { resolveAuthorFromRestEmbed } from "@/lib/wordpress/wp-embedded-author";

async function resolvePostAuthor(p: WpPostRaw, lang: Locale): Promise<PostAuthorT> {
  return resolveAuthorFromRestEmbed(p._embedded?.author?.[0], p.author, lang, p.author_card);
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

function mapPostEyebrow(acf: Record<string, unknown>): string | null {
  const raw = acf.post_eyebrow;
  const text = typeof raw === "string" ? raw.trim() : "";
  return text || null;
}

function mapShowToc(acf: Record<string, unknown>): boolean {
  const v = acf.show_toc;
  if (v === undefined || v === null) return true;
  return asBool(v);
}

function toDoc(
  p: WpPostRaw,
  gs: GlobalSettings,
  lang: Locale,
  author: PostAuthorT,
  conclusionTitle?: string
): PostDocument {
  const acf = p.acf || {};
  const featured = p._embedded?.["wp:featuredmedia"]?.[0];
  const featuredForm = (acf as { featured_form?: { id?: number } | null }).featured_form;
  const showRelatedPosts = asBool((acf as { show_related_posts?: unknown }).show_related_posts);
  const rawHtml = p.content?.rendered || "";
  let prepared = preparePostContentHtml(rawHtml);
  if (conclusionTitle?.trim()) {
    prepared = stripBlogBodyConclusionDuplicate(prepared, conclusionTitle);
  }
  const content = injectHeadingIds(
    upgradeNumberedRows(markStyleTintedDivs(prepared))
  );
  return {
    kind: "post",
    id: p.id,
    slug: p.slug,
    title: p.title?.rendered || "",
    content,
    excerpt: p.excerpt?.rendered || "",
    postLeadHtml: mapPostLeadHtml(acf),
    postEyebrow: mapPostEyebrow(acf),
    featuredImage: featured?.source_url || null,
    featuredImageAlt: featured?.alt_text || "",
    featuredFormId: featuredForm && typeof featuredForm === "object" ? featuredForm.id || null : null,
    sections: normalizePostSections((acf as { post_sections?: unknown }).post_sections),
    layoutSections: [],
    seo: mapYoastToSeo(p, gs, { fallbackTitle: p.title?.rendered || "Post" }),
    publishedAt: p.date || "",
    dateLabel: formatPostFullDate(p.date, lang),
    readMinutes: estimateReadMinutes(prepared),
    author,
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
  const author = await resolvePostAuthor(raw, lang);
  const [layoutSections, templateShowRelated, siteConfig] = await Promise.all([
    fetchBlogSingleTailSections(lang, gs),
    fetchBlogSingleTemplateShowRelatedPosts(lang),
    fetchSiteConfig(),
  ]);
  const conclusionPanel = layoutSections.find((s) => s.type === "blog_conclusion_panel");
  const conclusionTitle =
    conclusionPanel?.type === "blog_conclusion_panel" ? conclusionPanel.title : undefined;
  const doc = toDoc(raw, gs, lang, author, conclusionTitle);
  const showRelatedPosts = resolveBlogShowRelatedPosts(templateShowRelated, doc.showRelatedPosts);
  let merged = { ...doc, layoutSections, showRelatedPosts };
  if (merged.showRelatedPosts) {
    const cats = Array.isArray(raw.categories) ? raw.categories : [];
    const relatedPosts = await fetchRelatedPostCards(lang, merged.id, cats, 3, siteConfig);
    merged = { ...merged, relatedPosts };
  }
  return { doc: merged, raw };
}
