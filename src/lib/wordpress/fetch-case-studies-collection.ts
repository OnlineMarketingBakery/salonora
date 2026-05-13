import { wpFetchCollectionOptional, wpFetchOptional } from "@/lib/wordpress/client";
import { getCptRestBase } from "@/lib/wordpress/config";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import type { CaseStudyOverviewCardT, CaseStudyOverviewMetricT } from "@/types/sections";
import { stripTags, toPlainText } from "@/lib/utils/strings";

export type WpCaseStudyListRow = {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  acf?: Record<string, unknown>;
  _embedded?: {
    "wp:featuredmedia"?: { source_url?: string; alt_text?: string }[];
  };
} & Record<string, unknown>;

/** `acf` object plus case-study fields sometimes hoisted on the REST root by ACF / plugins. */
function acfFromCaseStudyRestRow(p: WpCaseStudyListRow): Record<string, unknown> {
  const base =
    p.acf && typeof p.acf === "object" && !Array.isArray(p.acf)
      ? { ...(p.acf as Record<string, unknown>) }
      : ({} as Record<string, unknown>);
  for (const k of ["case_study_outcome_metrics", "case_study_project_label", "case_study_lead"] as const) {
    if (base[k] === undefined && p[k] !== undefined) {
      base[k] = p[k] as unknown;
    }
  }
  return base;
}

function metricLabelValueFromRow(r: Record<string, unknown>): { label: string; value: string } {
  const labelRaw = r.metric_label ?? r.field_omb_case_study_metric_label ?? r.label;
  const valueRaw = r.metric_value ?? r.field_omb_case_study_metric_value ?? r.value;
  return {
    label: stripTags(String(labelRaw ?? "")),
    value: stripTags(String(valueRaw ?? "")),
  };
}

export function caseStudyOutcomeMetricsFromAcf(
  acf: Record<string, unknown> | undefined,
  max?: number
): CaseStudyOverviewMetricT[] {
  let raw = acf?.case_study_outcome_metrics;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    raw = Object.values(raw as Record<string, unknown>).filter((v) => v != null && typeof v === "object");
  }
  if (!Array.isArray(raw)) return [];
  const rows = raw
    .map((item) => metricLabelValueFromRow(item as Record<string, unknown>))
    .filter((m) => m.label.trim() !== "" || m.value.trim() !== "");
  return max === undefined ? rows : rows.slice(0, max);
}

export function mapWpCaseStudyRowToOverviewCard(p: WpCaseStudyListRow, lang: Locale): CaseStudyOverviewCardT {
  const titlePlain = stripTags(p.title.rendered);
  const featured = p._embedded?.["wp:featuredmedia"]?.[0];
  const image =
    featured?.source_url && featured.source_url !== ""
      ? { url: featured.source_url, alt: featured.alt_text || titlePlain }
      : null;
  const acf = acfFromCaseStudyRestRow(p);
  const projectLabel = stripTags(String(acf.case_study_project_label ?? "")).trim();
  return {
    id: p.id,
    title: titlePlain,
    excerpt: toPlainText(p.excerpt?.rendered || ""),
    href: buildLocalePath(lang, p.slug),
    image,
    projectLabel,
    metrics: caseStudyOutcomeMetricsFromAcf(acf, 3),
  };
}

function metricsAndProjectFromAcfRestPayload(payload: Record<string, unknown>): {
  metrics: CaseStudyOverviewMetricT[];
  projectLabel: string;
} {
  const nested = payload.acf;
  const acfRecord =
    nested && typeof nested === "object" && !Array.isArray(nested) ? (nested as Record<string, unknown>) : payload;
  return {
    metrics: caseStudyOutcomeMetricsFromAcf(acfRecord, 3),
    projectLabel: stripTags(String(acfRecord.case_study_project_label ?? "")).trim(),
  };
}

/**
 * When `wp/v2` omits repeater ACF, ACF’s own REST routes often still return full field data.
 */
async function tryAcfRestCaseStudyFields(
  lang: Locale,
  restBase: string,
  postId: number
): Promise<{ metrics: CaseStudyOverviewMetricT[]; projectLabel: string }> {
  for (const prefix of ["/acf/v3/", "/acf/v1/"] as const) {
    const payload = await wpFetchOptional<Record<string, unknown>>(`${prefix}${restBase}/${postId}`, {
      lang,
      revalidate: 30,
    });
    if (!payload || typeof payload !== "object") continue;
    const parsed = metricsAndProjectFromAcfRestPayload(payload);
    if (parsed.metrics.length > 0 || parsed.projectLabel) return parsed;
  }
  return { metrics: [], projectLabel: "" };
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
  let card = mapWpCaseStudyRowToOverviewCard(row, lang);
  if (card.metrics.length === 0) {
    const extra = await tryAcfRestCaseStudyFields(lang, rest, postId);
    if (extra.metrics.length > 0 || extra.projectLabel) {
      card = {
        ...card,
        metrics: extra.metrics.length > 0 ? extra.metrics : card.metrics,
        projectLabel: card.projectLabel || extra.projectLabel,
      };
    }
  }
  return card;
}
