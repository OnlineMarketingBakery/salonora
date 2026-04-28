import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { ctaVariantAt } from "@/lib/ui/ctaAlternation";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { CostComparisonSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function CostComparisonSection({ section, lang }: { section: CostComparisonSectionT; lang: Locale }) {
  const hasPriceBlock = Boolean(
    section.price || section.priceLabel || section.priceSubtext
  );
  const showRightCard = Boolean(
    section.lossCardTitle || section.lossItems.length > 0 || hasPriceBlock
  );

  return (
    <section className="bg-white py-16 sm:py-20 md:py-24">
      <Container>
        <div
          className={
            showRightCard
              ? "grid w-full items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-14"
              : "grid w-full grid-cols-1 items-center gap-10"
          }
        >
          <div className={`${REVEAL_ITEM} flex w-full max-w-[555px] flex-col items-start gap-6`}>
            {section.title && (
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:text-[48px] lg:leading-[3.5rem]">
                {section.title}
              </h2>
            )}
            {section.text && (
              <RichText
                html={section.text}
                className="text-base !prose-p:mb-0 !prose-p:mt-0 !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p:not(:first-child)]:!mt-[18px]"
              />
            )}
            {section.ctas.length > 0 && (
              <div className="flex max-w-full flex-col flex-wrap gap-3.5 sm:flex-row sm:items-center sm:gap-3.5">
                {section.ctas.map((c, i) => {
                  const l = resolveLink(c.url, lang);
                  const text = c.text || l?.label;
                  if (!l || !text) return null;
                  return (
                    <Button
                      key={`${section.id}-cta-${i}`}
                      href={l.href}
                      variant={ctaVariantAt(i)}
                      className={i === 0 ? "w-full max-w-[321px] justify-center" : "h-12 min-w-0 rounded-[24px] px-4 text-base font-normal"}
                      target={l.target}
                    >
                      {text}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
          {showRightCard && (
            <div className={`${REVEAL_ITEM} relative w-full min-w-0 self-center sm:pt-0 lg:ml-auto lg:max-w-[min(100%,496px)]`}>
              <div
                className="pointer-events-none absolute -left-1 top-3 z-0 hidden h-[524px] w-full max-w-[460px] rotate-[-4.13deg] rounded-[14px] bg-brand sm:left-0 sm:top-4 sm:block"
                aria-hidden
              />
              <div
                className="relative z-10 mx-auto w-full max-w-[460px] rounded-[14px] border border-transparent bg-white p-7 shadow-[0px_4px_27px_rgba(67,87,128,0.35)] sm:ml-4 sm:mt-4 sm:mr-0 sm:w-[min(100%,460px)] sm:p-[38px]"
              >
                <div className="flex flex-col gap-5 sm:gap-6">
                  {section.lossCardTitle && (
                    <p className="text-center text-base font-normal leading-[1.4] text-[#3a8ae4] sm:text-left">
                      {section.lossCardTitle}
                    </p>
                  )}
                  <div className="flex flex-col gap-3.5">
                    {section.lossItems.length > 0 && (
                      <ul className="flex flex-col gap-3.5" aria-label="Comparison">
                        {section.lossItems.map((x, j) => (
                          <li
                            key={j}
                            className="flex min-h-[46px] w-full items-center justify-between gap-2 rounded-[10px] bg-surface py-0 pl-3.5 pr-2.5"
                          >
                            <span className="min-w-0 flex-1 text-sm font-normal leading-[1.4] text-muted">
                              {x.label}
                            </span>
                            <span className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-center text-xs font-bold text-[#ff4d4d] shadow-sm">
                              {x.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {hasPriceBlock && (
                      <div className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-[10px] bg-surface px-4 py-8 sm:min-h-[169px] sm:px-9 sm:py-10">
                        {section.priceLabel && (
                          <p className="w-full text-center text-sm font-normal leading-[1.4] text-muted">
                            {section.priceLabel}
                          </p>
                        )}
                        {section.price && (
                          <p className="text-center text-2xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-[34px] sm:leading-tight sm:tracking-[-1.36px]">
                            {section.price}
                          </p>
                        )}
                        {section.priceSubtext && (
                          <p className="w-full text-center text-sm font-medium leading-[1.4] text-[#3a86dd]">
                            {section.priceSubtext}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
