import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { TestimonialsSectionT } from "@/types/sections";
import type { CSSProperties } from "react";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

/** Same mesh + blend as Figma testimonials frame (`346:5621`…`346:5622` under `974:30`); matches `feature-highlight-split`. */
const HERO_BG_SRC = "/feature-highlight-split-hero-bg.png";

const heroBgImageLayer: CSSProperties = {
  position: "absolute",
  top: 0,
  left: "-19.42%",
  width: "138.84%",
  height: "134.3%",
  minHeight: "100%",
  backgroundImage: `url("${HERO_BG_SRC}")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center top",
  backgroundSize: "cover",
};

const brandColorBlendLayer: CSSProperties = {
  backgroundColor: "var(--palette-brand)",
  mixBlendMode: "color",
};

export function TestimonialsSection({
  section,
  lang,
}: {
  section: TestimonialsSectionT;
  lang: Locale;
}) {
  const perView = section.items_per_view ?? 2;
  const items = section.items;
  const narrowSingleTotal = items.length === 1;

  return (
    <section className="relative isolate overflow-hidden py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: "color-mix(in srgb, var(--palette-white) 88%, var(--palette-surface))",
          }}
        />
        <div style={heroBgImageLayer} />
        <div className="absolute inset-0" style={brandColorBlendLayer} />
      </div>
      <Container className="relative z-10 max-w-[1314px]">
        {section.title ? (
          <h2
            className={`${REVEAL_ITEM} mx-auto max-w-[min(100%,477px)] text-center text-3xl font-semibold leading-tight tracking-tight text-navy-deep sm:text-4xl lg:leading-[56px]`}
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
                  <p
                    key={`${section.id}-cta-${i}`}
                    className="text-center text-sm text-muted"
                  >
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
