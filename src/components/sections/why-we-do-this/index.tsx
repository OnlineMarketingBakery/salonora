import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { SECTION_SHELL_AFTER_HERO } from "@/lib/layout/section-spacing";
import { formatHeadingLines } from "@/lib/i18n/format-heading";
import type { Locale } from "@/lib/i18n/locales";
import type { WhyWeDoThisSectionT } from "@/types/sections";

export function WhyWeDoThisSection({
  section,
}: {
  section: WhyWeDoThisSectionT;
  lang: Locale;
}) {
  const titleText = formatHeadingLines(section.title ?? "").join(" ");

  return (
    <section className={`bg-white ${SECTION_SHELL_AFTER_HERO}`}>
      <Container className="max-w-340!">
        <div className="relative">
          <div className="relative overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,var(--palette-brand),var(--palette-brand-strong))]">
            {section.backgroundGraphic ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0"
              >
                <Media
                  image={section.backgroundGraphic}
                  width={2624}
                  height={830}
                  preferLargestSource
                  className="h-full w-full object-cover object-left opacity-100"
                  sizes="(min-width: 1024px) 1312px, 100vw"
                />
              </div>
            ) : null}

            <div className="relative flex flex-col gap-8 px-6 pt-10 sm:px-10 sm:pt-12 lg:min-h-[415px] lg:justify-center lg:py-12 lg:pl-[650px] lg:pr-14">
              {section.behindGraphic ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-0 hidden h-full w-[650px] overflow-hidden lg:block"
                >
                  <Media
                    image={section.behindGraphic}
                    width={1300}
                    height={830}
                    preferLargestSource
                    className="absolute left-0 top-1/2 h-auto w-[650px] -translate-y-1/2 object-contain opacity-100"
                    sizes="650px"
                  />
                </div>
              ) : null}

              <div
                className={`${REVEAL_ITEM} relative z-10 flex w-full flex-col items-start gap-5 lg:w-[560px]`}
              >
                {section.eyebrow ? (
                  <div className="inline-flex h-[42px] w-[200px] items-center justify-center rounded-[21px] bg-white px-3 text-base font-medium leading-[1.6] text-brand">
                    {section.eyebrow}
                  </div>
                ) : null}

                <div className="flex w-full min-w-0 flex-col items-start gap-[19px] text-white">
                  {titleText ? (
                    <h2 className="w-full min-w-0 font-sans text-[32px] font-semibold leading-tight text-white sm:text-[40px] lg:text-[48px] lg:leading-[56px] lg:whitespace-nowrap">
                      {titleText}
                    </h2>
                  ) : null}

                  {section.body ? (
                    <RichText
                      html={section.body}
                      className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.6] !prose-p:text-white/90 [&_p+_p]:mt-[18px]! [&_strong]:font-semibold [&_strong]:text-white"
                    />
                  ) : null}

                  {section.highlightLine ? (
                    <RichText
                      html={section.highlightLine}
                      className="text-[20px] font-semibold leading-[1.6] text-white [&_p]:m-0"
                    />
                  ) : null}
                </div>
              </div>

              {section.image ? (
                <div
                  className={`${REVEAL_ITEM} relative z-10 mx-auto flex w-full max-w-[420px] items-end justify-center lg:hidden`}
                >
                  {section.behindGraphic ? (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-0"
                    >
                      <Media
                        image={section.behindGraphic}
                        width={1300}
                        height={830}
                        preferLargestSource
                        className="h-full w-full object-contain object-center opacity-100"
                        sizes="(max-width: 1023px) 80vw, 0px"
                      />
                    </div>
                  ) : null}
                  <Media
                    image={section.image}
                    width={1120}
                    height={1120}
                    preferLargestSource
                    className="relative z-10 mx-auto h-auto w-full max-w-[340px] object-contain object-bottom"
                    sizes="(max-width: 1023px) 70vw, 0px"
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Figma 597:2909 — person 366×436, bottom-aligned to the 415px card,
              cropped to head→hands (source is a tall full-body cutout), ~21px above card top. */}
          {section.image ? (
            <div
              className={`${REVEAL_ITEM} pointer-events-none absolute bottom-0 left-[120px] z-20 hidden h-[436px] w-[366px] overflow-hidden lg:block`}
            >
              <Media
                image={section.image}
                width={451}
                height={982}
                preferLargestSource
                className="h-auto w-full max-w-none object-top"
                sizes="366px"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
