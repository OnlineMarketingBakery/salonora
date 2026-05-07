import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import type { FounderStorySplitSectionT } from "@/types/sections";

/** Figma `597:2281` — soft wash behind `597:2282` (`mix-blend-color`). */
const CARD_BG_SRC = "/founder-story-card-bg.png";
/** Card width / grid — Figma 1083:46 */
const CARD_MAX = 1298;

/**
 * Figma `597:2283` (Group 111) — three stroked bars (~27.37px).
 * Inline SVG + `currentColor` avoids blurry PNG / wrong contrast on the gradient wash.
 */
function FounderStorySparkMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 28 28"
      width={28}
      height={28}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M22.25 5v17.5"
        stroke="currentColor"
        strokeWidth={2.35}
        strokeLinecap="round"
      />
      <path
        d="M5.75 7.25 L14 14.25"
        stroke="currentColor"
        strokeWidth={2.35}
        strokeLinecap="round"
      />
      <path
        d="M5.25 21.25h13.25"
        stroke="currentColor"
        strokeWidth={2.35}
        strokeLinecap="round"
      />
    </svg>
  );
}

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
        <div className="mx-auto w-full max-w-[1298px]">
          <div
            className={`${REVEAL_ITEM} isolate relative min-h-0 overflow-hidden rounded-[20px] shadow-[0_24px_80px_color-mix(in_srgb,var(--palette-brand)_22%,transparent)] lg:min-h-[756px]`}
          >
            {/* Figma `597:2280` — texture + brand wash (`z-0` below copy + accent) */}
            <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
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

            <div className="relative z-[1] flex flex-col gap-10 px-6 pb-12 pt-11 sm:px-10 lg:grid lg:grid-cols-[528px_460px] lg:gap-x-[118px] lg:gap-y-0 lg:px-[102px] lg:pb-[166px] lg:pt-[157px]">
              {/* Figma `597:2954`: col gap 24; header block internal gap 27; paragraphs gap 18 */}
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
                      <h2 className="min-w-0 font-sans text-[30px] font-semibold leading-none tracking-[-0.04em] text-navy sm:text-[40px] lg:text-[48px] lg:leading-[56px]">
                        {titleLines.map((line, i) => (
                          <span key={i} className="block">
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

              {/* Figma `597:2287` + `597:2288`: panel 460×524, −4.13°; photo 460×523, r14, offset */}
              {section.main_image ? (
                <div
                  className={`${REVEAL_ITEM} relative mx-auto w-full max-w-[460px] shrink-0 lg:mx-0 lg:w-[460px]`}
                >
                  {/* Figma `597:2283` — mobile/tablet: anchor to photo stack (stacked layout has no 714px gutter) */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute left-6 top-2 z-[25] text-brand drop-shadow-[0_1px_2px_color-mix(in_srgb,var(--palette-navy-deep)_14%,transparent)] mix-blend-normal lg:hidden"
                  >
                    <div className="size-[27.372px] rotate-180">
                      <FounderStorySparkMark className="block size-[27.372px] shrink-0" />
                    </div>
                  </div>

                  <div
                    aria-hidden
                    className="pointer-events-none absolute left-[10px] top-[13px] z-0 h-[524px] w-[460px] rotate-[-4.13deg] rounded-[14px] bg-brand sm:left-[12px]"
                  />
                  <div className="relative z-10 aspect-[460/523] w-full translate-x-[22px] overflow-hidden rounded-[14px]">
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

            {/* Figma `597:2283` — desktop: Group 111 x≈741.37, y≈112.37 in 1298-wide card (not 714/85). Paint last + high z so `isolate` / blends never bury it. */}
            {section.main_image ? (
              <div
                aria-hidden
                className="pointer-events-none absolute left-[calc(741.372*100%/1298)] top-[112px] z-[40] hidden text-brand drop-shadow-[0_1px_2px_color-mix(in_srgb,var(--palette-navy-deep)_14%,transparent)] mix-blend-normal lg:block"
              >
                <div className="size-[27.372px] rotate-180">
                  <FounderStorySparkMark className="block size-[27.372px] shrink-0" />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
