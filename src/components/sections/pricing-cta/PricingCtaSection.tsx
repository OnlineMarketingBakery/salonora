import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { PricingCtaSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function PricingCtaSection({ section, lang }: { section: PricingCtaSectionT; lang: Locale }) {
  return (
    <section className="border-t border-surface py-16 md:py-24">
      <Container>
        {section.title && <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">{section.title}</h2>}
        {section.intro && <RichText html={section.intro} className="mx-auto mt-4 max-w-2xl text-center text-muted" />}
        {section.cardsTitle && <RichText html={section.cardsTitle} className="mt-8 text-center text-lg font-semibold" />}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {section.pricingCards.map((c, i) => (
            <div key={i} className="rounded-2xl border-2 border-dashed border-brand/30 bg-white/80 p-6">
              <h3 className="text-lg font-bold text-foreground">{c.title}</h3>
              {c.description && <RichText html={c.description} className="mt-2 text-sm text-muted" />}
              <div className="mt-4 flex flex-wrap gap-2">
                {c.ctas.map((x, j) => {
                  const l = resolveLink(x.url, lang);
                  return (
                    <Button key={j} href={l?.href} variant="primary" target={l?.target}>
                      {x.text || l?.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {section.bottomContactText && <RichText html={section.bottomContactText} className="mt-10 text-center text-sm text-muted" />}
      </Container>
    </section>
  );
}
