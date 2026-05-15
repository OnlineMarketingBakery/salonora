/** @see Figma **1397:31** ("Group 605") — navy rounded panel: pill badge, headline, WYSIWYG body, laptop mockup. */
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import type { DemoPreviewSplitSectionT } from "@/types/sections";
import type { CSSProperties } from "react";

function linesFromTitle(raw: string): string[] {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/\r?\n+/)
    .map((l) => l.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}

/** Deep navy base (Figma panel). */
const panelBaseGradient: CSSProperties = {
  background: `linear-gradient(
    180deg,
    var(--palette-navy-deep) 0%,
    color-mix(in srgb, var(--palette-navy-deep) 95%, black) 100%
  )`,
};

/** Subtle brand glow anchored top-left corner only (Figma's corner wash). */
const topLeftGlow: CSSProperties = {
  background: `radial-gradient(
    ellipse 40% 50% at 0% 0%,
    color-mix(in srgb, var(--palette-brand) 55%, transparent) 0%,
    color-mix(in srgb, var(--palette-brand) 20%, transparent) 30%,
    transparent 65%
  )`,
};

/** Subtle brand glow at bottom-right corner (Figma corner accent). */
const bottomRightGlow: CSSProperties = {
  background: `radial-gradient(
    ellipse 42% 50% at 100% 100%,
    color-mix(in srgb, var(--palette-brand) 45%, transparent) 0%,
    color-mix(in srgb, var(--palette-brand) 15%, transparent) 32%,
    transparent 68%
  )`,
};

const fineCell =
  "color-mix(in srgb, var(--palette-white) 18%, transparent) 1px, transparent 1px";

/** Full-panel grid that fades from edges (Figma). */
const fullGridMask =
  "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 5%, black 60%, black 100%)";

/** Scattered pinpricks across mid-lower panel (Figma starfield). */
const starMist: CSSProperties = {
  backgroundImage: [
    "radial-gradient(circle at 18% 62%, color-mix(in srgb, var(--palette-white) 70%, transparent) 0.8px, transparent 1.6px)",
    "radial-gradient(circle at 28% 78%, color-mix(in srgb, var(--palette-white) 65%, transparent) 0.7px, transparent 1.4px)",
    "radial-gradient(circle at 38% 68%, color-mix(in srgb, var(--palette-white) 65%, transparent) 0.7px, transparent 1.4px)",
    "radial-gradient(circle at 52% 84%, color-mix(in srgb, var(--palette-white) 60%, transparent) 0.7px, transparent 1.3px)",
    "radial-gradient(circle at 44% 72%, color-mix(in srgb, var(--palette-white) 55%, transparent) 0.6px, transparent 1.2px)",
    "radial-gradient(circle at 61% 79%, color-mix(in srgb, var(--palette-white) 60%, transparent) 0.7px, transparent 1.3px)",
    "radial-gradient(circle at 33% 86%, color-mix(in srgb, var(--palette-white) 55%, transparent) 0.6px, transparent 1.2px)",
    "radial-gradient(circle at 58% 92%, color-mix(in srgb, var(--palette-white) 50%, transparent) 0.6px, transparent 1.1px)",
    "radial-gradient(circle at 72% 70%, color-mix(in srgb, var(--palette-white) 55%, transparent) 0.6px, transparent 1.2px)",
    "radial-gradient(circle at 82% 88%, color-mix(in srgb, var(--palette-white) 50%, transparent) 0.6px, transparent 1.1px)",
    "radial-gradient(circle at 12% 90%, color-mix(in srgb, var(--palette-white) 48%, transparent) 0.5px, transparent 1.1px)",
    "radial-gradient(circle at 90% 60%, color-mix(in srgb, var(--palette-white) 52%, transparent) 0.6px, transparent 1.2px)",
    "radial-gradient(circle at 22% 50%, color-mix(in srgb, var(--palette-white) 50%, transparent) 0.6px, transparent 1.1px)",
    "radial-gradient(circle at 66% 55%, color-mix(in srgb, var(--palette-white) 45%, transparent) 0.5px, transparent 1.1px)",
  ].join(","),
  maskImage:
    "radial-gradient(ellipse 95% 70% at 50% 75%, black 0%, black 50%, transparent 85%)",
  WebkitMaskImage:
    "radial-gradient(ellipse 95% 70% at 50% 75%, black 0%, black 50%, transparent 85%)",
};

function PanelBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      aria-hidden
    >
      {/* Base navy */}
      <div className="absolute inset-0" style={panelBaseGradient} />

      {/* Top-left corner glow — tight, doesn't bleed into headline */}
      <div className="absolute inset-0 opacity-100" style={topLeftGlow} />

      {/* Bottom-right corner glow */}
      <div className="absolute inset-0 opacity-90" style={bottomRightGlow} />

      {/* Full-panel grid — fades from edges, visible across whole panel */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `linear-gradient(${fineCell}), linear-gradient(90deg, ${fineCell})`,
          backgroundSize: "26px 26px",
          maskImage: fullGridMask,
          WebkitMaskImage: fullGridMask,
        }}
      />

      {/* Scattered stars */}
      <div className="absolute inset-0 opacity-[0.55]" style={starMist} />
    </div>
  );
}

export function DemoPreviewSplitSection({
  section,
  lang,
}: {
  section: DemoPreviewSplitSectionT;
  lang: Locale;
}) {
  void lang;
  const titleLines = linesFromTitle(section.title);
  const bodyHtml = section.body.trim();
  const hasVisual = Boolean(section.mockup_image);
  const hasCopy =
    Boolean(section.badge.trim()) || titleLines.length > 0 || Boolean(bodyHtml);

  if (!hasCopy && !hasVisual) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 lg:py-14">
      <Container className="!max-w-[85rem]">
        <div
          className={`${REVEAL_ITEM} relative isolate min-h-0 overflow-hidden rounded-[14px] shadow-[0_24px_60px_-20px_color-mix(in_srgb,var(--palette-navy-deep)_55%,transparent)]`}
        >
          <PanelBackdrop />

          <div className="relative z-10 grid min-h-0 gap-10 px-6 py-10 sm:px-10 sm:py-12 md:gap-12 md:px-12 md:py-16 lg:grid-cols-[minmax(0,36.5rem)_minmax(0,1fr)] lg:items-center lg:gap-x-16 lg:gap-y-10 lg:px-[5.5rem] lg:pb-[3.75rem] lg:pt-[4.25rem]">
            <div className="flex min-w-0 flex-col gap-6 text-white lg:max-w-[35.6875rem] lg:gap-6">
              {section.badge.trim() ? (
                <div
                  className={`${REVEAL_ITEM} inline-flex min-h-[42px] w-fit max-w-full shrink-0 items-center self-start rounded-full border border-[color-mix(in_srgb,var(--palette-white)_15%,transparent)] px-6 py-2.5 text-left font-sans text-base font-bold leading-[1.6] text-white backdrop-blur-sm`}
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--palette-navy-deep) 70%, transparent)",
                  }}
                >
                  {section.badge.trim()}
                </div>
              ) : null}

              {titleLines.length > 0 ? (
                <h2
                  className={`${REVEAL_ITEM} m-0 font-sans text-[32px] font-bold leading-[1.12] tracking-[-0.04em] text-white sm:text-[40px] sm:leading-[1.08] lg:text-[48px] lg:leading-[56px]`}
                >
                  {titleLines.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              ) : null}

              {bodyHtml ? (
                <RichText
                  html={section.body}
                  className={`${REVEAL_ITEM} !prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:font-normal !prose-p:text-base !prose-p:leading-[1.4] !prose-p:text-white prose-strong:font-bold prose-strong:text-white [&_p+p]:mt-[18px]`}
                />
              ) : null}
            </div>

            {hasVisual ? (
              <div
                className={`${REVEAL_ITEM} relative mx-auto flex w-full min-w-0 justify-center lg:mx-0 lg:-mr-2 lg:justify-end lg:pl-4 xl:-mr-4 xl:translate-x-1`}
              >
                <div className="relative aspect-2391/1411 w-full max-w-[min(760px,100%)] lg:max-w-[min(860px,54vw)]">
                  <Media
                    image={section.mockup_image}
                    width={2391}
                    height={1411}
                    className="h-full w-full object-contain object-center lg:object-right"
                    sizes="(min-width: 1280px) 54vw, (min-width: 1024px) 50vw, 100vw"
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
