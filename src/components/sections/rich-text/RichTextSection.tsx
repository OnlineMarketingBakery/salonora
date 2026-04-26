import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
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
          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:text-[48px] lg:leading-[56px]">
            {section.title}
          </h2>
        )}
        {section.body && <RichText html={section.body} className={`mt-4 text-muted ${w[section.contentWidth]}`} />}
      </Container>
    </section>
  );
}
