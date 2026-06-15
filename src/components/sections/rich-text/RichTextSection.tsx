import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { RichTextSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const w: Record<RichTextSectionT["contentWidth"], string> = {
  default: "max-w-3xl",
  narrow: "max-w-xl",
  wide: "max-w-5xl",
};

export function RichTextSection({ section }: { section: RichTextSectionT; lang: Locale }) {
  return (
    <section className="py-12">
      <Container>
        {section.title && (
          <SectionHeading
            as="h2"
            text={section.title}
            className={`${REVEAL_ITEM} text-3xl font-semibold leading-tight text-navy sm:text-4xl lg:text-[48px] lg:leading-[56px]`}
          />
        )}
        {section.body && (
          <RichText html={section.body} className={`${REVEAL_ITEM} mt-4 text-muted ${w[section.contentWidth]}`} />
        )}
      </Container>
    </section>
  );
}
