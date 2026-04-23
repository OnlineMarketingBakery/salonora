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
        {section.title && <h2 className="text-xl font-bold text-[#0c1d3a] sm:text-2xl">{section.title}</h2>}
        {section.body && <RichText html={section.body} className={`mt-4 text-slate-600 ${w[section.contentWidth]}`} />}
      </Container>
    </section>
  );
}
