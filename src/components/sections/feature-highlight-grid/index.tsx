import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { FeatureHighlightGridCardT, FeatureHighlightGridSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import type { CSSProperties } from "react";

const cardGlowStyle: CSSProperties = {
  background: `radial-gradient(
    ellipse 95% 75% at 100% 100%,
    color-mix(in srgb, var(--palette-brand) 38%, transparent),
    transparent 62%
  )`,
};

const sectionAmbientTopRight: CSSProperties = {
  background: `radial-gradient(
    ellipse 55% 45% at 95% 8%,
    color-mix(in srgb, var(--palette-brand) 22%, transparent),
    transparent 70%
  )`,
};

const sectionAmbientBottomLeft: CSSProperties = {
  background: `radial-gradient(
    ellipse 50% 45% at 5% 92%,
    color-mix(in srgb, var(--palette-brand) 18%, transparent),
    transparent 65%
  )`,
};

function SubtleDotGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.14]"
      aria-hidden
      style={{
        backgroundImage: `repeating-radial-gradient(
          circle at 20% 24%,
          transparent 0,
          transparent 22px,
          color-mix(in srgb, var(--palette-white) 18%, transparent) 22px,
          color-mix(in srgb, var(--palette-white) 18%, transparent) 23px
        )`,
      }}
    />
  );
}

const cardSurfaceStyle: CSSProperties = {
  backgroundColor: `color-mix(in srgb, var(--palette-navy-deep) 78%, black)`,
};

const cardProse = [
  "!prose-p:mb-0 !prose-p:mt-0",
  "!prose-p:max-w-none",
  "!prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4]",
  "!prose-p:text-white",
  "prose-headings:text-white prose-strong:text-white prose-li:text-white",
  "prose-a:text-brand [&_a]:underline-offset-2",
  "[&_p+_p]:!mt-2",
].join(" ");

function HighlightCard({ card }: { card: FeatureHighlightGridCardT }) {
  const titleLines = (card.title ?? "")
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const hasBody = Boolean(card.description?.trim());

  if (!titleLines.length && !hasBody) return null;

  return (
    <article
      className={`${REVEAL_ITEM} relative isolate flex min-h-0 w-full flex-col justify-between gap-10 rounded-[14px] border border-brand p-[30px] sm:min-h-[387px]`}
      style={cardSurfaceStyle}
    >
      <div
        className="pointer-events-none absolute inset-px rounded-[13px] opacity-95"
        aria-hidden
        style={cardGlowStyle}
      />
      {card.visual ? (
        <div
          className="pointer-events-none absolute bottom-px left-px right-px top-[98px] z-1 overflow-hidden rounded-b-[13px] opacity-90"
          aria-hidden
        >
          <Media
            image={card.visual}
            width={395}
            height={288}
            className="size-full object-cover object-center"
            sizes="(min-width: 1024px) 400px, 100vw"
            preferLargestSource
          />
        </div>
      ) : null}
      <div className="relative z-10 flex min-w-0 max-w-[335px] flex-col gap-[22px]">
        {titleLines.length > 0 ? (
          <>
            <h3 className="font-sans text-[30px] font-medium leading-[0.88] tracking-normal text-white">
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
        <div className="relative z-10 min-w-0 max-w-[323px]">
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
  const titleLines = (section.title ?? "")
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const cards = section.cards ?? [];

  return (
    <section className="relative isolate overflow-hidden bg-navy-deep py-16 text-white sm:py-20 md:py-[134px]">
      <SubtleDotGrid />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={sectionAmbientTopRight}
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={sectionAmbientBottomLeft}
      />

      <Container className="relative z-10 max-w-7xl">
        <div className="mx-auto flex max-w-[1237px] flex-col items-center gap-[34px]">
          <header
            className={`${REVEAL_ITEM} flex w-full max-w-[583px] flex-col items-center gap-6 text-center`}
          >
            {section.badge?.trim() ? (
              <Button
                type="button"
                variant="white"
                className="h-[42px] min-h-[42px] rounded-[21px] border-0 px-[18px] py-3 text-base font-medium leading-relaxed text-brand shadow-none hover:bg-white"
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
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-6">
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
