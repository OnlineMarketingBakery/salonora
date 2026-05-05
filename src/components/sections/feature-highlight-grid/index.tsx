import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { FeatureHighlightGridCardT, FeatureHighlightGridSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import type { CSSProperties } from "react";

/** Normalize ACF textarea/HTML line breaks for multi-line headings (Figma uses explicit line breaks). */
function linesFromHeading(raw: string | undefined): string[] {
  return (raw ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/\r?\n+/)
    .map((l) => l.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}

/** Large thin rings radiating from top center (Figma background). */
function ConcentricRingPattern() {
  const ring = `color-mix(in srgb, var(--palette-white) 11%, transparent)`;
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.55]"
      aria-hidden
      style={{
        backgroundImage: `repeating-radial-gradient(
          circle at 50% 0%,
          transparent 0,
          transparent 118px,
          ${ring} 118px,
          ${ring} 119px
        )`,
      }}
    />
  );
}

/** Softer vignette: slightly lighter toward the middle, then fade to edges. */
const sectionCenterGlow: CSSProperties = {
  background: `radial-gradient(
    ellipse 90% 75% at 50% 42%,
    color-mix(in srgb, var(--palette-brand) 7%, transparent) 0%,
    transparent 58%
  )`,
};

/** Very subtle bottom-corner brand mist (keeps depth without fighting the rings). */
const sectionCornerMist: CSSProperties = {
  background: `
    radial-gradient(
      ellipse 45% 35% at 100% 0%,
      color-mix(in srgb, var(--palette-brand) 12%, transparent),
      transparent 72%
    ),
    radial-gradient(
      ellipse 40% 32% at 0% 100%,
      color-mix(in srgb, var(--palette-brand) 10%, transparent),
      transparent 70%
    )
  `,
};

const cardFaceGradient: CSSProperties = {
  background: `linear-gradient(
    180deg,
    color-mix(in srgb, var(--palette-navy-deep) 58%, black) 0%,
    color-mix(in srgb, var(--palette-navy-deep) 78%, black) 42%,
    color-mix(in srgb, var(--palette-navy-deep) 62%, var(--palette-brand-soft)) 100%
  )`,
};

const cardBottomGlow: CSSProperties = {
  background: `radial-gradient(
    ellipse 110% 85% at 85% 100%,
    color-mix(in srgb, var(--palette-brand) 32%, transparent),
    transparent 55%
  )`,
};

const cardScrimStyle: CSSProperties = {
  background: `linear-gradient(
    180deg,
    color-mix(in srgb, var(--palette-navy-deep) 4%, transparent) 0%,
    transparent 45%,
    color-mix(in srgb, var(--palette-navy-deep) 22%, transparent) 100%
  )`,
};

const cardProse = [
  "!prose-p:mb-0 !prose-p:mt-0",
  "!prose-p:max-w-none",
  "!prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4]",
  "!prose-p:text-white",
  "prose-headings:text-white prose-strong:text-white prose-li:text-white",
  "prose-a:text-brand [&_a]:underline-offset-2",
  "[&_p+_p]:!mt-0",
].join(" ");

function HighlightCard({ card }: { card: FeatureHighlightGridCardT }) {
  const titleLines = linesFromHeading(card.title);
  const hasBody = Boolean(card.description?.trim());

  if (!titleLines.length && !hasBody) return null;

  return (
    <article
      className={`${REVEAL_ITEM} relative isolate flex min-h-0 w-full flex-col justify-between gap-0 rounded-[14px] border border-solid border-brand p-[30px] sm:min-h-[387px]`}
      style={cardFaceGradient}
    >
      <div
        className="pointer-events-none absolute inset-px rounded-[13px]"
        aria-hidden
        style={cardBottomGlow}
      />
      <div className="pointer-events-none absolute inset-px rounded-[13px]" aria-hidden style={cardScrimStyle} />
      {card.visual ? (
        <div
          className="pointer-events-none absolute bottom-px left-px right-px top-[98px] z-1 overflow-hidden rounded-b-[13px]"
          aria-hidden
        >
          <Media
            image={card.visual}
            width={395}
            height={288}
            className="size-full object-cover object-center opacity-45 mix-blend-soft-light"
            sizes="(min-width: 1024px) 400px, 100vw"
            preferLargestSource
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                180deg,
                color-mix(in srgb, var(--palette-navy-deep) 55%, transparent) 0%,
                transparent 40%,
                color-mix(in srgb, var(--palette-navy-deep) 35%, transparent) 100%
              )`,
            }}
          />
        </div>
      ) : null}
      <div className="relative z-10 flex min-w-0 max-w-[335px] flex-col gap-[22px]">
        {titleLines.length > 0 ? (
          <>
            <h3 className="font-sans text-[30px] font-semibold leading-[0.88] tracking-normal text-white">
              {titleLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h3>
            <div className="h-px w-full max-w-[335px] shrink-0 bg-brand" aria-hidden />
          </>
        ) : null}
      </div>
      {card.description ? (
        <div className="relative z-10 mt-auto min-w-0 max-w-[323px] pt-[22px]">
          <RichText html={card.description} className={`max-w-none ${cardProse}`} />
        </div>
      ) : null}
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
    <section className="relative isolate overflow-hidden bg-navy-deep py-16 text-white sm:py-20 md:py-[134px]">
      <ConcentricRingPattern />
      <div className="pointer-events-none absolute inset-0" aria-hidden style={sectionCenterGlow} />
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden style={sectionCornerMist} />

      <Container className="relative z-10 max-w-7xl">
        <div className="mx-auto flex max-w-[1237px] flex-col items-center gap-[34px]">
          <header
            className={`${REVEAL_ITEM} flex w-full max-w-[583px] flex-col items-center gap-6 text-center`}
          >
            {section.badge?.trim() ? (
              <Button
                type="button"
                variant="white"
                className="h-[42px] min-h-[42px] rounded-[21px] border-0 bg-white px-[18px] py-3 text-base font-medium leading-relaxed text-navy-deep shadow-none hover:bg-white"
              >
                {section.badge.trim()}
              </Button>
            ) : null}
            {titleLines.length > 0 ? (
              <h2 className="max-w-[555px] font-sans text-5xl font-semibold leading-[56px] tracking-[-0.04em] text-white">
                {titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            ) : null}
          </header>

          {cards.length > 0 ? (
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {cards.map((card, i) => (
                <HighlightCard key={i} card={card} />
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
