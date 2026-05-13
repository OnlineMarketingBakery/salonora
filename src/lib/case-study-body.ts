import type { PostTocItem } from "@/lib/blog/post-html";
import type { AnySectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

function isCaseStudyChapter(s: AnySectionT): s is Extract<AnySectionT, { type: "case_study_chapter" }> {
  return s.type === "case_study_chapter";
}

function isCaseStudyClientReview(s: AnySectionT): s is Extract<AnySectionT, { type: "case_study_client_review" }> {
  return s.type === "case_study_client_review";
}

const CASE_STUDY_MAIN_LAYOUTS: Partial<Record<AnySectionT["type"], true>> = {
  case_study_chapter: true,
  case_study_product_shot: true,
  case_study_client_review: true,
  case_study_conversion_cta: true,
};

export function isCaseStudyMainBodySection(s: AnySectionT): boolean {
  return CASE_STUDY_MAIN_LAYOUTS[s.type] === true;
}

export function caseStudyHasFlexibleMainBody(sections: AnySectionT[]): boolean {
  return sections.some(isCaseStudyMainBodySection);
}

const CLIENT_REVIEW_TOC_DEFAULT: Record<Locale, string> = {
  nl: "Klantenrecensie",
  en: "Client review",
};

/** TOC entries from flexible “Chapter” + “Client review” sections (order follows `sections`; stable `tocAnchorId` from ACF row `_key`). */
export function tocItemsFromCaseStudySections(sections: AnySectionT[], lang: Locale): PostTocItem[] {
  const out: PostTocItem[] = [];
  for (const s of sections) {
    if (isCaseStudyChapter(s)) {
      const label = s.heading.trim();
      if (!label) continue;
      out.push({ id: s.tocAnchorId, label, level: 2 });
      continue;
    }
    if (isCaseStudyClientReview(s)) {
      const label = s.sectionHeading.trim() || CLIENT_REVIEW_TOC_DEFAULT[lang];
      out.push({ id: s.tocAnchorId, label, level: 2 });
    }
  }
  return out;
}

/** Concatenate HTML-ish strings from case study sections for read-time estimation. */
export function htmlRoughFromCaseStudySections(sections: AnySectionT[]): string {
  const parts: string[] = [];
  for (const s of sections) {
    switch (s.type) {
      case "case_study_chapter":
        parts.push(s.heading, s.body);
        break;
      case "case_study_client_review":
        parts.push(s.sectionHeading, s.quote);
        break;
      case "case_study_conversion_cta":
        parts.push(s.title, s.subtitle);
        break;
      default:
        break;
    }
  }
  return parts.join(" ");
}
