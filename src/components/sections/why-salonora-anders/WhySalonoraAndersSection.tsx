import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { WhySalonoraAndersSectionT } from "@/types/sections";
import { WhySalonoraInsightPanel } from "@/components/sections/why-salonora-shared/WhySalonoraInsightPanel";

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
    <section className="bg-surface py-16 sm:py-20 md:pt-[88px] md:pb-[85px]">
      <Container className="max-w-[1300px]!">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
          <div
            className={`${REVEAL_ITEM} flex w-full max-w-[382px] shrink-0 flex-col gap-6`}
          >
            <div className="flex flex-col gap-[14px]">
              {titleLines.length > 0 ? (
                <h2 className="font-sans text-[32px] font-semibold leading-tight text-navy-deep sm:text-[40px] sm:leading-[1.1] lg:text-[48px] lg:leading-[56px]">
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
                  className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p+_p]:!mt-0"
                />
              ) : null}
              {section.paragraph2 ? (
                <RichText
                  html={section.paragraph2}
                  className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p+_p]:!mt-0"
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
                className="!h-12 w-full max-w-[273px] self-start !rounded-[24px] !px-[17px] shadow-[0px_6px_10px_rgba(57,144,240,0.54)] lg:!w-[273px] lg:!min-w-[273px]"
                arrowClassName="h-5 w-5"
              >
                {ctaLabel}
              </Button>
            ) : null}
          </div>

          <div
            className={`${REVEAL_ITEM} w-full min-w-0 lg:w-[898px] lg:max-w-[898px] lg:shrink-0`}
          >
            <WhySalonoraInsightPanel
              sectionId={section.id}
              insightHeading={section.insightHeading}
              insightCards={insightCards}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
