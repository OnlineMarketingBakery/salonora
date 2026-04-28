import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { PricingCtaSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const introProse = [
  "!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none",
  "!prose-p:text-center",
  "!prose-p:font-sans",
  "!prose-p:text-base",
  "!prose-p:font-normal",
  "!prose-p:leading-[1.4]",
  "!prose-p:text-navy",
  "[&>p+_p]:!mt-3.5",
  /* Figma: 24px after the 3-paragraph block before the “teaser” (4th p) */
  "[&>p:nth-of-type(3)+p]:!mt-6",
  "[&>p:nth-of-type(4)]:!font-semibold",
].join(" ");

const cardCtaClassName =
  "!h-[42px] w-full !min-h-0 !max-w-full !gap-0 !rounded-[24px] !pl-[18px] !pr-3.5 !text-sm !font-normal !leading-6 !text-white";

export function PricingCtaSection({ section, lang }: { section: PricingCtaSectionT; lang: Locale }) {
  return (
    <section className="bg-[#F0F7FF] py-16 sm:py-20 md:py-24">
      <Container className="!max-w-[85rem]">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-6">
          <div className={`${REVEAL_ITEM} w-full max-w-[826px] text-center`}>
            {section.title && (
              <h2 className="text-[40px] font-semibold leading-tight tracking-[-0.04em] text-navy-deep sm:text-[48px] sm:leading-[56px] [text-wrap:balance]">
                {section.title}
              </h2>
            )}
            {section.intro && (
              <div className={section.title ? "mt-6" : ""}>
                <RichText html={section.intro} className={introProse} />
              </div>
            )}
          </div>

          {section.cardsTitle && (
            <RichText
              html={section.cardsTitle}
              className={`${REVEAL_ITEM} w-full !prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-center !prose-p:font-sans !prose-p:text-[24px] !prose-p:font-semibold !prose-p:leading-[140%] !prose-p:not-italic !prose-p:!text-[#3990F0] [&_p]:!m-0 [&_p]:!text-center [&_p]:!text-[24px] [&_p]:!font-semibold [&_p]:!leading-[140%] [&_p]:!not-italic [&_p]:!text-[#3990F0]`}
            />
          )}

          <div className="flex w-full max-w-[1080px] flex-col items-stretch gap-6">
            <div className="grid w-full grid-cols-1 items-stretch justify-items-center gap-6 lg:grid-cols-2">
              {section.pricingCards.map((c, i) => (
                <div
                  key={i}
                  className={`${REVEAL_ITEM} flex w-full min-w-0 max-w-[528px] flex-col items-center justify-center rounded-[14px] bg-white p-10 lg:min-h-[205px]`}
                >
                  <div className="flex w-full min-w-0 max-w-[383px] flex-col items-center justify-center gap-[17px]">
                    {c.title && <h3 className="w-full text-center text-lg font-semibold text-navy">{c.title}</h3>}
                    {c.description && (
                      <RichText
                        html={c.description}
                        className="w-full !prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-center !prose-p:font-sans !prose-p:text-[16px] !prose-p:font-semibold !prose-p:leading-[140%] !prose-p:not-italic !prose-p:!text-[#152951] [&_p]:!m-0 [&_p]:!text-center [&_p]:!text-[16px] [&_p]:!font-semibold [&_p]:!leading-[140%] [&_p]:!not-italic [&_p]:!text-[#152951]"
                      />
                    )}
                    {c.ctas.map((x, j) => {
                      const link = resolveLink(x.url, lang);
                      if (!link?.href) return null;
                      return (
                        <Button
                          key={j}
                          href={link.href}
                          target={link.target}
                          variant="ctaBrand"
                          ctaSize="card"
                          ctaElevation="none"
                          ctaJustify="between"
                          className={cardCtaClassName}
                        >
                          {x.text || link.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {section.bottomContactText && (
              <div
                className={`${REVEAL_ITEM} flex w-full min-h-16 max-w-full items-center justify-center rounded-[14px] bg-white p-5 text-center sm:min-h-[64px]`}
              >
                <RichText
                  html={section.bottomContactText}
                  className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-center !prose-p:font-sans !prose-p:text-base !prose-p:font-semibold !prose-p:leading-[1.4] !prose-p:text-navy !prose-p:whitespace-normal [&_a]:!font-semibold [&_a]:!text-brand [&_a]:!no-underline hover:[&_a]:!underline"
                />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
