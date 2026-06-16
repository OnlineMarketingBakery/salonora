import { RichText } from "@/components/ui/RichText";
import type { CaseStudyChapterSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const BODY_PROSE =
  "post-article-body post-prose max-w-none text-base font-normal leading-[1.4] prose-p:my-0 [&_p+p]:mt-4 prose-headings:font-semibold prose-h2:text-[34px] prose-h2:leading-[1.1] prose-h2:font-semibold prose-h3:text-2xl prose-h3:leading-[1.1] prose-h3:font-semibold prose-headings:text-[var(--palette-navy)] prose-p:text-[var(--palette-muted)] prose-li:text-[var(--palette-muted)] prose-strong:text-[var(--palette-navy)] prose-a:text-[var(--palette-brand)] prose-img:mt-4 prose-img:rounded-[14px]";

export function CaseStudyChapterSection({ section, lang }: { section: CaseStudyChapterSectionT; lang: Locale }) {
  void lang;
  const h = section.heading.trim();
  return (
    <section
      className={`flex flex-col gap-4 ${section.showDivider ? "border-b border-[color-mix(in_srgb,var(--palette-navy)_12%,transparent)] pb-8" : ""}`}
    >
      {h ? (
        <h2
          id={section.tocAnchorId}
          className="scroll-mt-28 text-[34px] font-semibold leading-[1.1] text-[var(--palette-navy)]"
        >
          {h}
        </h2>
      ) : null}
      {section.body ? <RichText html={section.body} className={BODY_PROSE} /> : null}
    </section>
  );
}
