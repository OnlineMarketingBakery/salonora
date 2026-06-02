/** Figma **1714:1007** (“Frame 2147228181”) on shell **1714:244** (“Frame 2147228117”). */
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { FeatureHighlightGridCardT, FeatureHighlightGridSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import { NavyStarfieldBackdrop } from "@/components/sections/shared/NavyStarfieldBackdrop";
import type { CSSProperties } from "react";

/** Figma 1714:1014–1019 — card face + bottom wave glow (SVG exports drop blur). */
const cardFaceStyle: CSSProperties = {
  backgroundColor: "#001a37",
  backgroundImage: [
    "radial-gradient(ellipse 115% 90% at 88% 100%, color-mix(in srgb, var(--palette-brand) 42%, transparent) 0%, transparent 58%)",
    "radial-gradient(ellipse 95% 75% at 12% 92%, color-mix(in srgb, #0079ff 24%, transparent) 0%, transparent 55%)",
  ].join(", "),
};

/** Normalize ACF textarea/HTML line breaks for multi-line headings (Figma uses explicit line breaks). */
function linesFromHeading(raw: string | undefined): string[] {
  return (raw ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/\r?\n+/)
    .map((l) => l.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
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

function HighlightCard({ card }: { card: FeatureHighlightGridCardT }) {
  const titleLines = linesFromHeading(card.title);
  const hasBody = Boolean(card.description?.trim());

  if (!titleLines.length && !hasBody) return null;

  return (
    <article
      className={`${REVEAL_ITEM} relative isolate flex min-h-0 w-full flex-col rounded-[14px] border border-brand p-6 sm:p-[30px] lg:min-h-[387px]`}
      style={cardFaceStyle}
    >
      {/* Figma 1714:1019 — glass scrim */}
      <div
        className="pointer-events-none absolute inset-px rounded-[13px] bg-[rgba(0,39,82,0.03)] backdrop-blur-[60px]"
        aria-hidden
      />
      {card.visual ? (
        <div
          className="pointer-events-none absolute inset-x-px bottom-px top-[98px] z-[1] overflow-hidden rounded-b-[13px]"
          aria-hidden
        >
          <Media
            image={card.visual}
            width={395}
            height={288}
            className="size-full object-cover object-center opacity-35 mix-blend-soft-light"
            sizes="(min-width: 1024px) 400px, 100vw"
            preferLargestSource
          />
        </div>
      ) : null}
      <div className="relative z-10 flex min-h-full w-full max-w-[335px] flex-col justify-between gap-8 lg:gap-[157px]">
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
    <section className="relative isolate overflow-hidden bg-navy-deep py-16 text-white sm:py-20 md:py-[134px]">
      <NavyStarfieldBackdrop />

      <Container className="relative z-10 max-w-7xl">
        <div className="mx-auto flex max-w-[1237px] flex-col items-center gap-[34px]">
          <header
            className={`${REVEAL_ITEM} flex w-full max-w-[583px] flex-col items-center gap-6 text-center`}
          >
            {section.badge?.trim() ? (
              <span className="inline-flex h-[42px] min-h-[42px] items-center justify-center rounded-[21px] bg-[#fefeff] px-[18px] py-3 text-base font-medium leading-[1.6] text-brand">
                {section.badge.trim()}
              </span>
            ) : null}
            {titleLines.length > 0 ? (
              <h2 className="max-w-[555px] font-sans text-[32px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[40px] sm:leading-[1.15] lg:text-[48px] lg:leading-[56px]">
                {titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            ) : null}
          </header>

          {cards.length > 0 ? (
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
