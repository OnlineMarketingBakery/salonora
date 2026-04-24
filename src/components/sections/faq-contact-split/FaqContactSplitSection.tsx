import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { CF7Form } from "@/components/forms/CF7Form";
import type { FaqContactSplitSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function FaqContactSplitSection({ section, lang }: { section: FaqContactSplitSectionT; lang: Locale }) {
  const accItems = section.items.map((q, i) => ({
    id: `faq-${i}`,
    title: q.question,
    content: q.answer,
  }));
  return (
    <section className="py-16 md:py-24">
      <Container>
        {section.title && <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{section.title}</h2>}
        {section.intro && <RichText html={section.intro} className="mt-4 max-w-2xl text-muted" />}
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <Accordion items={accItems} />
            {section.pricingCtas.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {section.pricingCtas.map((c, i) => {
                  const l = resolveLink(c.link, lang);
                  return (
                    <Button key={i} href={l?.href} variant="secondary" target={l?.target}>
                      {c.text || l?.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            {section.useForm && (section.defaultFormId || section.customForm?.id) ? (
              <div className="rounded-2xl border border-surface bg-white p-6 shadow-sm">
                <CF7Form
                  formId={section.defaultFormId || section.customForm?.id || 0}
                  definition={section.formDefinition}
                  successMode="inline"
                />
              </div>
            ) : (
              <div className="rounded-2xl bg-brand p-8 text-white">
                {section.cardTitle && <h3 className="text-lg font-bold">{section.cardTitle}</h3>}
                {section.cardText && <RichText html={section.cardText} className="mt-3 text-sm text-white/90" />}
                {section.contactCtas.length > 0 && (
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    {section.contactCtas.map((c, i) => {
                      const l = resolveLink(c.ctaLink, lang);
                      return (
                        <Button key={i} href={l?.href} variant="white" className="flex-1" target={l?.target}>
                          {c.ctaText || l?.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
