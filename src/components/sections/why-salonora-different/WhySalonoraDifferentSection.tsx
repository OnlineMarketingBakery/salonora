import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { WhySalonoraDifferentSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import { InsightPattern } from "@/components/sections/why-salonora-shared/InsightPattern";

export function WhySalonoraDifferentSection({
  section,
  lang,
}: {
  section: WhySalonoraDifferentSectionT;
  lang: Locale;
}) {
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const insightCards = section.insightCards.filter((c) => c.text.trim());
  const primaryCta = section.ctas[0];
  const ctaLink = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaHref = ctaLink?.href;
  const ctaLabel = primaryCta?.text || ctaLink?.label || (ctaHref ? "Meer informatie" : "");

  return (
    <section className="bg-surface py-16 sm:py-20 md:pt-[88px] md:pb-[85px]">
      <Container className="max-w-[1300px]!">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
          <div
            className={`${REVEAL_ITEM} flex w-full max-w-[382px] shrink-0 flex-col gap-6`}
          >
            <div className="flex flex-col gap-[14px]">
              {titleLines.length > 0 ? (
                <h2 className="font-sans text-[32px] font-semibold leading-tight tracking-[-0.04em] text-[#002752] sm:text-[40px] sm:leading-[1.1] md:text-[44px] lg:text-[48px] lg:leading-[56px]">
                  {titleLines.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              ) : null}
              {section.paragraph1 ? (
                <RichText
                  html={section.paragraph1}
                  className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-[#435780] [&_p+_p]:!mt-0"
                />
              ) : null}
              {section.paragraph2 ? (
                <RichText
                  html={section.paragraph2}
                  className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-[#435780] [&_p+_p]:!mt-0"
                />
              ) : null}
            </div>
            {ctaHref ? (
              <Button
                href={ctaHref}
                target={ctaLink?.target}
                variant="ctaBrand"
                ctaElevation="none"
                ctaFullWidth={false}
                ctaSize="compact"
                className="!h-12 max-w-full self-start !rounded-[24px] !px-[17px] shadow-[0px_6px_10px_rgba(57,144,240,0.54)] sm:w-[273px] sm:max-w-[273px]"
                arrowClassName="h-5 w-5"
              >
                {ctaLabel}
              </Button>
            ) : null}
          </div>

          <div className={`${REVEAL_ITEM} relative w-full min-w-0 lg:w-[898px] lg:max-w-[898px] lg:shrink-0`}>
            <div className="relative isolate overflow-hidden rounded-[14px] bg-linear-to-b from-brand to-brand-strong px-5 py-8 sm:px-8 sm:py-10 lg:flex lg:h-[509px] lg:items-center lg:justify-center lg:px-14 lg:py-0">
              <InsightPattern />
              <div className="relative z-10 flex w-full flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-[45px]">
                <div className="flex w-full max-w-[417px] flex-col items-center gap-[15px] lg:shrink-0 lg:items-stretch">
                  {section.insightHeading ? (
                    <p className="text-center font-sans text-[28px] font-semibold leading-[56px] text-white sm:text-[32px] lg:text-[34px]">
                      {section.insightHeading}
                    </p>
                  ) : null}
                  {insightCards.length > 0 ? (
                    <div className="flex w-full flex-col gap-[14px]">
                      {insightCards.map((card, i) => {
                        const raw = card.text.trim();
                        const looksLikeHtml = /<\s*[a-z][\s\S]*>/i.test(raw);
                        return (
                          <div
                            key={`${section.id}-insight-${i}`}
                            className="flex min-h-0 w-full min-w-0 items-center justify-center rounded-[24.5px] bg-white p-6"
                          >
                            {looksLikeHtml ? (
                              <RichText
                                html={card.text}
                                className="w-full !text-center !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-sm !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-[#002752] [&_p+_p]:!mt-0 sm:!prose-p:text-[14px]"
                              />
                            ) : (
                              <p className="w-full text-center font-sans text-sm font-normal leading-[1.4] text-[#002752] sm:text-[14px] whitespace-pre-line">
                                {raw}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                {section.phoneImage ? (
                  <div className="relative z-20 flex h-[300px] w-full max-w-[324px] shrink-0 items-end justify-center sm:h-[380px] lg:h-[443px] lg:w-[324px]">
                    <Media
                      image={section.phoneImage}
                      width={648}
                      height={886}
                      className="block h-full w-full object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,39,82,0.35)]"
                      sizes="(min-width: 1024px) 324px, 70vw"
                      preferLargestSource
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
