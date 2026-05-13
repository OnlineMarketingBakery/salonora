import { wpFetchOptional } from "@/lib/wordpress/client";
import { getCaseStudyArchiveSlug, getCptRestBase } from "@/lib/wordpress/config";
import type { WpCaseStudyRaw } from "@/types/wordpress";
import type { Locale } from "@/lib/i18n/locales";
import { mapYoastToSeo } from "@/lib/seo/map-yoast-to-metadata";
import type { GlobalSettings } from "@/types/globals";
import type { CaseStudyDocument, PostAuthorT, PostBreadcrumbParentT } from "@/types/documents";
import { normalizePageSections } from "@/lib/acf/normalize-page-sections";
import { asBool, asLink } from "@/lib/acf/field-mappers";
import { injectHeadingIds, markStyleTintedDivs } from "@/lib/blog/post-html";
import { estimateReadMinutes } from "@/lib/blog/read-minutes";
import { stripTags, toPlainText } from "@/lib/utils/strings";
import { formatPostMonthYear } from "@/lib/i18n/format-post-month-year";
import { caseStudyOutcomeMetricsFromAcf } from "@/lib/wordpress/fetch-case-studies-collection";
import { fetchRelatedCaseStudyCards } from "@/lib/wordpress/fetch-related-case-studies";
import { htmlRoughFromCaseStudySections } from "@/lib/case-study-body";

function mapEmbeddedAuthor(p: WpCaseStudyRaw): PostAuthorT {
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

function mapCaseStudyLeadHtml(acf: Record<string, unknown>): string | null {
  const raw = acf.case_study_lead;
  const html = typeof raw === "string" ? raw.trim() : "";
  if (!html || !toPlainText(html).trim()) return null;
  return html;
}

function mapShowToc(acf: Record<string, unknown>): boolean {
  const v = acf.show_toc;
  if (v === undefined || v === null) return true;
  return asBool(v);
}

function mapShowRelatedCaseStudies(acf: Record<string, unknown>): boolean {
  const v = acf.show_related_case_studies;
  if (v === undefined || v === null) return true;
  return asBool(v);
}

function toDoc(p: WpCaseStudyRaw, gs: GlobalSettings, lang: Locale): CaseStudyDocument {
  const acf = p.acf || {};
  const featured = p._embedded?.["wp:featuredmedia"]?.[0];
  const featuredForm = (acf as { featured_form?: { id?: number } | null }).featured_form;
  const rawHtml = p.content?.rendered || "";
  const content = injectHeadingIds(markStyleTintedDivs(rawHtml));
  const projectLabel = stripTags(String(acf.case_study_project_label ?? "")).trim();
  const showRelatedCaseStudies = mapShowRelatedCaseStudies(acf);
  const flexibleRaw =
    (acf as { case_study_sections?: unknown }).case_study_sections ??
    (acf as { page_sections?: unknown }).page_sections;
  const sections = normalizePageSections(flexibleRaw);
  const leadHtml = mapCaseStudyLeadHtml(acf) || "";
  const readSource = [rawHtml, leadHtml, htmlRoughFromCaseStudySections(sections)].filter(Boolean).join(" ");
  const readMinutes = estimateReadMinutes(readSource);
  return {
    kind: "case_study",
    id: p.id,
    slug: p.slug,
    title: p.title?.rendered || "",
    content,
    excerpt: p.excerpt?.rendered || "",
    caseStudyLeadHtml: mapCaseStudyLeadHtml(acf),
    featuredImage: featured?.source_url || null,
    featuredImageAlt: featured?.alt_text || "",
    featuredFormId: featuredForm && typeof featuredForm === "object" ? featuredForm.id || null : null,
    sections,
    seo: mapYoastToSeo(p, gs, { fallbackTitle: p.title?.rendered || "Case study" }),
    publishedAt: p.date || "",
    dateLabel: formatPostMonthYear(p.date, lang),
    readMinutes,
    author: mapEmbeddedAuthor(p),
    showRelatedCaseStudies,
    relatedCaseStudies: [],
    caseStudyArchivePath: getCaseStudyArchiveSlug(lang),
    breadcrumbParent: mapBreadcrumbParent(acf),
    showToc: mapShowToc(acf),
    projectLabel,
    outcomeMetrics: caseStudyOutcomeMetricsFromAcf(acf),
  };
}

export async function fetchCaseStudyBySlug(
  lang: Locale,
  slug: string,
  gs: GlobalSettings
): Promise<{ doc: CaseStudyDocument; raw: WpCaseStudyRaw } | null> {
  const rest = getCptRestBase("case_study");
  const list = await wpFetchOptional<WpCaseStudyRaw[]>(
    `/wp/v2/${rest}?slug=${encodeURIComponent(slug)}&_embed=1&acf_format=standard`,
    { lang, revalidate: 60 }
  );
  if (!list?.[0]) return null;
  const raw = list[0];
  const doc = toDoc(raw, gs, lang);
  if (!doc.showRelatedCaseStudies) {
    return { doc, raw };
  }
  const relatedCaseStudies = await fetchRelatedCaseStudyCards(lang, doc.id, 3);
  const filtered = relatedCaseStudies.filter((c) => c.id !== doc.id).slice(0, 3);
  return { doc: { ...doc, relatedCaseStudies: filtered }, raw };
}
