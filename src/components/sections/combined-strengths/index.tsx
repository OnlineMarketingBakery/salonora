import { Fragment } from "react";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import type { CombinedStrengthsSectionT } from "@/types/sections";

/**
 * Figma 1090:47 — Two columns (638px + gap + 638px @ 1300): solid brand panel + portrait rows;
 * three plain white floating cards (Figma shadow); flat navy footer strip. Accent field in CMS is unused visually.
 */
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
    <section lang={lang} className="bg-[var(--palette-surface)] py-10 lg:py-16">
      <Container className="!max-w-[81.25rem]">
        <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-6">
          {/* Top: equal-height columns, 24px gutter — matches Figma 732 − (70+638) */}
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-6">
            <div
              className={`${REVEAL_ITEM} flex h-full min-h-0 w-full flex-col rounded-[20px] bg-[var(--palette-brand)] p-8 sm:p-10 lg:min-h-[610px] lg:justify-center lg:p-12`}
            >
              <div className="flex w-full max-w-[33.6875rem] flex-col gap-[51px]">
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
                          className="h-px w-full max-w-[536px] shrink-0 bg-[color-mix(in_srgb,var(--palette-white)_42%,transparent)]"
                        />
                      ) : null}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-[29px]">
                        <div className="relative h-[124px] w-[124px] shrink-0 overflow-hidden rounded-[11px] bg-[var(--palette-white)] ring-1 ring-[color-mix(in_srgb,var(--palette-white)_85%,transparent)]">
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

            <div className={`${REVEAL_ITEM} flex w-full flex-col gap-[29px]`}>
              {section.content_cards.map((card, i) => {
                const titleBodyGap = i === 0 ? "gap-[14px]" : "gap-[15px]";
                return (
                  <div
                    key={i}
                    className={`flex w-full flex-col justify-center rounded-[20px] bg-[var(--palette-white)] px-[34px] py-[34px] shadow-[0px_6px_20px_rgba(129,154,205,0.26)] lg:min-h-[184px] ${titleBodyGap}`}
                  >
                    {card.title ? (
                      <h3 className="font-sans text-2xl font-semibold leading-[1.1] tracking-[-0.04em] text-navy-deep">
                        {card.title}
                      </h3>
                    ) : null}
                    {card.text ? (
                      <RichText
                        html={card.text}
                        className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-[var(--palette-muted)] [&_p]:!text-[var(--palette-muted)] [&_strong]:font-semibold [&_strong]:!text-[var(--palette-navy-deep)]"
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {(section.footer_logo || section.footer_text) && (
            <div
              className={`${REVEAL_ITEM} flex min-h-[111px] w-full flex-col items-center justify-center gap-4 rounded-[20px] bg-[var(--palette-navy-deep)] px-6 py-8 sm:flex-row sm:gap-6 sm:px-10`}
            >
              {section.footer_logo ? (
                <div className="relative h-10 w-auto shrink-0 sm:h-11">
                  <Media
                    image={section.footer_logo}
                    width={193}
                    height={84}
                    className="h-full w-auto max-w-[12rem] object-contain object-center"
                    sizes="200px"
                    preferLargestSource
                  />
                </div>
              ) : null}
              {section.footer_text ? (
                <p className="text-center font-sans text-lg font-semibold leading-snug text-[var(--palette-white)] sm:text-left sm:text-xl">
                  {section.footer_text}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
