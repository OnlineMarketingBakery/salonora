/** @see Figma **1322:32** (“Frame 2147230002”) — brand disc + browser mockup; heading, three steps, pill CTA. */
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { StepsWithMediaSectionT, StepsWithMediaStepIconColorT } from "@/types/sections";

function BrowserChromeDots() {
  return (
    <div className="flex gap-[5px]" aria-hidden>
      <span className="size-2.5 shrink-0 rounded-full bg-[var(--palette-rose)]" />
      <span className="size-2.5 shrink-0 rounded-full bg-[var(--palette-star)]" />
      <span className="size-2.5 shrink-0 rounded-full bg-[var(--palette-showcase-mint)]" />
    </div>
  );
}

function BrowserChromeChevrons() {
  return (
    <div className="flex shrink-0 gap-[5px]" aria-hidden>
      <svg
        className="size-6 text-[var(--palette-muted)]"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 6L9 12L15 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="size-6 text-[var(--palette-muted)]"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 6L15 12L9 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function stepIconBg(accent: StepsWithMediaStepIconColorT): string {
  return accent === "pink" ? "bg-[var(--palette-rose)]" : "bg-[var(--palette-brand)]";
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

  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const steps = section.steps.filter(
    (s) => s.title.trim() !== "" || s.description.trim() !== "" || s.number.trim() !== "",
  );

  const visual = (
    <div className="relative mx-auto w-full max-w-[600px] shrink-0 justify-self-center lg:mx-0 lg:justify-self-start">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 aspect-square w-[min(100%,572px)] max-w-[95vw] -translate-x-1/2 rounded-full bg-[var(--palette-brand)]"
      />
      <div className="relative z-10 pt-[min(88px,12vw)]">
        <div
          className="overflow-hidden rounded-[20px] bg-[var(--palette-white)] shadow-[0px_25px_50px_-12px_color-mix(in_srgb,var(--palette-navy-deep)_25%,transparent),0px_0px_15px_0px_color-mix(in_srgb,var(--palette-navy-deep)_7%,transparent)]"
          data-browser-mockup
        >
          <div className="flex h-11 w-full items-center justify-between gap-7 px-4 py-2">
            <BrowserChromeDots />
            <BrowserChromeChevrons />
          </div>
          <div className="relative aspect-[560/316] w-full bg-[var(--palette-surface)]">
            {section.browser_image ? (
              <Media
                image={section.browser_image}
                width={1120}
                height={632}
                className="h-full w-full object-cover object-top"
                sizes="(min-width: 1024px) 560px, 90vw"
                preferLargestSource
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  const copy = (
    <div className="flex min-w-0 flex-col items-start gap-[34px] lg:max-w-[618px]">
      {titleLines.length > 0 ? (
        <h2 className="font-sans text-[40px] font-semibold leading-tight tracking-[-0.04em] text-[var(--palette-navy)] sm:text-[48px] sm:leading-[56px]">
          {titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h2>
      ) : null}

      {steps.length > 0 ? (
        <ol className="m-0 flex w-full list-none flex-col gap-0 p-0">
          {steps.map((step, index) => (
            <li
              key={index}
              className={
                index > 0
                  ? "mt-7 border-t border-[color-mix(in_srgb,var(--palette-brand)_14%,transparent)] pt-7"
                  : ""
              }
            >
              <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:gap-[21px]">
                <div
                  className={`flex size-[86px] shrink-0 flex-col items-center justify-center rounded-[24px] px-6 py-[26px] font-sans text-[48px] font-bold leading-none tracking-[-0.04em] text-[var(--palette-white)] ${stepIconBg(step.icon_color)}`}
                >
                  {step.number.trim() || String(index + 1)}
                </div>
                <div className="flex min-w-0 flex-col gap-3 text-[var(--palette-navy)]">
                  {step.title.trim() ? (
                    <p className="m-0 font-sans text-2xl font-semibold leading-[1.1]">{step.title.trim()}</p>
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
          ))}
        </ol>
      ) : null}

      {ctaHref && ctaLabel ? (
        <Button
          href={ctaHref}
          target={resolvedCta?.target}
          variant="ctaBrand"
          ctaSize="promo"
          ctaFullWidth={false}
          ctaElevation="none"
          ctaJustify="between"
          arrowClassName="size-6 shrink-0"
          className="w-[212px] shrink-0 !gap-[34px] !p-3 text-[18px] !font-medium leading-6 sm:!gap-[34px] sm:!p-3 md:!gap-[34px] md:!p-3"
        >
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  );

  return (
    <section lang={lang} className="bg-[var(--palette-white)] py-12 md:py-16 lg:py-[103px]">
      <Container className="!max-w-[85rem]">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-x-[57px] lg:gap-y-0">
          <div className={`${REVEAL_ITEM} order-1 min-w-0`}>{visual}</div>
          <div className={`${REVEAL_ITEM} order-2 min-w-0`}>{copy}</div>
        </div>
      </Container>
    </section>
  );
}
