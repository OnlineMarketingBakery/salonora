import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { WhySalonoraAndersSectionT } from "@/types/sections";

function InsightPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[14px] opacity-[0.24]"
      aria-hidden
    >
      <div
        className="absolute left-0 top-0 h-[160%] w-[75%] -translate-x-[8%] -translate-y-[10%]"
        style={{
          backgroundImage: `repeating-radial-gradient(
            circle at 18% 22%,
            transparent 0,
            transparent 20px,
            rgba(255, 255, 255, 0.16) 20px,
            rgba(255, 255, 255, 0.16) 21px
          )`,
        }}
      />
    </div>
  );
}

export function WhySalonoraAndersSection({
  section,
  lang,
}: {
  section: WhySalonoraAndersSectionT;
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
  const ctaLabel =
    primaryCta?.text || ctaLink?.label || (ctaHref ? "Meer informatie" : "");

  return (
    <section className="bg-[#ebf3fe] py-16 sm:py-20 md:pt-[88px] md:pb-[85px]">
      <Container className="!max-w-[85rem]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
          <div
            className={`${REVEAL_ITEM} flex w-full max-w-[min(100%,420px)] shrink-0 flex-col gap-6 lg:max-w-[382px]`}
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

          <div className={`${REVEAL_ITEM} relative w-full min-w-0 lg:flex-1`}>
            <div className="relative isolate overflow-visible rounded-[14px] bg-gradient-to-b from-[#3990f0] to-[#0569d7] px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10 lg:flex lg:min-h-[509px] lg:flex-col lg:px-14 lg:pt-10">
              <InsightPattern />
              <div className="relative z-10 flex w-full flex-1 flex-col items-center gap-8 lg:min-h-0 lg:flex-row lg:items-stretch lg:justify-center lg:gap-[45px]">
                <div className="mx-auto flex w-full max-w-[417px] flex-col items-center gap-[15px] lg:mx-0 lg:w-[417px] lg:max-w-[417px] lg:shrink-0 lg:self-center lg:items-stretch">
                  {section.insightHeading ? (
                    <p className="text-center font-sans text-[28px] font-semibold leading-tight text-white sm:text-[32px] lg:text-[34px] lg:leading-[56px]">
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
                                className="w-full text-center! !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-sm !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-[#002752] [&_p+_p]:mt-0! sm:!prose-p:text-[14px]"
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
                  <div className="relative z-20 flex w-full max-w-[280px] shrink-0 justify-center sm:max-w-[300px] lg:flex lg:w-[324px] lg:max-w-[324px] lg:shrink-0 lg:flex-col lg:items-center lg:justify-end lg:self-stretch lg:overflow-visible lg:leading-[0] lg:-pb-10">
                    <Media
                      image={section.phoneImage}
                      width={648}
                      height={886}
                      className="block h-auto w-full max-w-[280px] object-contain object-bottom leading-none drop-shadow-[0_20px_40px_rgba(0,39,82,0.35)] sm:max-w-[300px] lg:max-h-[min(443px,100%)] lg:w-full lg:max-w-[324px]"
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
