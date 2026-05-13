import type { AnySectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import { isCaseStudyMainBodySection } from "@/lib/case-study-body";
import { CaseStudyChapterSection } from "./CaseStudyChapterSection";
import { CaseStudyProductShotSection } from "./CaseStudyProductShotSection";
import { CaseStudyClientReviewSection } from "./CaseStudyClientReviewSection";
import { CaseStudyConversionCtaSection } from "./CaseStudyConversionCtaSection";

/** Renders case-study–only flexible layouts inside the single template main column (not full-bleed page sections). */
export function CaseStudyBodySections({ sections, lang }: { sections: AnySectionT[]; lang: Locale }) {
  const rows = sections.filter(isCaseStudyMainBodySection);
  if (rows.length === 0) return null;
  return (
    <div className="mt-8 flex flex-col gap-8">
      {rows.map((s) => {
        switch (s.type) {
          case "case_study_chapter":
            return <CaseStudyChapterSection key={s.id} section={s} lang={lang} />;
          case "case_study_product_shot":
            return <CaseStudyProductShotSection key={s.id} section={s} lang={lang} />;
          case "case_study_client_review":
            return <CaseStudyClientReviewSection key={s.id} section={s} lang={lang} />;
          case "case_study_conversion_cta":
            return <CaseStudyConversionCtaSection key={s.id} section={s} lang={lang} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
