import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Accordion } from "@/components/ui/Accordion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { ContactCtaPill } from "@/components/sections/faq-contact-split/ContactCtaPill";
import {
  FAQ_PRICING_CTA_ARROW,
  isCompositeIconTile,
} from "@/components/sections/faq-contact-split/faq-contact-icons";
import { resolveLink } from "@/lib/utils/links";
import { CF7Form } from "@/components/forms/CF7Form";
import { formatHeadingLines } from "@/lib/i18n/format-heading";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { SECTION_SHELL_DUAL_CARDS } from "@/lib/layout/section-spacing";
import type { FaqContactSplitSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import { SITE_CONTENT_WIDTH_FAQ_ROW } from "@/lib/layout/site-content-width";

function contactIconFallback(href: string, index: number): "mail" | "phone" {
  if (href.startsWith("tel:")) return "phone";
  if (href.startsWith("mailto:")) return "mail";
  return index === 0 ? "mail" : "phone";
}

/** Figma 597:3920 — title up to 351px; keep at most two display lines. */
const FAQ_CONTACT_CARD_TITLE_CLASS =
  "w-full max-w-[351px] text-[32px] font-medium leading-tight sm:text-[40px] sm:leading-[47px] lg:text-[48px]";

function normalizeContactCardTitleLines(lines: string[]): string[] {
  if (lines.length <= 2) return lines;
  const mid = Math.ceil(lines.length / 2);
  return [
    lines.slice(0, mid).join(" "),
    lines.slice(mid).join(" "),
  ].filter(Boolean);
}

/** Figma 597:3912 — 638×79 navy pill; 31.5px inset, 20px label, 37×37 trailing icon. */
const FAQ_PRICING_CTA_CLASS =
  "h-[79px] min-h-[79px] w-full max-w-full rounded-[39.5px] !px-[31.5px] !py-[21px] !text-[20px] !leading-[1.1] [&_[data-cta-label]]:!text-[20px] [&_[data-cta-label]]:!font-normal [&_[data-cta-label]]:!leading-[1.1]";

function FaqPricingCtaArrow({ image }: { image: FaqContactSplitSectionT["pricingCtas"][number]["trailing_icon"] }) {
  if (image && isCompositeIconTile(image, 30)) {
    return (
      <Media
        image={image}
        width={37}
        height={37}
        className="size-[37px] shrink-0 object-contain"
        sizes="37px"
        preferLargestSource
      />
    );
  }

  return (
    <Image
      src={FAQ_PRICING_CTA_ARROW}
      width={37}
      height={37}
      alt=""
      unoptimized
      className="size-[37px] shrink-0 object-contain"
      aria-hidden
    />
  );
}

export function FaqContactSplitSection({ section, lang }: { section: FaqContactSplitSectionT; lang: Locale }) {
  const accItems = section.items.map((q, i) => ({
    id: `faq-${i}`,
    title: q.question,
    content: q.answer,
  }));
  const cardTitleLines = normalizeContactCardTitleLines(
    formatHeadingLines(section.cardTitle ?? ""),
  );
  const hasPricing = section.pricingCtas.length > 0;
  const navyBg = section.sectionBackground === "navy";

  return (
    <section
      className={`${SECTION_SHELL_DUAL_CARDS} ${navyBg ? "bg-navy-deep text-white" : "bg-white"}`}
    >
      <Container>
        <div className={`mx-auto flex w-full ${SITE_CONTENT_WIDTH_FAQ_ROW} flex-col items-center gap-10 md:gap-12`}>
          {section.title && (
            <SectionHeading
              as="h2"
              text={section.title}
              className={`${REVEAL_ITEM} w-full text-center text-[32px] font-semibold leading-[1.1] sm:text-[40px] lg:text-[48px] ${navyBg ? "text-white" : "text-navy"}`}
              multiline
            />
          )}

          {section.intro && (
            <div className={`${REVEAL_ITEM} w-full text-center ${navyBg ? "text-white/80" : "text-muted"}`}>
              <RichText
                html={section.intro}
                className={`!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-center !prose-p:leading-normal ${navyBg ? "!prose-p:text-inherit [&_a]:text-brand [&_a]:underline-offset-2 hover:[&_a]:text-brand/90" : ""}`}
              />
            </div>
          )}

          <div
            className={`flex w-full flex-col items-stretch gap-8 lg:flex-row lg:gap-7 ${hasPricing ? "lg:items-stretch" : "lg:items-start"}`}
          >
            <div
              className={`flex w-full min-w-0 flex-1 flex-col lg:max-w-[638px] ${hasPricing ? "gap-3.5 lg:self-stretch" : "gap-6"}`}
            >
              <Accordion items={accItems} variant="split" />

              {hasPricing && (
                <div className="flex w-full min-w-0 flex-col gap-3.5">
                  {section.pricingCtas.map((c, i) => {
                    const l = resolveLink(c.link, lang);
                    if (!l?.href) return null;
                    const t = c.text || l?.label;
                    return (
                      <Button
                        key={i}
                        href={l.href}
                        target={l.target}
                        variant="ctaNavyDeep"
                        ctaElevation="none"
                        ctaJustify="spread"
                        ctaFullWidth
                        showArrow
                        arrowContent={<FaqPricingCtaArrow image={c.trailing_icon} />}
                        ctaSize="default"
                        className={FAQ_PRICING_CTA_CLASS}
                      >
                        {t}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className={`${REVEAL_ITEM} w-full min-w-0 shrink-0 lg:w-[min(100%,489px)] lg:max-w-[489px] ${hasPricing ? "lg:flex lg:flex-col" : ""}`}
            >
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
                <div
                  className={`faq-split-contact-card flex min-h-0 w-full min-w-0 flex-col items-center justify-center gap-6 rounded-[14px] bg-gradient-to-b from-brand to-[#0569d7] p-8 shadow-[0_14px_40px_-12px_rgba(21,41,81,0.18)] sm:min-h-[520px] md:min-h-[580px] lg:gap-6 lg:p-[44px] ${hasPricing ? "lg:min-h-0 lg:flex-1" : "lg:min-h-[609px]"}`}
                >
                  <div className="flex w-full min-w-0 max-w-[401px] flex-col items-center gap-[27px] text-center text-white">
                    {(cardTitleLines.length > 0 || section.cardText) && (
                      <div className="flex w-full flex-col items-center gap-5">
                        {cardTitleLines.length > 0 && (
                          <h3 className={FAQ_CONTACT_CARD_TITLE_CLASS}>
                            {cardTitleLines.map((line, i) => (
                              <span key={i} className="block">
                                {line}
                              </span>
                            ))}
                          </h3>
                        )}
                        {section.cardText && (
                          <div className="w-full max-w-[307px]">
                            <RichText
                              html={section.cardText}
                              className="w-full !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-center !prose-p:text-lg !prose-p:font-semibold !prose-p:leading-[1.2] !prose-p:text-white sm:!prose-p:text-2xl"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {section.contactCtas.length > 0 && (
                      <div className="flex w-full min-w-0 flex-col items-stretch gap-4">
                        {section.contactCtas.map((c, i) => {
                          const l = resolveLink(c.ctaLink, lang);
                          if (!l?.href) return null;
                          return (
                            <ContactCtaPill
                              key={i}
                              href={l.href}
                              target={l.target}
                              text={c.ctaText || l.label}
                              icon={c.icon}
                              iconFallback={contactIconFallback(l.href, i)}
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
