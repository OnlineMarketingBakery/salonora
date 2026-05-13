import type { PostTocItem } from "@/lib/blog/post-html";
import type { AnySectionT } from "@/types/sections";

function isCaseStudyChapter(s: AnySectionT): s is Extract<AnySectionT, { type: "case_study_chapter" }> {
  return s.type === "case_study_chapter";
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

/** TOC entries from flexible “Chapter” sections (stable `tocAnchorId` from ACF row `_key`). */
export function tocItemsFromCaseStudySections(sections: AnySectionT[]): PostTocItem[] {
  const out: PostTocItem[] = [];
  for (const s of sections) {
    if (!isCaseStudyChapter(s)) continue;
    const label = s.heading.trim();
    if (!label) continue;
    out.push({ id: s.tocAnchorId, label, level: 2 });
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
