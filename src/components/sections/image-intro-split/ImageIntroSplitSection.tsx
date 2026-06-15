/** @see Figma **1482:4890** + **1482:4939** (Homepage Header Option 1 — apps orbit visual + pill, title, intro, divider, feature row). */
import "./image-intro-split.css";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { formatHeadingLines } from "@/lib/i18n/format-heading";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { SECTION_SHELL_AFTER_HERO } from "@/lib/layout/section-spacing";
import type { ImageIntroSplitSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import type { WpImage } from "@/types/wordpress";
import type { CSSProperties } from "react";

/**
 * Figma Vector 56 (**1482:4946** / **1482:4954**) — 505×1px linear stroke, 24% opacity,
 * rgb(39,55,87) → white (left-to-right fade on white background).
 */
const featureDividerStyle: CSSProperties = {
  backgroundImage: `linear-gradient(90deg, color-mix(in srgb, var(--palette-muted) 24%, transparent) 0%, var(--palette-white) 100%)`,
};

function FeatureDivider() {
  return (
    <div
      className="h-px w-full max-w-[505px] shrink-0"
      style={featureDividerStyle}
      aria-hidden
    />
  );
}

function featureTextLines(text: string): string[] {
  const fromBreaks = text
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (fromBreaks.length > 1) return fromBreaks.slice(0, 2);

  const single = fromBreaks[0] ?? text.trim();
  if (!single) return [];

  const commaMatch = single.match(/^(.+?,)\s*(.+)$/);
  if (commaMatch) {
    return [commaMatch[1], commaMatch[2]];
  }

  return [single];
}

function ImageTextRow({ icon, text }: { icon: WpImage | null; text: string }) {
  if (!text.trim()) return null;

  const textLines = featureTextLines(text);

  return (
    <div className="flex min-w-0 items-center gap-4">
      {icon ? (
        <div className="flex size-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[30px] bg-white shadow-[0_9px_10px_color-mix(in_srgb,var(--palette-navy)_8%,transparent)]">
          <Media
            image={icon}
            width={64}
            height={64}
            className="h-8 w-8 object-contain"
            sizes="60px"
            preferLargestSource
          />
        </div>
      ) : null}
      <p className="min-w-0 flex-1 text-xl font-semibold leading-snug text-brand sm:text-2xl sm:leading-none">
        {textLines.map((line, i) => (
          <span
            key={i}
            className={`block break-words sm:whitespace-nowrap ${i === 0 && textLines.length > 1 ? "mb-[5px]" : ""}`}
          >
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}

export function ImageIntroSplitSection({ section }: { section: ImageIntroSplitSectionT; lang: Locale }) {
  const titleLines = formatHeadingLines(section.title ?? "");

  const featureRows = section.imageTextRows.filter((r) => r.text.trim());
  const showLowerBlock = featureRows.length > 0;

  const titleClassName =
    "font-sans text-[32px] font-semibold text-navy sm:text-[40px] sm:leading-[1.18] lg:text-[48px] lg:leading-[59px]";

  return (
    <section className={`image-intro-split bg-white ${SECTION_SHELL_AFTER_HERO}`}>
      <Container>
        {/* Figma split: 490px visual + 74px gutter + 535px copy, geometric centers aligned */}
        <div className="image-intro-split__grid mx-auto grid w-full max-w-[1099px] grid-cols-1 items-center gap-10 lg:grid-cols-[490px_535px] lg:gap-x-[74px] lg:gap-y-0">
          <div
            className={`image-intro-split__visual ${REVEAL_ITEM} order-1 flex w-full justify-center lg:justify-start`}
          >
            {section.image ? (
              <div className="image-intro-split__visual-frame relative aspect-[490/512] w-full max-w-[490px]">
                <Media
                  image={section.image}
                  width={980}
                  height={1024}
                  className="h-full w-full object-contain object-center"
                  sizes="(min-width: 1024px) 490px, 100vw"
                  preferLargestSource
                />
              </div>
            ) : null}
          </div>

          {/* Figma **1482:4939** — gap-[24px] between intro block and feature block */}
          <div className={`${REVEAL_ITEM} order-2 flex min-w-0 flex-col gap-6 lg:w-[535px]`}>
            {/* Figma **1482:4940** — gap-[14px] */}
            <div className="flex w-full flex-col gap-[14px]">
              {section.eyebrow ? (
                <span className="inline-flex h-[42px] w-fit max-w-full items-center justify-center rounded-[21px] bg-brand/10 px-5 py-3 text-base font-medium leading-[1.6] text-brand">
                  {section.eyebrow}
                </span>
              ) : null}

              {titleLines.length > 0 ? (
                <h2 className={titleClassName}>
                  {titleLines.length === 1 ? (
                    titleLines[0]
                  ) : (
                    titleLines.map((line, i) => (
                      <span key={i} className="block">
                        {line}
                      </span>
                    ))
                  )}
                </h2>
              ) : null}

              {section.intro ? (
                <RichText
                  html={section.intro}
                  className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.6] !prose-p:text-muted [&_p+_p]:!mt-[18px] [&_strong]:font-semibold [&_strong]:text-navy"
                />
              ) : null}
            </div>

            {/* Figma **1482:4945** — 505px block, gap-[18px], dividers sandwiching feature row */}
            {showLowerBlock ? (
              <div className="flex w-full max-w-[505px] flex-col gap-[18px]">
                <FeatureDivider />
                {featureRows.map((row, i) => (
                  <ImageTextRow key={`${section.id}-row-${i}`} icon={row.icon} text={row.text} />
                ))}
                <FeatureDivider />
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
