import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { CostComparisonSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function CostComparisonSection({ section, lang }: { section: CostComparisonSectionT; lang: Locale }) {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            {section.title && <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{section.title}</h2>}
            {section.text && <RichText html={section.text} className="mt-4 text-muted" />}
            <div className="mt-6 flex flex-wrap gap-3">
              {section.ctas.map((c, i) => {
                const l = resolveLink(c.url, lang);
                if (!c.text && !l) return null;
                return (
                  <Button key={i} href={l?.href} variant="primary" target={l?.target}>
                    {c.text || l?.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-surface bg-white/95 p-6 shadow-lg">
            {section.lossItems.length > 0 && (
              <ul className="space-y-2 text-sm text-muted">
                {section.lossItems.map((x, i) => (
                  <li key={i} className="flex justify-between border-b border-surface py-1">
                    <span>{x.label}</span>
                    <span className="font-medium">{x.value}</span>
                  </li>
                ))}
              </ul>
            )}
            {section.priceLabel && <p className="mt-6 text-sm font-medium text-muted">{section.priceLabel}</p>}
            {section.price && <p className="mt-1 text-3xl font-bold text-brand">{section.price}</p>}
            {section.priceSubtext && <p className="mt-1 text-sm text-muted">{section.priceSubtext}</p>}
          </div>
        </div>
      </Container>
    </section>
  );
}
