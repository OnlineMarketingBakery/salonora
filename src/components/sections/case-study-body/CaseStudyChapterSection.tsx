import { RichText } from "@/components/ui/RichText";
import type { CaseStudyChapterSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function CaseStudyChapterSection({ section, lang }: { section: CaseStudyChapterSectionT; lang: Locale }) {
  void lang;
  const h = section.heading.trim();
  return (
    <section className={section.showDivider ? "border-b border-[color-mix(in_srgb,var(--palette-navy)_12%,transparent)] pb-8" : ""}>
      {h ? (
        <h2
          id={section.tocAnchorId}
          className="text-[34px] font-semibold leading-[1.1] text-[var(--palette-navy)] scroll-mt-28"
        >
          {h}
        </h2>
      ) : null}
      {section.body ? (
        <RichText
          html={section.body}
          className="post-article-body post-prose mt-4 max-w-none text-base font-normal leading-[1.4] prose-headings:font-semibold prose-h2:text-[34px] prose-h2:leading-[1.1] prose-h2:font-semibold prose-h3:text-2xl prose-h3:leading-[1.1] prose-h3:font-semibold prose-p:my-0 prose-p:leading-[1.4] prose-li:leading-[1.4] prose-headings:text-[var(--palette-navy)] prose-p:text-[var(--palette-muted)] prose-li:text-[var(--palette-muted)] prose-strong:text-[var(--palette-navy)] prose-a:text-[var(--palette-brand)] prose-img:rounded-[10px]"
        />
      ) : null}
    </section>
  );
}
