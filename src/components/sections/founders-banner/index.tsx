import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { decodeHtmlEntitiesPlain } from "@/lib/utils/decode-html-entities-plain";
import { resolveLink } from "@/lib/utils/links";
import type { FoundersBannerSectionT } from "@/types/sections";
import type { WpAcfLink } from "@/types/wordpress";
import Link from "next/link";
import type { CSSProperties } from "react";

/** Soft fade so portraits blend into the blue panel (Figma bottom dissolve). */
const PORTRAIT_MASK: CSSProperties = {
  maskImage:
    "linear-gradient(180deg, black 0%, black min(52%, 12rem), transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(180deg, black 0%, black min(52%, 12rem), transparent 100%)",
};

/** White pill: link when `pill_link` resolves to a URL; otherwise static badge — same layout as Figma. */
function FoundersPill({
  badgeText,
  pillLink,
  lang,
}: {
  badgeText: string;
  pillLink: WpAcfLink | null;
  lang: Locale;
}) {
  const resolved = resolveLink(pillLink, lang);
  /** Hairlines: solid brand-soft at inner edge (next to label), fade to transparent toward pill ends — Figma gradient rules */
  const ruleBase =
    "inline-block h-[3px] w-7 shrink-0 sm:w-9 [background-repeat:no-repeat]";
  const ruleLeftStyle: CSSProperties = {
    backgroundImage:
      "linear-gradient(to left, var(--palette-brand-soft) 0%, color-mix(in srgb, var(--palette-brand-soft) 28%, transparent) 72%, transparent 100%)",
  };
  const ruleRightStyle: CSSProperties = {
    backgroundImage:
      "linear-gradient(to right, var(--palette-brand-soft) 0%, color-mix(in srgb, var(--palette-brand-soft) 28%, transparent) 72%, transparent 100%)",
  };

  /** Figma 597:3120 — white capsule, navy label; soft lift shadow */
  const pillClasses =
    "mt-8 inline-flex max-w-full flex-wrap items-center justify-center gap-[10px] rounded-full border-0 bg-[var(--palette-white)] px-6 py-[11px] font-sans text-navy shadow-[0_2px_16px_rgba(21,41,81,0.14)] sm:gap-3 sm:px-8 sm:py-3";
  const interactiveClasses =
    "cursor-pointer no-underline transition-[background-color,box-shadow] duration-200 hover:bg-[color-mix(in_srgb,var(--palette-white)_94%,var(--palette-navy)_6%)] hover:shadow-[0_3px_18px_rgba(21,41,81,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--palette-white)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color-mix(in_srgb,var(--palette-brand)_48%,var(--palette-navy-deep))]";

  const lines = (
    <>
      <span className={ruleBase} style={ruleLeftStyle} aria-hidden />
      <span className="text-[15px] font-semibold leading-none tracking-[-0.02em] text-navy sm:text-[16px]">
        {badgeText}
      </span>
      <span className={ruleBase} style={ruleRightStyle} aria-hidden />
    </>
  );

  if (resolved?.href) {
    const href = resolved.href;
    const useNative =
      /^https?:\/\//i.test(href) ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:");
    const target = resolved.target;
    const rel = target === "_blank" ? "noopener noreferrer" : undefined;

    if (useNative) {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className={`${pillClasses} ${interactiveClasses}`}
        >
          {lines}
        </a>
      );
    }

    return (
      <Link href={href} className={`${pillClasses} ${interactiveClasses}`}>
        {lines}
      </Link>
    );
  }

  return <div className={pillClasses}>{lines}</div>;
}

/** Concentric “radar” rings — token strokes only (Figma ellipses 2035 / 2033 / 2034). */
function RippleRings() {
  const rings = [
    { px: 935, opacity: 0.14 },
    { px: 761, opacity: 0.16 },
    { px: 595, opacity: 0.18 },
  ];
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
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
  lang,
}: {
  section: FoundersBannerSectionT;
  lang: Locale;
}) {
  const resolvedPill = resolveLink(section.pill_link, lang);
  const rawPillLabel =
    section.badge_text.trim() || (resolvedPill?.label ?? "").trim();
  const pillLabel = rawPillLabel ? decodeHtmlEntitiesPlain(rawPillLabel) : "";

  return (
    <section className="bg-[var(--palette-white)] py-10 lg:py-14">
      <Container className="!max-w-[85rem]">
        <div
          className={`${REVEAL_ITEM} relative isolate flex min-h-[260px] flex-col justify-center overflow-hidden rounded-[24px] bg-[linear-gradient(148deg,var(--palette-brand)_0%,var(--palette-brand-strong)_42%,var(--palette-navy-deep)_100%)] lg:min-h-[314px]`}
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

          <div className="relative z-[3] mx-auto flex w-full max-w-[46rem] flex-col items-center px-6 py-8 text-center sm:py-10 lg:px-10 lg:py-12">
            {section.headline ? (
              <RichText
                html={section.headline}
                className="font-sans text-[clamp(1.375rem,4vw,2.125rem)] font-semibold leading-[1.2] tracking-[-0.03em] text-[var(--palette-white)] [&_p]:mb-0 [&_p]:mt-0 [&_p+p]:mt-3 [&_*]:text-[var(--palette-white)] prose-strong:text-[var(--palette-white)]"
              />
            ) : null}

            {pillLabel ? (
              <FoundersPill
                badgeText={pillLabel}
                pillLink={section.pill_link}
                lang={lang}
              />
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
