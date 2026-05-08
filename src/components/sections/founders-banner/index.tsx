import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import type { FoundersBannerSectionT } from "@/types/sections";
import type { CSSProperties } from "react";

/** Soft fade so portraits blend into the blue panel (Figma bottom dissolve). */
const PORTRAIT_MASK: CSSProperties = {
  maskImage: "linear-gradient(180deg, black 0%, black min(52%, 12rem), transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(180deg, black 0%, black min(52%, 12rem), transparent 100%)",
};

/** Concentric “radar” rings — token strokes only (Figma ellipses 2035 / 2033 / 2034). */
function RippleRings() {
  const rings = [
    { px: 935, opacity: 0.14 },
    { px: 761, opacity: 0.16 },
    { px: 595, opacity: 0.18 },
  ];
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[36%] z-0 -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      {rings.map(({ px, opacity }) => (
        <div
          key={px}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color-mix(in_srgb,var(--palette-white)_32%,transparent)]"
          style={{
            width: `min(${px}px, 92vw)`,
            height: `min(${px}px, 92vw)`,
            opacity,
          }}
        />
      ))}
    </div>
  );
}

export function FoundersBannerSection({
  section,
  lang: _lang,
}: {
  section: FoundersBannerSectionT;
  lang: Locale;
}) {
  void _lang;

  return (
    <section className="bg-[var(--palette-white)] py-10 lg:py-14">
      <Container className="!max-w-[85rem]">
        <div
          className={`${REVEAL_ITEM} relative isolate overflow-hidden rounded-[24px] bg-[linear-gradient(148deg,var(--palette-brand)_0%,var(--palette-brand-strong)_42%,var(--palette-navy-deep)_100%)] min-h-[260px] lg:min-h-[314px]`}
        >
          <RippleRings />

          {/* Bottom glow band — mirrors Figma Ellipse 2112 soft lift */}
          <div
            className="pointer-events-none absolute inset-x-[-6%] bottom-0 z-[1] h-[42%] bg-[linear-gradient(180deg,transparent_0%,color-mix(in_srgb,var(--palette-brand)_35%,transparent)_38%,color-mix(in_srgb,var(--palette-brand-strong)_55%,transparent)_72%,color-mix(in_srgb,var(--palette-navy-deep)_28%,transparent)_100%)] opacity-90 mix-blend-soft-light"
            aria-hidden
          />

          {section.left_image ? (
            <div className="pointer-events-none absolute bottom-0 left-0 z-[2] w-[46%] max-w-[268px] sm:w-[40%] lg:left-2 lg:w-[28%] [@media(max-width:639px)]:max-w-[200px]">
              <div className="relative overflow-x-clip" style={PORTRAIT_MASK}>
                <Media
                  image={section.left_image}
                  width={536}
                  height={1160}
                  className="h-auto w-full max-h-[min(58vw,580px)] object-contain object-bottom"
                  sizes="(min-width: 1024px) 268px, 40vw"
                  preferLargestSource
                />
              </div>
            </div>
          ) : null}

          {section.right_image ? (
            <div className="pointer-events-none absolute bottom-0 right-0 z-[2] w-[42%] max-w-[254px] sm:w-[36%] lg:right-2 lg:w-[26%] [@media(max-width:639px)]:max-w-[190px]">
              <div className="relative" style={PORTRAIT_MASK}>
                <Media
                  image={section.right_image}
                  width={508}
                  height={606}
                  className="ml-auto h-auto w-full max-h-[min(52vw,520px)] object-contain object-bottom"
                  sizes="(min-width: 1024px) 254px, 36vw"
                  preferLargestSource
                />
              </div>
            </div>
          ) : null}

          <div className="relative z-[3] mx-auto flex max-w-[46rem] flex-col items-center px-6 py-12 text-center lg:px-10 lg:py-14">
            {section.headline ? (
              <RichText
                html={section.headline}
                className="font-sans text-[clamp(1.375rem,4vw,2.125rem)] font-semibold leading-[1.2] tracking-[-0.03em] text-[var(--palette-white)] [&_p]:mb-0 [&_p]:mt-0 [&_p+p]:mt-3 [&_*]:text-[var(--palette-white)] prose-strong:text-[var(--palette-white)]"
              />
            ) : null}

            {section.badge_text ? (
              <div className="mt-8 inline-flex max-w-full flex-wrap items-center justify-center gap-3 rounded-full bg-[var(--palette-white)] px-5 py-2.5 text-navy shadow-sm">
                <span
                  className="inline-block h-px w-6 shrink-0 bg-[color-mix(in_srgb,var(--palette-navy)_38%,transparent)] sm:w-8"
                  aria-hidden
                />
                <span className="text-[15px] font-medium tracking-tight text-navy sm:text-[16px]">
                  {section.badge_text}
                </span>
                <span
                  className="inline-block h-px w-6 shrink-0 bg-[color-mix(in_srgb,var(--palette-navy)_38%,transparent)] sm:w-8"
                  aria-hidden
                />
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
