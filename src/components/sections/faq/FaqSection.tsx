import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { FaqSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function FaqSection({ section }: { section: FaqSectionT; lang: Locale }) {
  return (
    <section className="py-12 md:py-16">
      <Container>
        {section.title && (
          <h2
            className={`${REVEAL_ITEM} text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:text-[48px] lg:leading-[56px]`}
          >
            {section.title}
          </h2>
        )}
        <div className="mt-6">
          <Accordion
            items={section.items.map((q, i) => ({ id: `f-${i}`, title: q.question, content: q.answer }))}
          />
        </div>
      </Container>
    </section>
  );
}
