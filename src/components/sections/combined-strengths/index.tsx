import { Fragment } from "react";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import type {
  CombinedStrengthsCardAccentT,
  CombinedStrengthsSectionT,
} from "@/types/sections";

function cardAccentStripeClass(accent: CombinedStrengthsCardAccentT): string {
  if (accent === "rose") {
    return "bg-[linear-gradient(90deg,var(--palette-white)_0%,color-mix(in_srgb,var(--palette-rose)_52%,var(--palette-white))_45%,color-mix(in_srgb,var(--palette-rose-soft)_48%,var(--palette-white))_55%,var(--palette-white)_100%)]";
  }
  return "bg-[linear-gradient(90deg,var(--palette-white)_0%,color-mix(in_srgb,var(--palette-brand)_48%,var(--palette-white))_48%,color-mix(in_srgb,var(--palette-brand-strong)_42%,var(--palette-white))_52%,var(--palette-white)_100%)]";
}

/** Reference layout: solid blue strengths panel; white cards with blue/pink top+bottom hairlines; footer band brighter blue at edges, deep navy in the middle */
export function CombinedStrengthsSection({
  section,
  lang,
}: {
  section: CombinedStrengthsSectionT;
  lang: Locale;
}) {
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <section lang={lang} className="bg-[var(--palette-white)] py-10 lg:py-16">
      <Container className="!max-w-[81.25rem]">
        <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-6">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-6">
            {/* Left: solid brand panel */}
            <div
              className={`${REVEAL_ITEM} flex min-h-0 w-full flex-col rounded-[20px] bg-[var(--palette-brand)] p-8 sm:p-10 lg:min-h-[610px] lg:justify-center lg:p-12`}
            >
              <div className="mx-auto flex w-full max-w-[33.6875rem] flex-col gap-[51px]">
                {titleLines.length > 0 ? (
                  <h2 className="font-sans text-[32px] font-semibold leading-none tracking-[-0.04em] text-[var(--palette-white)] sm:text-[40px] lg:text-[48px]">
                    {titleLines.map((line, i) => (
                      <span key={i} className="block leading-[56px]">
                        {line}
                      </span>
                    ))}
                  </h2>
                ) : null}

                <div className="flex flex-col gap-9">
                  {section.left_rows.map((row, index) => (
                    <Fragment key={index}>
                      {index > 0 ? (
                        <div
                          aria-hidden
                          className="h-px w-full max-w-[536px] shrink-0 bg-[color-mix(in_srgb,var(--palette-white)_58%,transparent)]"
                        />
                      ) : null}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-[29px]">
                        <div className="relative h-[124px] w-[124px] shrink-0 overflow-hidden rounded-[11px] bg-[var(--palette-white)]">
                          {row.image ? (
                            <Media
                              image={row.image}
                              width={248}
                              height={248}
                              className="h-full w-full object-cover"
                              sizes="124px"
                              preferLargestSource
                            />
                          ) : null}
                        </div>
                        {row.text ? (
                          <RichText
                            html={row.text}
                            className="!prose-p:mb-0 !prose-p:mt-0 max-w-[390px] min-w-0 shrink !prose-p:text-[20px] !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-[var(--palette-white)] [&_p]:!text-[var(--palette-white)] [&_strong]:font-semibold [&_strong]:!text-[var(--palette-white)]"
                          />
                        ) : null}
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: stacked cards with blue / pink top+bottom accents */}
            <div className={`${REVEAL_ITEM} flex w-full flex-col gap-[29px]`}>
              {section.content_cards.map((card, i) => {
                const titleGapClass = i === 0 ? "gap-[14px]" : "gap-[15px]";
                const titleColorClass = i === 0 ? "text-navy" : "text-navy-deep";
                const stripe = cardAccentStripeClass(card.accent);
                return (
                  <div
                    key={i}
                    className={`relative flex min-h-0 w-full flex-col justify-center overflow-hidden rounded-[20px] bg-[var(--palette-white)] px-[34px] py-[34px] shadow-[0px_6px_20px_rgba(129,154,205,0.26)] lg:min-h-[184px] ${titleGapClass}`}
                  >
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute inset-x-0 top-0 z-[1] h-[2px] ${stripe}`}
                    />
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[2px] ${stripe}`}
                    />
                    {card.title ? (
                      <h3
                        className={`relative z-[2] font-sans text-2xl font-semibold leading-[1.1] tracking-[-0.04em] ${titleColorClass}`}
                      >
                        {card.title}
                      </h3>
                    ) : null}
                    {card.text ? (
                      <RichText
                        html={card.text}
                        className="relative z-[2] !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-[var(--palette-muted)] [&_p]:!text-[var(--palette-muted)] [&_strong]:font-semibold [&_strong]:!text-[var(--palette-navy)]"
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {(section.footer_logo || section.footer_text) && (
            <div
              className={`${REVEAL_ITEM} relative isolate min-h-[111px] w-full overflow-hidden rounded-[20px] bg-[linear-gradient(90deg,var(--palette-brand)_0%,var(--palette-navy-deep)_40%,var(--palette-navy-deep)_60%,var(--palette-brand)_100%)] px-6 py-8 shadow-[inset_0_0_70px_color-mix(in_srgb,var(--palette-navy-deep)_45%,transparent)] sm:px-10`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_120%_at_50%_50%,color-mix(in_srgb,var(--palette-navy-deep)_88%,transparent)_0%,transparent_72%)]"
              />
              <div className="relative z-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
                {section.footer_logo ? (
                  <div className="relative h-11 w-auto shrink-0 sm:h-12">
                    <Media
                      image={section.footer_logo}
                      width={193}
                      height={84}
                      className="h-full w-auto max-w-[13rem] object-contain object-center drop-shadow-[0_1px_2px_color-mix(in_srgb,var(--palette-navy-deep)_35%,transparent)]"
                      sizes="220px"
                      preferLargestSource
                    />
                  </div>
                ) : null}
                {section.footer_text ? (
                  <p className="max-w-[22rem] text-center font-sans text-xl font-bold leading-tight text-[var(--palette-white)] drop-shadow-[0_1px_0_color-mix(in_srgb,var(--palette-navy-deep)_40%,transparent)] sm:max-w-none sm:text-left sm:text-2xl sm:leading-snug">
                    {section.footer_text}
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
