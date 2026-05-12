import { wpFetchCollectionOptional, wpFetchOptional } from "@/lib/wordpress/client";
import { getCptRestBase } from "@/lib/wordpress/config";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import type { CaseStudyOverviewCardT, CaseStudyOverviewMetricT } from "@/types/sections";
import { stripTags, toPlainText } from "@/lib/utils/strings";

type WpCaseStudyListRow = {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  acf?: Record<string, unknown>;
  _embedded?: {
    "wp:featuredmedia"?: { source_url?: string; alt_text?: string }[];
  };
};

function outcomeMetricsFromAcf(acf: Record<string, unknown> | undefined): CaseStudyOverviewMetricT[] {
  const raw = acf?.case_study_outcome_metrics;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const r = item as Record<string, unknown>;
      return { label: stripTags(String(r.metric_label ?? "")), value: stripTags(String(r.metric_value ?? "")) };
    })
    .filter((m) => m.label.trim() !== "" || m.value.trim() !== "")
    .slice(0, 3);
}

export function mapWpCaseStudyRowToOverviewCard(p: WpCaseStudyListRow, lang: Locale): CaseStudyOverviewCardT {
  const titlePlain = stripTags(p.title.rendered);
  const featured = p._embedded?.["wp:featuredmedia"]?.[0];
  const image =
    featured?.source_url && featured.source_url !== ""
      ? { url: featured.source_url, alt: featured.alt_text || titlePlain }
      : null;
  const acf = p.acf || {};
  const projectLabel = stripTags(String(acf.case_study_project_label ?? "")).trim();
  return {
    id: p.id,
    title: titlePlain,
    excerpt: toPlainText(p.excerpt?.rendered || ""),
    href: buildLocalePath(lang, p.slug),
    image,
    projectLabel,
    metrics: outcomeMetricsFromAcf(acf),
  };
}

export async function fetchCaseStudiesCollection(options: {
  lang: Locale;
  page: number;
  perPage: number;
  search: string;
}): Promise<{ items: CaseStudyOverviewCardT[]; total: number; totalPages: number } | null> {
  const { lang, page, perPage, search } = options;
  const rest = getCptRestBase("case_study");
  const safePer = Math.min(100, Math.max(1, perPage));
  const safePage = Math.max(1, page);
  const params = new URLSearchParams({
    per_page: String(safePer),
    page: String(safePage),
    _embed: "1",
    acf_format: "standard",
    orderby: "date",
    order: "desc",
  });
  const q = search.trim();
  if (q) params.set("search", q);
  const path = `/wp/v2/${rest}?${params.toString()}`;
  const res = await wpFetchCollectionOptional<WpCaseStudyListRow[]>(path, { lang, revalidate: 30 });
  if (!res) return null;
  const items = Array.isArray(res.data) ? res.data.map((p) => mapWpCaseStudyRowToOverviewCard(p, lang)) : [];
  return { items, total: res.total, totalPages: res.totalPages };
}

export async function fetchCaseStudyOverviewCardById(
  lang: Locale,
  postId: number
): Promise<CaseStudyOverviewCardT | null> {
  if (!Number.isFinite(postId) || postId < 1) return null;
  const rest = getCptRestBase("case_study");
  const row = await wpFetchOptional<WpCaseStudyListRow>(`/wp/v2/${rest}/${postId}?_embed=1&acf_format=standard`, {
    lang,
    revalidate: 30,
  });
  if (!row?.id) return null;
  return mapWpCaseStudyRowToOverviewCard(row, lang);
}
