import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import type { CombinedStrengthsSectionT } from "@/types/sections";

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
      <Container className="!max-w-[90rem]">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-6">
            <div
              className={`${REVEAL_ITEM} flex min-h-0 flex-col rounded-[20px] bg-[linear-gradient(180deg,var(--palette-brand)_0%,var(--palette-brand-strong)_100%)] p-8 sm:p-10 lg:min-h-[610px] lg:justify-center`}
            >
              <div className="flex w-full max-w-[33.9375rem] flex-col gap-[51px]">
                {titleLines.length > 0 ? (
                  <h2 className="font-sans text-[32px] font-semibold leading-[1.17] tracking-[-0.04em] text-[var(--palette-white)] sm:text-[40px] lg:text-[48px] lg:leading-[56px]">
                    {titleLines.map((line, i) => (
                      <span key={i} className="block">
                        {line}
                      </span>
                    ))}
                  </h2>
                ) : null}

                <div className="flex flex-col gap-9">
                  {section.left_rows.map((row, index) => (
                    <div key={index} className="contents">
                      {index > 0 ? (
                        <div
                          aria-hidden
                          className="h-px w-full max-w-[33.5rem] bg-[color-mix(in_srgb,var(--palette-white)_55%,transparent)]"
                        />
                      ) : null}
                      <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:gap-[29px]">
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
                            className="!prose-p:mb-0 !prose-p:mt-0 max-w-[24.375rem] !prose-p:text-[20px] !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-[var(--palette-white)] [&_strong]:font-semibold [&_strong]:text-[var(--palette-white)]"
                          />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${REVEAL_ITEM} flex flex-col gap-[29px]`}>
              {section.content_cards.map((card, i) => (
                <div
                  key={i}
                  className="rounded-[20px] bg-[var(--palette-white)] px-[34px] py-8 shadow-[0px_6px_20px_color-mix(in_srgb,var(--palette-accent)_22%,transparent)] sm:py-9 lg:min-h-[184px] lg:justify-center lg:py-[34px]"
                >
                  <div className="flex max-w-none flex-col gap-[14px] sm:gap-[15px]">
                    {card.title ? (
                      <h3 className="font-sans text-2xl font-semibold leading-[1.1] tracking-[-0.04em] text-[var(--palette-navy-deep)]">
                        {card.title}
                      </h3>
                    ) : null}
                    {card.text ? (
                      <RichText
                        html={card.text}
                        className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-[var(--palette-muted)] [&_strong]:font-semibold [&_strong]:text-[var(--palette-navy)]"
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(section.footer_logo || section.footer_text) && (
            <div
              className={`${REVEAL_ITEM} flex min-h-[111px] flex-col items-center justify-center gap-4 rounded-[20px] bg-[linear-gradient(98deg,var(--palette-navy-deep)_12%,var(--palette-accent)_52%,var(--palette-navy-deep)_92%)] px-6 py-8 sm:flex-row sm:gap-6 sm:py-7`}
            >
              {section.footer_logo ? (
                <div className="relative h-11 w-auto shrink-0 sm:h-12">
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
