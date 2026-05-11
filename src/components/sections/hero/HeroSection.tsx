import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { StarRating } from "@/components/ui/StarRating";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { ctaVariantAt } from "@/lib/ui/ctaAlternation";
import { resolveLink } from "@/lib/utils/links";
import type { HeroSectionT } from "@/types/sections";
import React from "react";

export function HeroSection({
  section,
  lang,
}: {
  section: HeroSectionT;
  lang: Locale;
}) {
  const showSocial = Boolean(section.trustImage || section.trustLine);
  const isCompact = section.variant === "compact";
  const hasTagline = Boolean(section.tagline?.trim());
  const hasFloatingCard = Boolean(
    section.floatingCard?.replace(/<[^>]+>/g, "").trim(),
  );
  const hasBehindImage = Boolean(section.behindImage);
  const hasForegroundImage = Boolean(section.image);
  const useHeroVisualColumn = hasForegroundImage || hasFloatingCard;
  const behindOnly = Boolean(section.behindImage && !hasForegroundImage);
  const behindTextOverlapGuard = behindOnly && !useHeroVisualColumn;
  const useLooseHeroLayout = !(hasBehindImage && hasForegroundImage);
  const bothHeroImages = hasBehindImage && hasForegroundImage;
  const foregroundOnly = hasForegroundImage && !hasBehindImage;
  const behindRightPad = section.behindImageRightPadding ?? 0;

  // ─── Vertical padding ────────────────────────────────────────────────────────
  // NAV_HEIGHT: the floating navbar pill on mobile is ~80px tall with ~8px gap
  // from the viewport top = ~88px total. We use 92px to give a small breath.
  const NAV_HEIGHT = 92;

  // bothHeroImages: person photo leads the page. We still need NAV_HEIGHT so the
  // image starts just below the nav pill — face fully visible, not hidden behind it.
  // Other variants: same NAV_HEIGHT so eyebrow text clears the nav.
  const MOBILE_TOP_PAD = NAV_HEIGHT;

  const sectionVerticalClass = useLooseHeroLayout
    ? behindOnly
      ? isCompact
        ? "pb-0 sm:pt-32 sm:pb-0 md:pt-36 lg:pt-48 lg:pb-20 xl:pt-52"
        : "pb-0 sm:pt-36 sm:pb-0 lg:pt-52 lg:pb-24 xl:pt-56 xl:pb-28"
      : foregroundOnly
        ? isCompact
          ? "pb-0 sm:pt-32 md:pt-36 lg:pt-40"
          : "pb-0 sm:pt-36 lg:pt-44 xl:pt-48"
        : isCompact
          ? "pb-0 sm:pt-32 sm:pb-0 md:pt-36 lg:pb-20"
          : "pb-0 sm:pt-36 sm:pb-0 lg:pt-44 lg:pb-24 xl:pt-48 xl:pb-28"
    : "pb-0 sm:pt-32 md:pt-36";

  // ─── Behind image shared classes ─────────────────────────────────────────────
  const behindMediaClass =
    "h-auto max-h-full w-full object-contain object-bottom object-right";
  const behindWidthClass = behindOnly ? "w-[40%]" : "w-1/2";

  // ─── Title size ──────────────────────────────────────────────────────────────
  const titleSizeClass = isCompact
    ? "text-[1.75rem] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem] lg:leading-[3.75rem]"
    : "text-[1.875rem] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl md:text-5xl lg:text-[4rem] lg:leading-[4.625rem]";

  // ─── Offer text size ─────────────────────────────────────────────────────────
  const offerSize = section.offerTextSize ?? "large";
  const offerSizeClass =
    offerSize === "small"
      ? "text-base sm:text-lg lg:text-[24px]"
      : offerSize === "medium"
        ? "text-lg sm:text-xl lg:text-[30px]"
        : "text-xl sm:text-2xl lg:text-[36px]";

  const heroId = `hero-${section.id ?? "main"}`;

  // Explicit px breakpoint overrides — match the Tailwind pt-* values exactly.
  // pt-32=128  pt-36=144  pt-40=160  pt-44=176  pt-48=192  pt-52=208  pt-56=224
  const smPt = isCompact ? 128 : 144; // sm:pt-32 compact / sm:pt-36 default
  const mdPt = 144; // md:pt-36 across all variants
  const lgPt = bothHeroImages
    ? 128
    : behindOnly
      ? isCompact
        ? 192
        : 208
      : foregroundOnly
        ? isCompact
          ? 160
          : 176
        : isCompact
          ? 160
          : 176;
  const xlPt = bothHeroImages
    ? 128
    : behindOnly
      ? isCompact
        ? 208
        : 224
      : foregroundOnly
        ? isCompact
          ? 176
          : 192
        : isCompact
          ? 176
          : 192;

  return (
    <section
      id={heroId}
      className={`relative overflow-hidden ${sectionVerticalClass}`}
      style={{ paddingTop: `${MOBILE_TOP_PAD}px` }}
    >
      {/*
        Explicit @media overrides for sm/md/lg/xl — needed because inline style
        has higher specificity than Tailwind stylesheet classes, and `revert`
        restores browser defaults (0px), not Tailwind values.
        These px values match the sm:pt-* / lg:pt-* Tailwind classes exactly.
        bothHeroImages uses pt:0 on mobile so no override needed for that variant.
      */}
      <style>{`
        /* Override inline paddingTop at each breakpoint for all variants.
           Inline styles beat Tailwind classes, so we need explicit px values here. */
        @media (min-width: 640px)  { #${heroId} { padding-top: ${smPt}px; } }
        @media (min-width: 768px)  { #${heroId} { padding-top: ${mdPt}px; } }
        @media (min-width: 1024px) { #${heroId} { padding-top: ${lgPt}px; } }
        @media (min-width: 1280px) { #${heroId} { padding-top: ${xlPt}px; } }
        ${
          bothHeroImages
            ? `
          /* Mobile: cap person image height — enough to show full body, not full screen */
          #${heroId} .hero-person-img
          /* sm+: remove height cap and bottom fade — desktop grid handles sizing */
          @media (min-width: 640px) {
            #${heroId} .hero-person-img {
              max-height: none;
              -webkit-mask-image: none;
              mask-image: none;
            }
          }
        `
            : ""
        }
      `}</style>
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-gradiant.png')" }}
        aria-hidden
      />

      <Container className={bothHeroImages ? "px-0 sm:px-4 lg:px-8" : ""}>
        <div
          className={`grid min-w-0 items-stretch ${
            useHeroVisualColumn
              ? useLooseHeroLayout
                ? "lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-x-12 xl:gap-x-16 2xl:gap-x-24"
                : "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.8fr)]"
              : "lg:grid-cols-1"
          } ${
            // bothHeroImages mobile: flex-col with image first (visual hook),
            // copy second. lg: back to normal grid row order.
            bothHeroImages ? "flex flex-col lg:grid" : ""
          }`}
        >
          {/* ── Copy column ───────────────────────────────────────────────── */}
          <div
            className={`relative z-10 min-w-0 w-full ${
              bothHeroImages
                ? // order-2: renders after the image on mobile (image is order-1).
                  // lg:order-1: restores left-column position on desktop.
                  // px-4: re-adds horizontal padding since Container has px-0 on mobile.
                  // pt-5: breathing room between image bottom and copy.
                  "order-2 lg:order-1 px-4 sm:px-0 pt-5 sm:pt-0 pb-8 sm:pb-6 lg:self-center lg:pb-0"
                : foregroundOnly
                  ? "self-start py-8 sm:py-14"
                  : behindOnly
                    ? "self-start py-8 lg:py-14"
                    : `self-start py-8 lg:py-14 ${useLooseHeroLayout ? "lg:pb-14" : "lg:pb-[60px]"}`
            } ${
              behindTextOverlapGuard
                ? "lg:max-w-[min(100%,38rem)] xl:max-w-[min(100%,40rem)]"
                : ""
            }`}
          >
            {section.eyebrow && (
              <p
                className={`${REVEAL_ITEM} mb-2 text-sm font-medium leading-normal text-brand sm:text-base md:text-[20px] md:leading-relaxed`}
              >
                {section.eyebrow}
              </p>
            )}
            {hasTagline && (
              <p
                className={`${REVEAL_ITEM} mb-3 text-sm font-normal leading-snug text-muted sm:text-base`}
              >
                {section.tagline?.trim()}
              </p>
            )}
            <h1 className={`${REVEAL_ITEM} ${titleSizeClass}`}>
              {section.title}
            </h1>
            {section.text && (
              <RichText
                html={section.text}
                className={`${REVEAL_ITEM} mt-3 text-sm leading-relaxed text-muted sm:text-base sm:mt-4`}
              />
            )}
            {section.offerText && (
              <RichText
                html={section.offerText}
                className={`${REVEAL_ITEM} mt-2 !prose-p:text-inherit ${offerSizeClass} font-semibold !text-accent !prose-p:text-inherit !prose-strong:text-navy lg:mt-4 [&_p]:!m-0 [&_p]:leading-tight`}
              />
            )}
            {section.ctas.length > 0 && (
              // Mobile: full-width stacked buttons. sm+: auto-width inline row.
              <div
                className={`${REVEAL_ITEM} mt-6 flex w-full min-w-0 flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-[18px]`}
              >
                {section.ctas.map((cta, i) => {
                  const r = resolveLink(cta.url, lang);
                  if (!r) return null;
                  return (
                    <Button
                      key={`${section.id}-cta-${i}`}
                      href={r.href}
                      target={r.target}
                      variant={ctaVariantAt(i)}
                      ctaSize="hero"
                      ctaFullWidth={false}
                      className="w-full justify-center sm:w-auto"
                    >
                      {cta.text || r.label}
                    </Button>
                  );
                })}
              </div>
            )}
            {showSocial && (
              <div
                className={`${REVEAL_ITEM} mt-6 flex flex-col items-start justify-start gap-2 sm:mt-9 sm:flex-row sm:items-center sm:gap-4`}
              >
                {section.trustImage && (
                  <Media
                    image={section.trustImage}
                    preferLargestSource
                    width={960}
                    height={180}
                    sizes="(max-width: 640px) 72vw, 480px"
                    quality={92}
                    className="h-8 w-auto max-w-full shrink-0 object-contain object-left sm:h-12"
                  />
                )}
                {section.trustLine && (
                  <div className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2.5">
                    <StarRating className="shrink-0" />
                    <RichText
                      html={section.trustLine}
                      className="text-xs font-medium leading-normal tracking-[-0.04em] text-muted sm:text-sm [&_strong]:font-bold [&_strong]:text-navy"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Behind image ──────────────────────────────────────────────── */}
          {section.behindImage &&
            (bothHeroImages ? (
              // bothHeroImages: always hidden on mobile (foreground person photo is enough).
              // Desktop: absolute right column behind foreground image.
              <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden sm:flex w-1/2 min-w-0 items-end justify-end pt-28 lg:pt-32">
                {behindRightPad > 0 ? (
                  <div
                    className="flex h-full min-h-0 w-full min-w-0 items-end justify-end"
                    style={{ paddingRight: behindRightPad }}
                  >
                    <Media
                      image={section.behindImage}
                      preferLargestSource
                      className={behindMediaClass}
                      width={560}
                      height={640}
                      sizes="50vw"
                      quality={90}
                    />
                  </div>
                ) : (
                  <Media
                    image={section.behindImage}
                    preferLargestSource
                    className={behindMediaClass}
                    width={560}
                    height={640}
                    sizes="50vw"
                    quality={90}
                  />
                )}
              </div>
            ) : (
              // behindOnly variant:
              // • Mobile  → hidden here; rendered as in-flow image block below the copy.
              // • Desktop → absolute-positioned in the right portion of the section.
              <div
                className={`pointer-events-none absolute right-0 bottom-0 z-0 hidden lg:flex min-w-0 items-end justify-end top-6 lg:top-10 ${useLooseHeroLayout ? "lg:pr-8" : ""}${behindWidthClass}`}
              >
                <div
                  className="flex h-full min-h-0 w-full min-w-0 items-end justify-end"
                  style={
                    behindRightPad > 0
                      ? { paddingRight: behindRightPad }
                      : undefined
                  }
                >
                  <Media
                    image={section.behindImage}
                    preferLargestSource
                    className={behindMediaClass}
                    width={560}
                    height={640}
                    sizes="40vw"
                    quality={90}
                  />
                </div>
              </div>
            ))}

          {/* ── Foreground / visual column ────────────────────────────────── */}
          {useHeroVisualColumn && (
            <div
              className={`relative flex w-full min-w-0 items-end self-stretch lg:h-full lg:pt-2 ${
                bothHeroImages
                  ? // order-1: image first on mobile. lg:order-2: right column on desktop.
                    // No REVEAL_ITEM on mobile — image is above fold, instant render feels better.
                    "order-1 lg:order-2"
                  : `${REVEAL_ITEM} ${!useLooseHeroLayout ? "" : "justify-end"}`
              }`}
            >
              {section.image && (
                <Media
                  image={section.image}
                  className={`hero-person-img relative z-10 h-auto w-full max-w-none object-contain ${
                    bothHeroImages
                      ? "object-top lg:object-bottom"
                      : "object-bottom"
                  }`}
                  style={
                    bothHeroImages
                      ? ({
                          // Soft bottom fade — image dissolves into the copy section below.
                          // Removed at sm+ via the scoped style block above.
                          WebkitMaskImage:
                            "linear-gradient(to bottom, black 65%, transparent 100%)",
                          maskImage:
                            "linear-gradient(to bottom, black 65%, transparent 100%)",
                        } as React.CSSProperties)
                      : undefined
                  }
                  width={600}
                  height={750}
                  sizes="(min-width: 1024px) 38vw, 92vw"
                />
              )}
              {hasFloatingCard && (
                <div className="pointer-events-auto absolute z-20 bottom-4 left-1/2 -translate-x-1/2 w-[min(86%,260px)] rounded-2xl bg-white px-4 py-3 shadow-[0_11px_24px_color-mix(in_srgb,var(--palette-muted)_12%,transparent)] sm:bottom-6 sm:w-[min(80%,260px)] sm:px-5 sm:py-4 lg:left-auto lg:right-0 lg:top-1/2 lg:bottom-auto lg:translate-x-0 lg:-translate-y-1/2 lg:px-6 lg:py-5">
                  <RichText
                    html={section.floatingCard ?? ""}
                    className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-xs !prose-p:font-medium !prose-p:leading-snug !prose-p:text-navy-deep sm:!prose-p:text-sm lg:!prose-p:text-base [&_p+_p]:mt-1.5!"
                  />
                </div>
              )}
            </div>
          )}

          {/* ── behindOnly in-flow image (mobile only) ────────────────────── */}
          {/*
            The behind image for behindOnly variant is absolute on desktop (handled above).
            On mobile we render it as a normal in-flow block so it sits cleanly below
            the copy instead of overlapping it at an awkward size.
          */}
          {behindOnly && section.behindImage && (
            // Mobile-only in-flow dashboard/behind image.
            // Sits snug below CTA (mt-3), full width, right-anchored.
            // Slightly overflows the container on the right for a magazine feel
            // without being fully clipped — matches the desktop aesthetic.
            <div
              className={`${REVEAL_ITEM} block lg:hidden w-[110%] -mr-[5%] mt-3`}
            >
              <Media
                image={section.behindImage}
                preferLargestSource
                className="h-auto w-full max-h-[55vw] object-contain object-right-bottom"
                width={600}
                height={420}
                sizes="100vw"
                quality={90}
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
