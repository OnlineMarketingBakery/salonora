import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { WhyWeDoThisSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function WhyWeDoThisSection({ section }: { section: WhyWeDoThisSectionT; lang: Locale }) {
  return (
    <section className="bg-white py-20 md:py-24">
      <Container className="max-w-340!">
        <div className="relative">
          <div className="relative overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,var(--palette-brand),var(--palette-brand-strong))]">
            {section.backgroundGraphic ? (
              <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
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

            <div className="relative flex flex-col gap-10 px-6 py-12 sm:px-10 sm:py-14 lg:min-h-[415px] lg:justify-center lg:pl-[650px] lg:pr-16 lg:py-16">
              {section.behindGraphic ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-0 h-full w-[650px] overflow-hidden"
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

              <div className={`${REVEAL_ITEM} relative z-10 flex w-full flex-col items-start gap-6 lg:w-[535px]`}>
                {section.eyebrow ? (
                  <div className="inline-flex h-[42px] w-[200px] items-center justify-center rounded-[21px] bg-white px-3 text-base font-medium leading-[1.6] text-brand">
                    {section.eyebrow}
                  </div>
                ) : null}

                <div className="flex w-full flex-col items-start gap-[19px] text-white">
                  {section.title ? (
                    <h2 className="w-full font-sans text-[40px] font-semibold leading-[48px] tracking-[-0.04em] text-white sm:text-[48px] sm:leading-[56px]">
                      {section.title}
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
            </div>
          </div>

          {section.image ? (
            <div className={`${REVEAL_ITEM} pointer-events-none absolute left-0 top-0 z-20 hidden h-full w-[650px] lg:block`}>
              <div className="absolute left-10 bottom-0 translate-y-[-44px]">
                <Media
                  image={section.image}
                  width={1300}
                  height={830}
                  preferLargestSource
                  className="h-auto w-[460px] max-w-none object-contain object-bottom"
                  sizes="460px"
                />
              </div>
            </div>
          ) : null}

          {section.image ? (
            <div className={`${REVEAL_ITEM} -mt-6 w-full lg:hidden`}>
              <Media
                image={section.image}
                width={1120}
                height={1120}
                preferLargestSource
                className="mx-auto h-auto w-full max-w-[520px] object-contain object-bottom"
                sizes="92vw"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

