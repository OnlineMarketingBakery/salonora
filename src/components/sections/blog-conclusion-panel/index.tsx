import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { BlogSingleTailWidth } from "@/components/templates/post/BlogSingleTailWidth";
import type { BlogConclusionPanelSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

/** Figma 1643:266–288 — full-width surface “Tot slot” band after FAQ. */
export function BlogConclusionPanelSection({
  section,
}: {
  section: BlogConclusionPanelSectionT;
  lang: Locale;
}) {
  if (!section.title?.trim() && !section.body?.trim()) return null;

  return (
    <section className="blog-single-conclusion bg-white">
      <Container>
        <BlogSingleTailWidth>
          <div className="rounded-t-[12px] bg-surface px-6 py-8 sm:px-10 sm:py-10 md:py-12">
            {section.title?.trim() ? (
              <SectionHeading
                as="h2"
                text={section.title}
                className="max-w-[65.5rem] text-[2rem] font-semibold leading-[1.1] text-navy sm:text-[2.375rem] md:text-[3rem]"
              />
            ) : null}
            {section.body?.trim() ? (
              <RichText
                html={section.body}
                className="post-prose mt-5 max-w-none text-base font-normal leading-[1.4] prose-p:my-0 prose-p:mb-4 prose-p:last:mb-0 prose-p:text-muted prose-headings:text-navy prose-strong:text-navy prose-a:text-brand prose-a:underline md:mt-6"
              />
            ) : null}
          </div>
        </BlogSingleTailWidth>
      </Container>
    </section>
  );
}
