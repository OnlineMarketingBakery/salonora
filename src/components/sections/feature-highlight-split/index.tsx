import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { FeatureHighlightSplitSectionT } from "@/types/sections";
import type { CSSProperties } from "react";

/** Exported from Figma (`68aa8766d05fb7bf86a05084_hero-bg`): mesh wash before blue color-blend. */
const HERO_BG_SRC = "/feature-highlight-split-hero-bg.png";

/** Figma 946:34 — heading supports manual line breaks; strip tags only when splitting. */
function linesFromHeading(raw: string | undefined): string[] {
  return (raw ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/\r?\n+/)
    .map((l) => l.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}

/**
 * Hero wash — desktop `346:5625` (img h 134.3%); mobile artboard `597:2296` under `597:2295`
 * (img h 186.44%, same asset + crop). Brand tint still `346:5626` / `597:2297`.
 */
const heroBgImageStyle: Pick<CSSProperties, "backgroundImage"> = {
  backgroundImage: `url("${HERO_BG_SRC}")`,
};

const brandColorBlendLayer: CSSProperties = {
  backgroundColor: "var(--palette-brand)",
  mixBlendMode: "color",
};

/** Cards: gradient + shadow per Figma (346:6111 …). */
const cardFace: CSSProperties = {
  background: `linear-gradient(
    90deg,
    var(--palette-white) 0%,
    color-mix(in srgb, var(--palette-white) 53%, transparent) 100%
  )`,
  boxShadow: `0 11px 12px color-mix(in srgb, var(--palette-muted) 10%, transparent)`,
};

const headlineStyle: CSSProperties = {
  fontSize: "clamp(2.75rem, 6vw + 1rem, 5.25rem)",
  lineHeight: "clamp(3rem, 6vw + 1.125rem, 5.875rem)",
};

const cardProse = [
  "!prose-p:mb-[5px] !prose-p:mt-0 last:!prose-p:mb-0",
  "!prose-p:max-w-none !prose-p:text-lg !prose-p:font-medium !prose-p:leading-[1.1]",
  "!prose-p:text-navy-deep prose-strong:text-navy-deep",
  "[&_p:last-child]:!mb-0",
].join(" ");

function lgGridColsClass(hasLeft: boolean, hasVisual: boolean, hasPromises: boolean): string {
  if (hasLeft && hasVisual && hasPromises) return "lg:grid-cols-[341px_568px_368px]";
  if (hasLeft && hasVisual) return "lg:grid-cols-[341px_568px]";
  if (hasVisual && hasPromises) return "lg:grid-cols-[568px_368px]";
  if (hasLeft && hasPromises) return "lg:grid-cols-[341px_368px]";
  if (hasLeft) return "lg:grid-cols-[341px]";
  if (hasVisual) return "lg:grid-cols-[568px]";
  if (hasPromises) return "lg:grid-cols-[368px]";
  return "";
}

export function FeatureHighlightSplitSection({
  section,
  lang,
}: {
  section: FeatureHighlightSplitSectionT;
  lang: Locale;
}) {
  const titleLines = linesFromHeading(section.title);
  const ctas = section.ctas ?? [];
  const primaryCta = ctas[0];
  const ctaLink = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaHref = ctaLink?.href;
  const ctaLabel = primaryCta?.text || ctaLink?.label || "";

  const promises = (section.promise_items ?? []).filter((p) => p.text?.trim());
  const mockup = section.mockup_image ?? null;

  const hasLeft =
    Boolean(section.badge?.trim()) ||
    titleLines.length > 0 ||
    Boolean(ctaHref && ctaLabel.trim());
  const hasVisual = Boolean(mockup);
  const hasPromises = promises.length > 0;

  if (!hasLeft && !hasVisual && !hasPromises) {
    return null;
  }

  const gridCols = lgGridColsClass(hasLeft, hasVisual, hasPromises);

  return (
    <section className="relative isolate overflow-hidden py-14 sm:py-16 lg:flex lg:min-h-[804px] lg:items-center lg:py-0">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        {/* Fallback base so blend never sits on empty transparency before paint */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "color-mix(in srgb, var(--palette-white) 88%, var(--palette-surface))",
          }}
          aria-hidden
        />
        <div
          className="absolute top-0 left-[-19.42%] h-[186.44%] min-h-full w-[138.84%] bg-cover bg-top bg-no-repeat lg:h-[134.3%]"
          style={heroBgImageStyle}
          aria-hidden
        />
        <div className="absolute inset-0" style={brandColorBlendLayer} aria-hidden />
      </div>

      <Container className="relative z-10 w-full max-w-[90rem]">
        <div
          className={`mx-auto grid w-full max-w-[1345px] grid-cols-1 gap-10 lg:gap-x-[34px] lg:gap-y-0 lg:items-center ${gridCols}`}
        >
          {hasLeft ? (
            <div
              className={`${REVEAL_ITEM} relative z-10 flex w-full min-w-0 flex-col gap-7 lg:w-[341px] lg:gap-[28px]`}
            >
              <div className="flex flex-col gap-[19px]">
                {section.badge?.trim() ? (
                  <Button
                    type="button"
                    variant="white"
                    className="h-[42px] min-h-[42px] w-fit rounded-[21px] border-0 bg-white px-5 py-0 text-base font-medium leading-[1.6] text-brand shadow-none hover:bg-white"
                  >
                    {section.badge.trim()}
                  </Button>
                ) : null}
                {titleLines.length > 0 ? (
                  <h2
                    className="min-w-0 font-sans font-semibold tracking-normal text-navy-deep"
                    style={headlineStyle}
                  >
                    {titleLines.map((line, i) => (
                      <span key={i} className="block">
                        {line}
                      </span>
                    ))}
                  </h2>
                ) : null}
              </div>
              {ctaHref && ctaLabel.trim() ? (
                <Button
                  href={ctaHref}
                  target={ctaLink?.target}
                  variant="ctaBrand"
                  ctaSize="package"
                  ctaElevation="none"
                  ctaFullWidth={false}
                  className="!h-[63px] !min-h-[63px] w-full max-w-[252px] gap-9 !rounded-[31.5px] !px-[22px] !py-[18px] !text-xl !font-normal !leading-normal [box-shadow:0_6px_10px_color-mix(in_srgb,var(--palette-brand)_54%,transparent)] sm:!w-[252px]"
                  arrowClassName="size-[27px] shrink-0"
                >
                  {ctaLabel.trim()}
                </Button>
              ) : null}
            </div>
          ) : null}

          {hasVisual && mockup ? (
            <div className={`${REVEAL_ITEM} relative z-0 flex w-full justify-center lg:w-[568px]`}>
              <div className="relative h-auto w-full max-w-[568px]">
                <Media
                  image={mockup}
                  width={568}
                  height={618}
                  className="mx-auto h-auto w-full object-contain"
                  sizes="(min-width: 1024px) 568px, 100vw"
                  preferLargestSource
                />
              </div>
            </div>
          ) : null}

          {hasPromises ? (
            <div className={`${REVEAL_ITEM} relative z-10 flex w-full flex-col gap-5 lg:w-[368px]`}>
              {promises.map((item, i) => {
                const isLongCard =
                  i === promises.length - 1 && promises.length > 1;
                return (
                  <div
                    key={i}
                    className={`flex items-center rounded-[14px] px-8 ${isLongCard ? "min-h-[121px]" : "min-h-[80px]"}`}
                    style={cardFace}
                  >
                    <RichText
                      html={item.text ?? ""}
                      className={`w-full max-w-none ${cardProse}`}
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
