import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { ctaVariantAt } from "@/lib/ui/ctaAlternation";
import { resolveLink } from "@/lib/utils/links";
import { CF7Form } from "@/components/forms/CF7Form";
import { ContactCtaPill } from "@/components/sections/faq-contact-split/ContactCtaPill";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { FaqContactSplitSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function FaqContactSplitSection({ section, lang }: { section: FaqContactSplitSectionT; lang: Locale }) {
  const accItems = section.items.map((q, i) => ({
    id: `faq-${i}`,
    title: q.question,
    content: q.answer,
  }));
  const cardTitleLines = section.cardTitle
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white">
      <Container className="!max-w-[85rem]">
        <div className="mx-auto flex w-full max-w-[1156px] flex-col items-center gap-10 md:gap-[47px]">
          {section.title && (
            <h2
              className={`${REVEAL_ITEM} w-full text-center text-[40px] font-semibold leading-tight tracking-[-0.04em] text-navy-deep sm:text-[48px] sm:leading-[56px]`}
            >
              {section.title.split(/\r?\n+/).map((line, i) => {
                const t = line.trim();
                if (!t) return null;
                return (
                  <span key={i} className="block">
                    {t}
                  </span>
                );
              })}
            </h2>
          )}

          {section.intro && (
            <div className={`${REVEAL_ITEM} w-full text-center text-muted`}>
              <RichText html={section.intro} className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-center !prose-p:leading-normal" />
            </div>
          )}

          <div className="flex w-full flex-col items-stretch gap-8 lg:flex-row lg:items-start lg:gap-[29px]">
            <div className="flex w-full min-w-0 flex-1 flex-col gap-6 lg:max-w-[638px]">
              <Accordion items={accItems} variant="split" />

              {section.pricingCtas.length > 0 && (
                <div className="flex w-full min-w-0 flex-col gap-[14px]">
                  {section.pricingCtas.map((c, i) => {
                    const l = resolveLink(c.link, lang);
                    if (!l?.href) return null;
                    const t = c.text || l?.label;
                    return (
                      <Button
                        key={i}
                        href={l.href}
                        target={l.target}
                        variant={ctaVariantAt(i, "brand", "ctaNavyDeep")}
                        ctaElevation={i === 0 ? "none" : "default"}
                        ctaJustify="between"
                        arrowClassName="!h-6 !w-6 shrink-0"
                        className={
                          i === 2
                            ? "h-12 w-full max-w-full rounded-3xl"
                            : "h-12 w-full min-w-0 max-w-full rounded-[24px] px-3"
                        }
                      >
                        {t}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={`${REVEAL_ITEM} w-full min-w-0 shrink-0 lg:w-[min(100%,489px)] lg:max-w-[489px]`}>
              {section.useForm && (section.defaultFormId || section.customForm?.id) ? (
                <div
                  className="flex min-h-[400px] flex-col justify-center rounded-[14px] bg-gradient-to-b from-brand to-[#0569d7] p-8 sm:p-11"
                  data-testid="faq-split-form"
                >
                  <div className="w-full min-w-0 max-w-lg rounded-2xl bg-white/95 p-4 shadow-lg sm:p-6">
                    <CF7Form
                      formId={section.defaultFormId || section.customForm?.id || 0}
                      definition={section.formDefinition}
                      successMode="inline"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex min-h-0 w-full min-w-0 flex-col items-center justify-center gap-6 rounded-[14px] bg-gradient-to-b from-brand to-[#0569d7] p-8 sm:min-h-[520px] md:min-h-[580px] lg:min-h-[609px] lg:gap-6 lg:p-[44px]">
                  <div className="flex w-full min-w-0 max-w-[401px] flex-col items-center gap-6 text-center text-white">
                    {cardTitleLines.length > 0 && (
                      <h3 className="w-full text-[40px] font-medium leading-[47px] tracking-[-0.04em] sm:text-[48px] sm:leading-[47px] sm:tracking-[-0.04em]">
                        {cardTitleLines.map((line, i) => (
                          <span key={i} className="block [text-wrap:balance]">
                            {line}
                          </span>
                        ))}
                      </h3>
                    )}
                    {section.cardText && (
                      <RichText
                        html={section.cardText}
                        className="w-full !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-center !prose-p:text-2xl !prose-p:font-semibold !prose-p:leading-[1.2] !prose-p:tracking-[-0.04em] !prose-p:text-white"
                      />
                    )}
                    {section.contactCtas.length > 0 && (
                      <div className="mt-0 flex w-full min-w-0 flex-col items-stretch gap-4">
                        {section.contactCtas.map((c, i) => {
                          const l = resolveLink(c.ctaLink, lang);
                          if (!l?.href) return null;
                          return (
                            <ContactCtaPill
                              key={i}
                              href={l.href}
                              text={c.ctaText || l?.label}
                              icon={c.icon}
                              target={l.target}
                              iconFallback={i % 2 === 0 ? "mail" : "phone"}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
