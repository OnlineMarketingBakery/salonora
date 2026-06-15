/** Figma **1714:1007** (“Frame 2147228181”) on shell **1714:244** (“Frame 2147228117”). */
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { formatHeadingLines } from "@/lib/i18n/format-heading";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { FeatureHighlightGridCardT, FeatureHighlightGridSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import { NavyStarfieldBackdrop } from "@/components/sections/shared/NavyStarfieldBackdrop";
import { SITE_CONTENT_WIDTH_FEATURE_GRID } from "@/lib/layout/site-content-width";
import type { CSSProperties } from "react";

/** Figma **1714:1015** — card base fill (darker than `--palette-navy-deep`). */
const cardBaseStyle: CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--palette-navy-deep) 67%, black)",
};

/** Figma **1714:1019** — glass scrim over glow. */
const cardScrimStyle: CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--palette-navy-deep) 3%, transparent)",
};

/** Figma **1714:1016** / Frame 2147227982 — bottom wave glow (SVG export). */
function FeatureHighlightCardGlow({
  className = "",
  clipId,
}: {
  className?: string;
  clipId: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 395 288"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M87 111.411L2 193.211V312L87 307.021L209 298.485L415 250.116V156.935L305.5 73L209 188.232L87 111.411Z"
          fill="color-mix(in srgb, var(--palette-brand-strong) 55%, var(--palette-brand))"
        />
        <path
          d="M100 190L0.5 256.5V339.5H414V199L316 144L217.5 232.5L100 190Z"
          fill="var(--palette-brand)"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <path d="M0 0H395V275C395 282.18 389.18 288 382 288H13C5.82031 288 0 282.18 0 275V0Z" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

const HTML_TAG_RE = /<[a-z][\s\S]*>/i;

/** Normalize ACF textarea/HTML line breaks for multi-line headings (Figma uses explicit line breaks). */
function linesFromHeading(raw: string | undefined): string[] {
  const text = raw ?? "";
  if (HTML_TAG_RE.test(text)) {
    return text
      .replace(/<br\s*\/?>/gi, "\n")
      .split(/\r?\n+/)
      .map((l) => l.replace(/<[^>]+>/g, "").trim())
      .filter(Boolean);
  }
  return formatHeadingLines(text);
}

const cardProse = [
  "!prose-p:mb-0 !prose-p:mt-0",
  "!prose-p:max-w-none",
  "!prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4]",
  "!prose-p:text-white",
  "prose-headings:text-white prose-strong:text-white prose-li:text-white",
  "prose-a:text-brand [&_a]:underline-offset-2",
  "[&_p+_p]:!mt-0",
].join(" ");

function HighlightCard({ card, clipId }: { card: FeatureHighlightGridCardT; clipId: string }) {
  const titleLines = linesFromHeading(card.title);
  const hasBody = Boolean(card.description?.trim());

  if (!titleLines.length && !hasBody) return null;

  return (
    <article
      className={`${REVEAL_ITEM} relative isolate box-border flex min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden rounded-[14px] p-6 sm:p-[30px] lg:min-h-[387px]`}
      style={{
        ...cardBaseStyle,
        boxShadow: "inset 0 0 0 1px var(--palette-brand)",
      }}
    >
      {/* Decorative layers — one clip shell so glow/scrim respect all four corners */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[14px]"
        aria-hidden
      >
        <div className="absolute inset-x-0 bottom-0 h-[min(52%,180px)] sm:h-[220px] lg:top-[98px] lg:bottom-auto lg:h-[288px]">
          <FeatureHighlightCardGlow className="block size-full" clipId={clipId} />
          {card.visual ? (
            <Media
              image={card.visual}
              width={395}
              height={288}
              className="absolute inset-0 size-full object-cover object-center opacity-35 mix-blend-soft-light"
              sizes="(min-width: 1024px) 400px, 100vw"
              preferLargestSource
            />
          ) : null}
        </div>

        <div
          className="absolute inset-0 backdrop-blur-[60px]"
          style={cardScrimStyle}
        />
      </div>

      <div className="relative z-10 flex min-h-full w-full min-w-0 max-w-[335px] flex-col justify-between gap-8 lg:gap-[157px]">
        {titleLines.length > 0 ? (
          <div className="flex w-full flex-col gap-[22px]">
            <h3 className="font-sans text-2xl font-medium leading-[0.88] text-white sm:text-[30px]">
              {titleLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h3>
            <div
              className="h-px w-full max-w-[335px] shrink-0 bg-gradient-to-r from-brand to-transparent"
              aria-hidden
            />
          </div>
        ) : (
          <div aria-hidden />
        )}
        {card.description ? (
          <div className="min-w-0 max-w-[323px]">
            <RichText html={card.description} className={`max-w-none ${cardProse}`} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function FeatureHighlightGridSection({
  section,
}: {
  section: FeatureHighlightGridSectionT;
  lang: Locale;
}) {
  const titleLines = linesFromHeading(section.title);
  const cards = section.cards ?? [];

  return (
    <section className="relative isolate overflow-x-clip bg-navy-deep py-16 text-white sm:py-20 md:py-[134px]">
      <NavyStarfieldBackdrop />

      <Container className="relative z-10">
        <div className={`mx-auto flex w-full min-w-0 ${SITE_CONTENT_WIDTH_FEATURE_GRID} flex-col items-center gap-[34px]`}>
          <header
            className={`${REVEAL_ITEM} flex w-full max-w-[583px] flex-col items-center gap-6 text-center`}
          >
            {section.badge?.trim() ? (
              <span className="inline-flex h-[42px] min-h-[42px] items-center justify-center rounded-[21px] bg-white px-[18px] py-3 text-base font-medium leading-[1.6] text-brand">
                {section.badge.trim()}
              </span>
            ) : null}
            {titleLines.length > 0 ? (
              <h2 className="max-w-[555px] font-sans text-[32px] font-semibold leading-tight text-white sm:text-[40px] sm:leading-[1.15] lg:max-w-none lg:whitespace-nowrap lg:text-[48px] lg:leading-[56px]">
                {titleLines.join(" ")}
              </h2>
            ) : null}
          </header>

          {cards.length > 0 ? (
            <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {cards.map((card, i) => (
                <HighlightCard key={i} card={card} clipId={`feature-highlight-grid-glow-${i}`} />
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
