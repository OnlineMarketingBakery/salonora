import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { SplitPhotoStack } from "@/components/ui/SplitPhotoStack";
import { formatHeadingLines } from "@/lib/i18n/format-heading";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { SECTION_SHELL_FOUNDER_STORY } from "@/lib/layout/section-spacing";
import type { Locale } from "@/lib/i18n/locales";
import type { FounderStorySplitSectionT } from "@/types/sections";

/** Figma `597:2281` — soft wash behind `597:2282` (`mix-blend-color`). */
const CARD_BG_SRC = "/founder-story-card-bg.png";
/** Figma `1083:46` / `597:2279` — card 1298×756, r20 */
const CARD_MAX = 1298;

/** Mask crop **597:2290** — 78×133px inset on 608×912 artboard. */
const FOUNDER_PHOTO_OBJECT_POSITION = `${(78 / 608) * 100}% ${(133 / 912) * 100}%`;
export function FounderStorySplitSection(props: {
  section: FounderStorySplitSectionT;
  lang: Locale;
}) {
  const { section } = props;
  const titleLines = formatHeadingLines(section.title ?? "");

  return (
    <section className={`bg-[var(--palette-white)] ${SECTION_SHELL_FOUNDER_STORY}`}>
      <Container className="max-w-340!">
        <div className="mx-auto w-full max-w-[1298px]">
          <div
            className={`${REVEAL_ITEM} relative isolate min-h-0 rounded-[20px] lg:h-[756px]`}
          >
            {/* Figma `597:2280` — texture + brand wash (clip only the background) */}
            <div
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[20px]"
              aria-hidden
            >
              <Image
                src={CARD_BG_SRC}
                alt=""
                fill
                unoptimized
                className="object-cover"
                sizes={`(min-width: ${CARD_MAX}px) ${CARD_MAX}px, 100vw`}
                style={{
                  objectPosition: "50% 0%",
                  transform: "scale(1.385)",
                  transformOrigin: "50% 0%",
                }}
              />
              <div
                className="absolute inset-0 bg-[var(--palette-brand)] mix-blend-color"
                aria-hidden
              />
            </div>

            {/* Figma `1701:80` — pl102 pr118; copy 528; gap90; image460 (+14px offset) */}
            <div className="relative z-[1] overflow-visible px-6 py-10 sm:px-10 sm:py-12 lg:grid lg:h-full lg:grid-cols-[528px_minmax(0,497px)] lg:items-center lg:gap-x-[90px] lg:px-[102px] lg:pr-[118px] lg:py-0">
              <div className="flex min-w-0 flex-col gap-[24px] lg:w-[528px] lg:max-w-[528px]">
                <div className="flex flex-col gap-[27px]">
                  <div className="flex flex-wrap items-center gap-[10px]">
                    {section.avatar ? (
                      <div className="relative shrink-0 rounded-[12px] bg-[var(--palette-white)] p-[3px]">
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
                      <h2 className="min-w-0 font-sans text-[32px] font-semibold leading-none tracking-[-0.04em] text-navy sm:text-[40px] lg:text-[48px] lg:leading-[56px]">
                        {titleLines.map((line, i) => (
                          <span key={i} className="block lg:whitespace-nowrap">
                            {line}
                          </span>
                        ))}
                      </h2>
                    ) : null}
                  </div>

                  {section.subtitle ? (
                    <p className="font-sans text-[26px] font-medium leading-[1.22] text-brand sm:text-[34px] lg:text-[40px]">
                      {section.subtitle}
                    </p>
                  ) : null}
                </div>

                {section.content ? (
                  <RichText
                    html={section.content}
                    className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] [&_p]:text-muted! [&_p+p]:mt-[18px]! [&_strong]:font-semibold [&_strong]:text-navy"
                  />
                ) : null}

                {section.conclusion ? (
                  <p className="font-sans text-xl font-semibold leading-[1.4] text-navy lg:text-[24px]">
                    {section.conclusion}
                  </p>
                ) : null}
              </div>

              {section.main_image ? (
                <div
                  className={`${REVEAL_ITEM} mx-auto mt-8 w-full min-w-0 overflow-visible sm:mt-10 lg:mx-0 lg:ml-[9.72px]`}
                >
                  <SplitPhotoStack
                    image={section.main_image}
                    objectPosition={FOUNDER_PHOTO_OBJECT_POSITION}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
