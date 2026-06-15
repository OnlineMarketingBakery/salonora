import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { formatHeadingLines } from "@/lib/i18n/format-heading";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { WhySalonoraDifferentSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import { WhySalonoraInsightPanel } from "@/components/sections/why-salonora-shared/WhySalonoraInsightPanel";

export function WhySalonoraDifferentSection({
  section,
  lang,
}: {
  section: WhySalonoraDifferentSectionT;
  lang: Locale;
}) {
  const titleLines = formatHeadingLines(section.title ?? "");

  const insightCards = section.insightCards.filter((c) => c.text.trim());
  const primaryCta = section.ctas[0];
  const ctaLink = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaHref = ctaLink?.href;
  const ctaLabel = primaryCta?.text || ctaLink?.label || (ctaHref ? "Meer informatie" : "");

  return (
    <section className="bg-surface py-16 sm:py-20 md:pt-[88px] md:pb-[85px]">
      <Container>
        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[382fr_898fr] lg:items-center lg:gap-5">
          <div
            className={`${REVEAL_ITEM} flex min-w-0 w-full flex-col gap-6`}
          >
            <div className="flex flex-col gap-[14px]">
              {titleLines.length > 0 ? (
                <h2 className="font-sans text-[32px] font-semibold leading-tight text-[#002752] sm:text-[40px] sm:leading-[1.1] lg:text-[48px] lg:leading-[56px]">
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
                ctaFullWidth={false}
                className="self-start"
              >
                {ctaLabel}
              </Button>
            ) : null}
          </div>

          <div className={`${REVEAL_ITEM} min-w-0 w-full`}>
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
