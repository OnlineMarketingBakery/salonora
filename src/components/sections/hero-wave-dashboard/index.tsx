/** @see Figma **1727:27** ("Group 612") — deep-navy hero, floating avatars, dual CTAs, flat
 *  dashboard mockup over a white wave (panel 1714:111, copy 1714:1252, dashboard 1714:114).
 *
 * Typography (1714:1252 / 1714:1253):
 * - Eyebrow **1714:1254**: 20px / medium / leading 1.6
 * - Title **1714:1255**: 60px / semibold / leading 64px
 * - Offer **1714:1256**: 36px / semibold / leading 1.1
 * - CTA label **1714:1260**: 16px / regular / leading normal, pill h-48 px-20
 * - Copy stack gap 24px; copy→CTA gap 38px; CTA row gap 14px */
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { ctaVariantAt } from "@/lib/ui/ctaAlternation";
import { resolveLink } from "@/lib/utils/links";
import type { HeroWaveDashboardSectionT } from "@/types/sections";
import type { CSSProperties } from "react";

/**
 * Figma `Rectangle 608` is a FLAT deep navy (`#002752` = `navy-deep`) — there is no top→bottom
 * gradient. All the blue brightening comes from two large, soft `#0079FF` glow ellipses anchored
 * near the top-left / top-right corners (Figma `Ellipse 1996`, r174 + heavy blur). Sampling the
 * rendered design, each glow peaks at ~rgb(0,76,160) and fades to base by ~half the height —
 * reproduced here with `brand-strong` at 55% (peak ≈ rgb(3,76,157)) over a solid `navy-deep` base.
 */
const cornerGlow = "color-mix(in srgb, var(--palette-brand-strong) 62%, transparent)";
const cornerGlowMid = "color-mix(in srgb, var(--palette-brand-strong) 29%, transparent)";
const panelBackground: CSSProperties = {
  backgroundColor: "var(--palette-navy-deep)",
  backgroundImage: `radial-gradient(34% 48% at 3% 10%, ${cornerGlow} 0%, ${cornerGlowMid} 50%, transparent 100%),
    radial-gradient(34% 48% at 97% 10%, ${cornerGlow} 0%, ${cornerGlowMid} 50%, transparent 100%)`,
};

export function HeroWaveDashboardSection({
  section,
  lang,
}: {
  section: HeroWaveDashboardSectionT;
  lang: Locale;
}) {
  const heroId = `hero-wave-${section.id ?? "main"}`;
  const hasCopy =
    Boolean(section.eyebrow.trim()) ||
    Boolean(section.title.trim()) ||
    Boolean(section.offerText.replace(/<[^>]+>/g, "").trim());
  const hasLeftFloat = Boolean(section.leftFloatingImage);
  const hasRightFloat = Boolean(section.rightFloatingImage);

  if (!hasCopy && !hasLeftFloat && !hasRightFloat) {
    return null;
  }

  return (
    <section
      id={heroId}
      className="relative isolate overflow-x-clip text-white"
      style={panelBackground}
    >
      {/* Bleed navy behind the transparent floating header (body is white; header overlap is ~6–7rem). */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-full z-0 h-28 sm:h-32"
        style={{ background: "var(--palette-navy-deep)" }}
        aria-hidden
      />

      {/* White wave — exact cubic from Figma `Rectangle 608` bottom edge (1714:111), normalised to
          1440×170. Height scales at 11.8vw (= 170÷1440) so mobile keeps the same curve shape. */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 block h-[clamp(2.75rem,11.8vw,10.625rem)] w-full text-white max-sm:-mb-px"
        viewBox="0 0 1440 170"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path fill="currentColor" d="M0 0 C538.876 169.33 855.872 157.05 1440 0 V170 H0 Z" />
      </svg>

      {/* Ellipse 2030 — left avatar (floats beside the headline). */}
      {hasLeftFloat ? (
        <div
          className={`${REVEAL_ITEM} pointer-events-none absolute left-[clamp(0.75rem,5vw,7.5rem)] top-[clamp(7rem,17vw,17rem)] z-20 hidden size-[clamp(3.5rem,8vw,6.5rem)] overflow-hidden rounded-full sm:block`}
          aria-hidden
        >
          <Media
            image={section.leftFloatingImage}
            className="size-full object-cover"
            width={104}
            height={104}
            sizes="104px"
          />
        </div>
      ) : null}

      {/* Ellipse 2034 — right avatar (floats lower, beside the offer line). */}
      {hasRightFloat ? (
        <div
          className={`${REVEAL_ITEM} pointer-events-none absolute right-[clamp(0.75rem,5vw,7.5rem)] top-[clamp(10rem,22vw,22.5rem)] z-20 hidden size-[clamp(3.25rem,7.5vw,6.25rem)] overflow-hidden rounded-full sm:block`}
          aria-hidden
        >
          <Media
            image={section.rightFloatingImage}
            className="size-full object-cover"
            width={100}
            height={100}
            sizes="100px"
          />
        </div>
      ) : null}

      {/* Frame 2147229999 — copy + CTAs, then the dashboard, all in normal flow. */}
      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-360 flex-col items-center px-6 pt-[clamp(8rem,13vw,11.625rem)]">
        {hasCopy ? (
          <div className="flex w-full min-w-0 max-w-167.5 flex-col items-center gap-5 text-center sm:gap-[24px]">
            {section.eyebrow.trim() ? (
              <p
                className={`${REVEAL_ITEM} m-0 max-w-full font-sans text-sm font-medium leading-[1.6] text-white sm:text-base lg:text-[20px]`}
              >
                {section.eyebrow.trim()}
              </p>
            ) : null}

            {section.title.trim() ? (
              <SectionHeading
                as="h1"
                text={section.title}
                multiline
                className={`${REVEAL_ITEM} m-0 max-w-full break-words font-sans text-[1.75rem] font-semibold leading-[1.15] text-white sm:text-4xl sm:leading-tight md:text-5xl lg:text-[60px] lg:leading-[64px] [&_span]:break-words [&_span]:text-inherit [&_span]:font-semibold [&_span]:leading-inherit`}
              />
            ) : null}

            {section.offerText.replace(/<[^>]+>/g, "").trim() ? (
              <RichText
                prose={false}
                html={section.offerText}
                className={`${REVEAL_ITEM} max-w-full break-words text-xl font-semibold leading-[1.1] text-white sm:text-2xl lg:text-[36px] [&_p]:m-0 [&_p]:break-words [&_p]:text-inherit [&_p]:font-semibold [&_p]:leading-[1.1] [&_p]:text-white lg:[&_p]:text-[36px]`}
              />
            ) : null}
          </div>
        ) : null}

        {section.ctas.length > 0 ? (
          <div
            className={`${REVEAL_ITEM} mt-8 flex w-full min-w-0 max-w-167.5 flex-col items-center gap-[14px] sm:mt-[38px] sm:flex-row sm:items-center sm:justify-center`}
          >
            {section.ctas.map((cta, i) => {
              const r = resolveLink(cta.url, lang);
              if (!r) return null;
              const variant = ctaVariantAt(i, "white");
              return (
                <Button
                  key={`${section.id}-cta-${i}`}
                  href={r.href}
                  target={r.target}
                  variant={variant}
                  ctaSize="default"
                  ctaElevation={variant === "ctaWhite" ? "footerSecondary" : "none"}
                  ctaFullWidth={false}
                  className="self-center"
                >
                  {cta.text || r.label}
                </Button>
              );
            })}
          </div>
        ) : null}

        {/* Mask group — flat dashboard exported from Figma (node 1714:114). The wave overlaps its
            lower edge so it tucks in with no gap. Static asset on purpose — the CMS image differs. */}
        <div
          data-hero-dashboard
          className={`${REVEAL_ITEM} relative z-10 mt-[clamp(2.5rem,5vw,4.5rem)] w-full max-w-247.5 overflow-hidden rounded-t-[12px] mask-[linear-gradient(to_bottom,#000_42%,rgba(0,0,0,0.45)_72%,transparent_86%)] max-sm:mask-[linear-gradient(to_bottom,#000_34%,rgba(0,0,0,0.35)_62%,transparent_76%)]`}
          style={{ aspectRatio: "990.5 / 468" }}
        >
          <Image
            src="/hero-wave-dashboard.png"
            alt="Salonora dashboard overzicht"
            fill
            unoptimized
            className="rounded-t-[12px] object-cover object-top"
            sizes="(min-width: 1280px) 990px, 92vw"
            priority
          />
        </div>
      </div>
    </section>
  );
}
