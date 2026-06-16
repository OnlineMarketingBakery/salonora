/** @see Figma **1322:32** â€” brand disc + CMS browser mockup image; heading, three steps, pill CTA. */
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { formatHeadingLines } from "@/lib/i18n/format-heading";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { SECTION_SHELL_STEPS_WITH_MEDIA } from "@/lib/layout/section-spacing";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { StepsWithMediaSectionT, StepsWithMediaStepIconColorT } from "@/types/sections";
import { Fragment } from "react";

function stepIconBg(accent: StepsWithMediaStepIconColorT): string {
  return accent === "pink" ? "bg-[#d07d92]" : "bg-[var(--palette-brand)]";
}

export function StepsWithMediaSection({
  section,
  lang,
}: {
  section: StepsWithMediaSectionT;
  lang: Locale;
}) {
  const resolvedCta = resolveLink(section.cta_link, lang);
  const ctaLabel =
    resolvedCta?.label?.trim() || section.cta_link?.title?.trim() || "";
  const ctaHref = resolvedCta?.href;

  const titleLines = formatHeadingLines(section.title ?? "");

  const steps = section.steps.filter(
    (s) => s.title.trim() !== "" || s.description.trim() !== "" || s.number.trim() !== "",
  );

  /**
   * Mockup sits in normal flow (always centered in its column, never overflows). The blue disc
   * is centered BEHIND it at 86% of the mockup width, so the mockup is bigger than the disc and
   * overflows it left/right, while the round disc shows even blue domes above and below.
   */
  const visual = (
    <div className="relative mx-auto flex w-full max-w-[440px] shrink-0 items-center justify-center sm:max-w-[560px] lg:mx-0 lg:max-w-[760px]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--palette-brand)]"
      />
      {section.browser_image ? (
        <Media
          image={section.browser_image}
          width={1600}
          height={1043}
          quality={95}
          className="relative block h-auto w-full drop-shadow-[0_18px_40px_rgba(21,41,81,0.20)]"
          sizes="(min-width: 1024px) 760px, 92vw"
          preferLargestSource
        />
      ) : null}
    </div>
  );

  const copy = (
    <div className="relative z-10 flex min-w-0 flex-col items-start gap-6 sm:gap-8 lg:max-w-[618px] lg:gap-[34px]">
      {titleLines.length > 0 ? (
        <h2 className="font-sans text-[32px] font-bold leading-tight text-[var(--palette-navy)] sm:text-[40px] lg:text-[48px] lg:leading-[56px]">
          {titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h2>
      ) : null}

      {steps.length > 0 ? (
        <ol className="m-0 flex w-full list-none flex-col gap-7 p-0">
          {steps.map((step, index) => (
            <Fragment key={index}>
              <li>
                <div className="flex flex-row items-start gap-4 sm:items-center sm:gap-[21px]">
                  <div
                    className={`flex size-14 shrink-0 items-center justify-center rounded-2xl font-sans text-[32px] font-bold leading-none text-[var(--palette-white)] sm:size-[72px] sm:rounded-[20px] sm:text-[40px] lg:size-[86px] lg:rounded-[24px] lg:text-[48px] ${stepIconBg(step.icon_color)}`}
                  >
                    {step.number.trim() || String(index + 1)}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5 text-[var(--palette-navy)] sm:gap-3 sm:pt-0">
                    {step.title.trim() ? (
                      <p className="m-0 font-sans text-xl font-semibold leading-[1.15] sm:text-2xl sm:leading-[1.1]">
                        {step.title.trim()}
                      </p>
                    ) : null}
                    {step.description.trim() ? (
                      <RichText
                        html={step.description}
                        className="!prose-p:mb-0 !prose-p:mt-0 [&_p+p]:mt-2 [&_p]:text-base [&_p]:font-normal [&_p]:leading-[1.4] [&_p]:text-[var(--palette-muted)] prose-strong:font-semibold prose-strong:text-[var(--palette-navy)]"
                      />
                    ) : null}
                  </div>
                </div>
              </li>
              {index < steps.length - 1 ? (
                <li
                  aria-hidden
                  className="h-px w-full bg-[color-mix(in_srgb,var(--palette-brand)_14%,transparent)]"
                />
              ) : null}
            </Fragment>
          ))}
        </ol>
      ) : null}

      {ctaHref && ctaLabel ? (
        <Button
          href={ctaHref}
          target={resolvedCta?.target}
          variant="ctaBrand"
          ctaFullWidth={false}
          ctaElevation="none"
          className="shrink-0 self-start"
        >
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  );

  return (
    <section
      lang={lang}
      className={`bg-[var(--palette-white)] ${SECTION_SHELL_STEPS_WITH_MEDIA}`}
    >
      <Container>
        <div className="grid items-center gap-y-12 gap-x-12 lg:grid-cols-2 lg:gap-x-[57px] lg:gap-y-0">
          <div className={`${REVEAL_ITEM} order-1 min-w-0`}>{visual}</div>
          <div className={`${REVEAL_ITEM} order-2 min-w-0`}>{copy}</div>
        </div>
      </Container>
    </section>
  );
}
