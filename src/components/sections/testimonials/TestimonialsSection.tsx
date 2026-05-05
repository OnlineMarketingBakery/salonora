import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { TestimonialsSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

export function TestimonialsSection({ section, lang }: { section: TestimonialsSectionT; lang: Locale }) {
  const perView = section.items_per_view ?? 2;
  const items = section.items;
  const narrowSingleTotal = items.length === 1;

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, var(--palette-surface), var(--palette-white))",
        }}
        aria-hidden
      />
      <Container className="relative max-w-[1314px]">
        {section.title ? (
          <h2
            className={`${REVEAL_ITEM} mx-auto max-w-[min(100%,477px)] text-center text-3xl font-semibold leading-tight tracking-tight text-navy-deep sm:text-4xl lg:text-5xl lg:leading-[56px]`}
          >
            {section.title}
          </h2>
        ) : null}
        {section.intro ? (
          <RichText
            html={section.intro}
            className={`${REVEAL_ITEM} mx-auto mt-4 max-w-2xl text-center text-base text-muted`}
          />
        ) : null}

        <div className="mt-10 md:mt-12">
          <TestimonialsCarousel
            items={items}
            perView={perView}
            sectionId={section.id}
            narrowSingleTotal={narrowSingleTotal}
          />
        </div>

        {section.ctas.length > 0 ? (
          <div className="mt-10 flex w-full flex-col items-center gap-4 md:mt-12">
            {section.ctas.map((c, i) => {
              const l = resolveLink(c.url, lang);
              const t = c.text || l?.label;
              if (!l?.href) {
                return t ? (
                  <p key={`${section.id}-cta-${i}`} className="text-center text-sm text-muted">
                    {t}
                  </p>
                ) : null;
              }
              return (
                <Button
                  key={`${section.id}-cta-${i}`}
                  href={l.href}
                  target={l.target}
                  variant="ctaNavyDeep"
                  ctaSize="promo"
                  ctaElevation="default"
                  ctaFullWidth={false}
                  ctaJustify="between"
                  className="!h-12 !min-h-12 shrink-0 !rounded-[24px] !gap-[19px] px-3 text-base font-normal text-white"
                  arrowClassName="!h-6 !w-6 shrink-0"
                >
                  {t}
                </Button>
              );
            })}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
