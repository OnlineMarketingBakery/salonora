import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { formatHeadingLines } from "@/lib/i18n/format-heading";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { SECTION_SHELL_SPLIT } from "@/lib/layout/section-spacing";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import { SparkMark } from "@/components/ui/SparkMark";
import type { OriginStorySplitSectionT } from "@/types/sections";

export function OriginStorySplitSection({
  section,
  lang,
}: {
  section: OriginStorySplitSectionT;
  lang: Locale;
}) {
  const primaryCta = section.ctas[0];
  const ctaLink = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaHref = ctaLink?.href;
  const ctaLabel =
    primaryCta?.text || ctaLink?.label || (ctaHref ? "Meer informatie" : "");

  const titleLines = formatHeadingLines(section.title ?? "");

  return (
    <section className={`overflow-visible bg-white ${SECTION_SHELL_SPLIT}`}>
      <Container className="max-w-340! overflow-visible">
        {/* Figma `1063:27` — 626px copy + 54px gutter + 460px image (+22px photo offset) = 1162px */}
        <div className="mx-auto grid w-full max-w-[1162px] grid-cols-1 items-center gap-10 overflow-visible lg:grid-cols-[626px_482px] lg:gap-x-[54px]">
          <div
            className={`${REVEAL_ITEM} flex w-full min-w-0 flex-col gap-6 lg:w-[626px] lg:max-w-[626px]`}
          >
            {section.eyebrow ? (
              <div className="inline-flex h-[42px] self-start items-center justify-center rounded-[21px] bg-pill px-[21px] text-base font-medium leading-[1.6] text-brand">
                {section.eyebrow}
              </div>
            ) : null}

            {titleLines.length > 0 ? (
              <h2 className="font-sans text-[32px] font-semibold leading-tight text-navy sm:text-[40px] lg:text-[48px] lg:leading-[56px]">
                {titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            ) : null}

            {section.body ? (
              <RichText
                html={section.body}
                className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p+_p]:mt-[14px]! [&_strong]:font-semibold [&_strong]:text-navy-deep"
              />
            ) : null}

            {ctaHref ? (
              <Button
                href={ctaHref}
                target={ctaLink?.target}
                variant="ctaBrand"
                ctaElevation="none"
                ctaFullWidth={false}
                className="h-12! max-w-full self-start whitespace-normal shadow-[0px_6px_10px_rgba(57,144,240,0.54)] sm:whitespace-nowrap"
              >
                {ctaLabel}
              </Button>
            ) : null}
          </div>

          {section.image ? (
            <div
              className={`${REVEAL_ITEM} relative mx-auto w-full max-w-[482px] overflow-visible pt-7 lg:mx-0 lg:w-[482px] lg:pt-[27px]`}
            >
              {/* Figma `597:2971` — ~7px left of photo; sits in top padding so it is not clipped */}
              <div
                aria-hidden
                className="pointer-events-none absolute -left-2 -top-1 z-30 text-brand lg:-left-[18px] lg:top-[10px]"
              >
                <SparkMark />
              </div>

              <div className="relative mx-auto w-full max-w-[460px]">
                {/* Blue backing tracks the photo's aspect ratio on mobile; fixed Figma size at lg. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0 rotate-[-4.13deg] rounded-[14px] bg-brand lg:inset-auto lg:left-0 lg:top-0 lg:h-[524px] lg:w-[460px]"
                />
                <div className="relative z-10 aspect-460/523 w-full translate-x-[2%] overflow-hidden rounded-[14px] sm:translate-x-[22px]">
                  <Media
                    image={section.image}
                    width={920}
                    height={1046}
                    className="h-full w-full object-cover object-center "
                    sizes="(min-width: 1024px) 460px, 90vw"
                    preferLargestSource
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
