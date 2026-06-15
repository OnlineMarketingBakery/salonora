/** Figma **346:5623** — badge/heading/CTA **597:5386**, phone **597:5432**, cards **597:5396**. */
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { FeatureHighlightSplitSectionT } from "@/types/sections";
import type { CSSProperties } from "react";

/** Figma **346:5625** — mesh wash before brand color-blend (**346:5626**). */
const HERO_BG_SRC = "/feature-highlight-split-hero-bg.png";

/** Figma page coords relative to content origin (x=142): left 0, phone 186, cards 788. */
const LG_LEFT_W = 341;
const LG_PHONE_L = 186;
const LG_PHONE_W = 568;
const LG_PHONE_H = 618;
const LG_CARDS_L = 788;
const LG_CARDS_W = 368;

/** Figma 946:34 — heading supports manual line breaks; strip tags only when splitting. */
function linesFromHeading(raw: string | undefined): string[] {
  return (raw ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/\r?\n+/)
    .map((l) => l.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}

const heroBgImageStyle: Pick<CSSProperties, "backgroundImage"> = {
  backgroundImage: `url("${HERO_BG_SRC}")`,
};

const brandColorBlendLayer: CSSProperties = {
  backgroundColor: "var(--palette-brand)",
  mixBlendMode: "color",
};

/** Cards: Figma **346:6111** — white → 53% white gradient + soft shadow. */
const cardFace: CSSProperties = {
  background: `linear-gradient(
    90deg,
    var(--palette-white) 0%,
    color-mix(in srgb, var(--palette-white) 53%, transparent) 100%
  )`,
  boxShadow: "0 11px 24px rgba(67, 87, 128, 0.1)",
};

const headlineStyle: CSSProperties = {
  fontSize: "clamp(2rem, 5vw + 0.5rem, 5.25rem)",
  lineHeight: "clamp(2.25rem, 5vw + 0.75rem, 5.875rem)",
};

const cardProse = [
  "!prose-p:mb-[5px] !prose-p:mt-0 last:!prose-p:mb-0",
  "!prose-p:max-w-none !prose-p:text-base !prose-p:font-medium !prose-p:leading-[1.1] lg:!prose-p:text-[18px]",
  "prose-strong:text-navy-deep",
  "[&_p:last-child]:!mb-0",
].join(" ");

/** Figma **597:5407–5410** — flat-left tab with curved right edge (not a symmetric pill). */
const ACCENT_PATH =
  "M0 0C5.79402 6.4378 9 14.7924 9 23.4536V26.5464C9 35.2076 5.79402 43.5622 0 50V0Z";

function CardAccent({ variant }: { variant: "brand" | "rose" }) {
  const fill =
    variant === "brand" ? "var(--palette-brand)" : "var(--palette-rose)";

  return (
    <svg
      width={9}
      height={50}
      viewBox="0 0 9 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none absolute left-0 top-1/2 z-20 block h-[50px] w-[9px] min-w-[9px] shrink-0 -translate-y-1/2"
      aria-hidden
    >
      <path d={ACCENT_PATH} fill={fill} />
    </svg>
  );
}

function PromiseCard({
  html,
  index,
  isLongCard,
}: {
  html: string;
  index: number;
  isLongCard: boolean;
}) {
  const shortCardProse = " [&_p]:whitespace-normal lg:[&_p]:whitespace-nowrap";
  const longCardProse = " [&_p]:max-w-none [&_p]:whitespace-normal lg:[&_p]:max-w-[275px]";

  return (
    <article className="relative isolate w-full shrink-0 overflow-visible">
      <CardAccent variant={index % 2 === 0 ? "brand" : "rose"} />
      <div
        className={`surface-light relative flex w-full items-center overflow-hidden rounded-[14px] px-8 sm:px-[32px] ${
          isLongCard ? "min-h-[121px] py-4 lg:h-[121px] lg:py-0" : "min-h-[80px] py-3 lg:h-[80px] lg:py-0"
        }`}
        style={cardFace}
      >
        <RichText
          html={html}
          className={`relative z-[2] w-full max-w-none text-navy-deep ${cardProse}${isLongCard ? longCardProse : shortCardProse}`}
        />
      </div>
    </article>
  );
}

/** Figma **597:5391** — 252×63 pill; inner row gap 36px; icon **597:5394** 27×27. */
function LeftCta({
  ctaHref,
  ctaLabel,
  ctaTarget,
  className = "",
}: {
  ctaHref?: string;
  ctaLabel?: string;
  ctaTarget?: string;
  className?: string;
}) {
  if (!ctaHref || !ctaLabel?.trim()) return null;

  return (
    <Link
      href={ctaHref}
      target={ctaTarget}
      rel={ctaTarget === "_blank" ? "noopener noreferrer" : undefined}
      className={`flex h-[63px] w-full shrink-0 items-center justify-between rounded-[31.5px] bg-brand pl-[22px] pr-5 text-[20px] font-normal leading-normal text-white shadow-[0px_6px_10px_color-mix(in_srgb,var(--palette-brand)_54%,transparent)] transition-opacity hover:opacity-95 lg:inline-flex lg:w-[252px] lg:max-w-full lg:justify-start lg:gap-9 lg:self-start ${className}`.trim()}
    >
      <span className="shrink-0 whitespace-nowrap">{ctaLabel.trim()}</span>
      <Image
        src="/button-icon-primary.svg"
        width={27}
        height={27}
        alt=""
        unoptimized
        className="size-[27px] shrink-0"
        aria-hidden
      />
    </Link>
  );
}

function LeftColumn({
  badge,
  titleLines,
  ctaHref,
  ctaLabel,
  ctaTarget,
  showCta = true,
  className = "",
  style,
}: {
  badge?: string;
  titleLines: string[];
  ctaHref?: string;
  ctaLabel?: string;
  ctaTarget?: string;
  showCta?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`flex flex-col gap-7 lg:gap-[28px] ${className}`} style={style}>
      <div className="flex flex-col gap-[19px]">
        {badge?.trim() ? (
          <span className="inline-flex h-[42px] w-[146px] items-center justify-center rounded-[21px] bg-white px-5 text-base font-medium leading-[1.6] text-brand">
            {badge.trim()}
          </span>
        ) : null}
        {titleLines.length > 0 ? (
          <h2
            className="min-w-0 font-sans font-semibold text-navy-deep"
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
      {showCta ? (
        <LeftCta ctaHref={ctaHref} ctaLabel={ctaLabel} ctaTarget={ctaTarget} />
      ) : null}
    </div>
  );
}

function PhoneColumn({
  mockup,
  className = "",
  style,
}: {
  mockup: NonNullable<FeatureHighlightSplitSectionT["mockup_image"]>;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`flex justify-center ${className}`} style={style}>
      <div className="relative h-auto w-full max-w-[568px] lg:h-[618px] lg:max-w-none">
        <Media
          image={mockup}
          width={568}
          height={618}
          className="mx-auto h-auto w-full object-contain object-bottom lg:h-full lg:max-h-[618px]"
          sizes="(min-width: 1024px) 568px, 100vw"
          preferLargestSource
        />
      </div>
    </div>
  );
}

function PromiseCards({
  promises,
  className = "",
  style,
}: {
  promises: NonNullable<FeatureHighlightSplitSectionT["promise_items"]>;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`flex w-full flex-col gap-[20px] overflow-visible ${className}`} style={style}>
      {promises.map((item, i) => {
        const isLongCard = i === promises.length - 1 && promises.length > 1;
        return (
          <PromiseCard
            key={i}
            html={item.text ?? ""}
            index={i}
            isLongCard={isLongCard}
          />
        );
      })}
    </div>
  );
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
  const useFigmaDesktopLayout = hasLeft && hasVisual && hasPromises;

  if (!hasLeft && !hasVisual && !hasPromises) {
    return null;
  }

  return (
    <section className="relative isolate overflow-hidden py-14 sm:py-16 lg:min-h-[804px] lg:py-[93px]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-white" aria-hidden>
        <div
          className="absolute top-0 left-1/2 h-[901px] w-[1440px] max-w-none -translate-x-1/2 lg:h-[134.3%] lg:min-h-full lg:w-[138.84%] lg:translate-x-0 lg:left-[-19.42%]"
          style={{
            ...heroBgImageStyle,
            backgroundSize: "cover",
            backgroundPosition: "top center",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden
        />
        <div className="absolute inset-0" style={brandColorBlendLayer} aria-hidden />
      </div>

      <Container className="relative z-10 !max-w-[90rem]">
        {/* Mobile: badge/title → phone → CTA → cards (desktop unchanged below) */}
        <div
          className={`mx-auto flex w-full max-w-[1156px] flex-col gap-10 ${
            useFigmaDesktopLayout ? "lg:hidden" : ""
          }`}
        >
          {hasLeft ? (
            <LeftColumn
              className={REVEAL_ITEM}
              badge={section.badge}
              titleLines={titleLines}
              ctaHref={ctaHref}
              ctaLabel={ctaLabel}
              ctaTarget={ctaLink?.target}
              showCta={false}
            />
          ) : null}
          {hasVisual && mockup ? (
            <PhoneColumn mockup={mockup} className={REVEAL_ITEM} />
          ) : null}
          {hasLeft ? (
            <LeftCta
              className={REVEAL_ITEM}
              ctaHref={ctaHref}
              ctaLabel={ctaLabel}
              ctaTarget={ctaLink?.target}
            />
          ) : null}
          {hasPromises ? (
            <PromiseCards promises={promises} className={REVEAL_ITEM} />
          ) : null}
        </div>

        {/* Desktop: Figma absolute positions (597:5386 / 597:5432 / 597:5396) */}
        {useFigmaDesktopLayout && mockup ? (
          <div
            className={`${REVEAL_ITEM} relative mx-auto hidden h-[618px] w-full max-w-[1156px] lg:block`}
          >
            <LeftColumn
              className="absolute top-0 left-0 z-20"
              style={{ width: LG_LEFT_W }}
              badge={section.badge}
              titleLines={titleLines}
              ctaHref={ctaHref}
              ctaLabel={ctaLabel}
              ctaTarget={ctaLink?.target}
            />
            <PhoneColumn
              mockup={mockup}
              className="absolute top-0 z-10"
              style={{
                left: LG_PHONE_L,
                width: LG_PHONE_W,
                height: LG_PHONE_H,
              }}
            />
            <PromiseCards
              promises={promises}
              className="absolute top-0 z-20"
              style={{ left: LG_CARDS_L, width: LG_CARDS_W }}
            />
          </div>
        ) : null}
      </Container>
    </section>
  );
}
