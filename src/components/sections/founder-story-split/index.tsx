import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import type { FounderStorySplitSectionT } from "@/types/sections";

/** Figma `597:2283` (Group 111) — exported sparkle; displayed at ~27px with `rotate-180` per frame. */
const FOUNDER_STORY_SPARK_SRC = "/founder-story-spark.png";

export function FounderStorySplitSection(props: {
  section: FounderStorySplitSectionT;
  lang: Locale;
}) {
  const { section } = props;
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <section className="bg-[var(--palette-white)] py-10 lg:py-16">
      <Container className="max-w-[90rem]">
        <div
          className={`${REVEAL_ITEM} relative overflow-hidden rounded-[20px] bg-[radial-gradient(ellipse_120%_85%_at_50%_0%,var(--palette-white)_0%,var(--palette-surface)_42%,var(--palette-card)_100%)] px-6 py-9 shadow-[0_24px_60px_color-mix(in_srgb,var(--palette-brand)_12%,transparent)] sm:px-10 sm:py-11 lg:px-12 lg:py-14`}
        >
          {section.main_image ? (
            <div
              aria-hidden
              className="pointer-events-none absolute left-[53%] top-[4.75rem] z-[2] hidden size-[27px] -translate-x-1/2 lg:block lg:top-[5.25rem]"
            >
              {/* Figma wraps Group 111 in `rotate-180` (see 1083:46 / 597:2283). */}
              <div className="size-[27px] rotate-180">
                <Image
                  src={FOUNDER_STORY_SPARK_SRC}
                  alt=""
                  width={28}
                  height={28}
                  unoptimized
                  className="block size-[27px] max-h-none max-w-none select-none"
                  draggable={false}
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12 xl:gap-16">
            <div className="flex min-w-0 flex-1 flex-col gap-6 lg:max-w-[36rem] xl:max-w-[38rem]">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-[27px]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {section.avatar ? (
                      <div className="relative shrink-0 rounded-[12px] bg-[var(--palette-white)] p-[3px] shadow-[0_4px_14px_color-mix(in_srgb,var(--palette-navy-deep)_8%,transparent)]">
                        <div className="size-[56px] overflow-hidden rounded-[10px] bg-[var(--palette-brand)]">
                          <Media
                            image={section.avatar}
                            width={112}
                            height={112}
                            className="size-full object-cover object-center"
                            sizes="56px"
                            preferLargestSource
                          />
                        </div>
                      </div>
                    ) : null}

                    {titleLines.length > 0 ? (
                      <h2 className="min-w-0 font-sans text-[32px] font-semibold leading-tight tracking-[-0.04em] text-[var(--palette-navy)] sm:text-[40px] lg:text-[48px] lg:leading-[56px]">
                        {titleLines.map((line, i) => (
                          <span key={i} className="block">
                            {line}
                          </span>
                        ))}
                      </h2>
                    ) : null}
                  </div>

                  {section.subtitle ? (
                    <p className="font-sans text-[28px] font-medium leading-[1.22] text-[var(--palette-brand)] sm:text-[36px] lg:text-[40px]">
                      {section.subtitle}
                    </p>
                  ) : null}
                </div>

                {section.content ? (
                  <RichText
                    html={section.content}
                    className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] [&_p]:text-[var(--palette-muted)]! [&_p+_p]:mt-[18px]! [&_strong]:font-semibold [&_strong]:text-[var(--palette-navy)]"
                  />
                ) : null}
              </div>

              {section.conclusion ? (
                <p className="font-sans text-xl font-semibold leading-[1.4] text-[var(--palette-navy)] sm:text-[22px] lg:text-2xl">
                  {section.conclusion}
                </p>
              ) : null}
            </div>

            {section.main_image ? (
              <div
                className={`${REVEAL_ITEM} relative mx-auto w-full max-w-[460px] shrink-0 lg:mx-0 lg:mt-2 lg:w-[min(100%,460px)]`}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-2 top-4 z-0 aspect-[460/523] w-[min(100%,460px)] origin-center rotate-[-4deg] rounded-[14px] bg-[var(--palette-brand)] sm:left-4 sm:top-5"
                />
                <div className="relative z-10 aspect-[460/523] w-full max-w-[460px] translate-x-[5%] overflow-hidden rounded-[14px] sm:translate-x-[22px]">
                  <Media
                    image={section.main_image}
                    width={920}
                    height={1046}
                    className="h-full w-full object-cover object-center"
                    sizes="(min-width: 1024px) 460px, 90vw"
                    preferLargestSource
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
