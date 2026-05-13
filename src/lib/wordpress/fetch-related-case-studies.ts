import { wpFetchOptional } from "@/lib/wordpress/client";
import { getCptRestBase } from "@/lib/wordpress/config";
import type { Locale } from "@/lib/i18n/locales";
import type { CaseStudyOverviewCardT } from "@/types/sections";
import { mapWpCaseStudyRowToOverviewCard, type WpCaseStudyListRow } from "@/lib/wordpress/fetch-case-studies-collection";

/**
 * Newest case studies excluding the current entry (same CPT, same language).
 */
export async function fetchRelatedCaseStudyCards(
  lang: Locale,
  excludeId: number,
  limit: number
): Promise<CaseStudyOverviewCardT[]> {
  const per = Math.min(12, Math.max(1, limit));
  const rest = getCptRestBase("case_study");
  const path = `/wp/v2/${rest}?exclude=${excludeId}&per_page=${per}&orderby=date&order=desc&_embed=1&acf_format=standard`;
  const rows = await wpFetchOptional<WpCaseStudyListRow[]>(path, { lang, revalidate: 60 });
  if (!Array.isArray(rows)) return [];
  return rows.map((p) => mapWpCaseStudyRowToOverviewCard(p, lang));
}
