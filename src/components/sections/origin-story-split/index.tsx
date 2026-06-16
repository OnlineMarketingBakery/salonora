import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { SplitPhotoStack } from "@/components/ui/SplitPhotoStack";
import { formatHeadingLines } from "@/lib/i18n/format-heading";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { SECTION_SHELL_SPLIT_TIGHT_BOTTOM } from "@/lib/layout/section-spacing";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { OriginStorySplitSectionT } from "@/types/sections";

/** Mask crop **597:2953** — 87.241px inset on 565.266px artboard width. */
const ORIGIN_PHOTO_OBJECT_POSITION = `${(87.241 / 565.266) * 100}% center`;

/** Figma **597:2338** — 16px regular, muted, 14px paragraph rhythm. */
const bodyProse = [
  "!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left",
  "!prose-p:font-sans !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted",
  "[&_p+p]:!mt-[14px] [&_strong]:font-semibold [&_strong]:text-navy-deep",
].join(" ");

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
    <section className={`overflow-visible bg-white ${SECTION_SHELL_SPLIT_TIGHT_BOTTOM}`}>
      <Container className="max-w-340! overflow-visible">
        {/* Figma **1063:27** — 626px copy + 54px gutter + ~497px visual = 1162px */}
        <div className="mx-auto grid w-full max-w-[1162px] grid-cols-1 items-center gap-10 overflow-visible lg:grid-cols-[626px_minmax(0,497px)] lg:items-center lg:gap-x-[54px] lg:gap-y-0">
          <div
            className={`${REVEAL_ITEM} flex w-full min-w-0 flex-col gap-5 lg:w-[626px] lg:max-w-[626px]`}
          >
            {section.eyebrow ? (
              <div className="inline-flex h-[42px] shrink-0 items-center justify-center self-start rounded-[21px] bg-brand/10 px-[21px] text-base font-medium leading-[1.6] text-brand">
                {section.eyebrow}
              </div>
            ) : null}

            {titleLines.length > 0 ? (
              <h2 className="font-sans text-[32px] font-semibold leading-tight text-navy-deep sm:text-[40px] lg:text-[48px] lg:leading-[56px]">
                {titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            ) : null}

            {section.body ? (
              <RichText html={section.body} className={bodyProse} />
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
            <div className={`${REVEAL_ITEM} w-full min-w-0 overflow-visible lg:-ml-[18.28px]`}>
              <SplitPhotoStack
                image={section.image}
                objectPosition={ORIGIN_PHOTO_OBJECT_POSITION}
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
