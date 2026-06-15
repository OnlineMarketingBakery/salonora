import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type {
  PricingDualCardsCardItemT,
  PricingDualCardsSectionT,
} from "@/types/sections";
import type { CSSProperties } from "react";

const heroIntroProse = [
  "!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-base !prose-p:font-normal !prose-p:leading-6",
  "!prose-p:text-white prose-strong:text-white prose-a:text-white prose-a:underline",
  "[&_p+p]:!mt-0",
].join(" ");

const cardDescProse = [
  "!prose-p:mt-0 !prose-p:mb-0 !prose-p:text-base !prose-p:leading-relaxed",
  "!prose-p:text-muted prose-strong:text-navy-deep",
].join(" ");

/** Primary price line — Figma **1714:169** / **1714:228** accent 20px medium. */
const priceHighlightProse = [
  "!prose-p:my-0 !prose-p:text-xl !prose-p:font-medium !prose-p:leading-[1.22]",
  "!prose-p:text-accent prose-strong:text-accent",
].join(" ");

const priceSecondaryProse = [
  "!prose-p:my-0 !prose-p:text-sm !prose-p:font-medium !prose-p:leading-relaxed",
  "!prose-p:text-navy-deep prose-strong:text-navy-deep",
].join(" ");

const priceFooterProse = [
  "!prose-p:my-0 !prose-p:text-sm !prose-p:leading-relaxed",
  "!prose-p:text-muted prose-strong:text-navy-deep",
  "[&_p+p]:mt-3",
].join(" ");

/** Figma: radius 20; fill linear 90deg â€” `--palette-brand` / `--palette-brand-strong` (= #3990F0 / #0569D7). */
const heroShell: CSSProperties = {
  borderRadius: "20px",
  background:
    "linear-gradient(180deg, var(--palette-brand) 0%, var(--palette-brand-strong) 100%)",
};

/** Figma **1906:35** / **1714:805** — person intrinsic ratio (370×433). */
const HERO_PERSON_W = 370;
const HERO_PERSON_H = 433;

/** Hero: thin rule between title and intro â€” opaque white left, fades out ~mid-width */
const heroTitleDivider: CSSProperties = {
  height: "1px",
  backgroundImage:
    "linear-gradient(90deg, rgb(255 255 255 / 0.92) 0%, rgb(255 255 255 / 0.22) 44%, transparent 56%)",
};

const elevatedCardShadow: CSSProperties = {
  boxShadow:
    "0 4px 40px color-mix(in srgb, var(--palette-muted) 13%, transparent)",
};

/** Between header and features â€” solid muted left, fades out mid-row (aligned via lg subgrid) */
const cardIntroDivider: CSSProperties = {
  height: "1px",
  backgroundImage:
    "linear-gradient(90deg, color-mix(in srgb, var(--palette-muted) 72%, transparent) 0%, color-mix(in srgb, var(--palette-muted) 22%, transparent) 42%, transparent 58%)",
};

function cardHasBody(card: PricingDualCardsCardItemT): boolean {
  const feats = (card.features ?? []).filter((f) => f.text?.trim());
  return Boolean(
    card.title?.trim() ||
    card.description?.trim() ||
    feats.length ||
    card.price_highlight?.trim() ||
    card.price_secondary?.trim() ||
    card.price_footer?.trim() ||
    (card.ctas ?? []).length,
  );
}

/** Figma **1714:1185** crown glyph inside **1714:1183** popular badge. */
function PricingPopularCrownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M2.00391 19H22.0039V21H2.00391V19ZM2.00391 5L7.00391 8L12.0039 2L17.0039 8L22.0039 5V17H2.00391V5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Figma **1714:1183** — 169×47 brand pill centered on tinted card top edge. */
function PricingPopularBadge({ label }: { label: string }) {
  return (
    <div
      className="absolute -top-6 left-1/2 z-20 flex h-[47px] min-w-[169px] -translate-x-1/2 items-center justify-center rounded-[15px] bg-brand p-3"
      aria-hidden
    >
      <span className="flex items-center gap-1.5">
        <PricingPopularCrownIcon className="size-6 shrink-0 text-white" />
        <span className="font-sans text-base font-semibold leading-none text-white whitespace-nowrap">
          {label}
        </span>
      </span>
    </div>
  );
}

const POPULAR_BADGE_LABEL: Record<Locale, string> = {
  nl: "Meest Gekozen",
  en: "Most popular",
};

function PricingPackageCard({
  card,
  lang,
}: {
  card: PricingDualCardsCardItemT;
  lang: Locale;
}) {
  const isTinted = card.panel_style === "tinted";
  const pillBg: CSSProperties = {
    backgroundColor: isTinted ? "var(--palette-white)" : "var(--palette-pill)",
  };
  const panelBg = isTinted ? "bg-card" : "bg-white";
  const ctas = card.ctas ?? [];
  const primary = ctas[0];
  const link = primary ? resolveLink(primary.url, lang) : null;
  const href = link?.href;
  const label = primary?.text || link?.label || "";
  const features = (card.features ?? []).filter((f) => f.text?.trim());

  const ctaVariant = isTinted ? "ctaNavy" : "ctaBrand";
  const hasHeader = Boolean(card.title?.trim() || card.description?.trim());
  const showPopularBadge = isTinted;
  const popularBadgeLabel =
    card.badge?.trim() || POPULAR_BADGE_LABEL[lang] || POPULAR_BADGE_LABEL.nl;

  return (
    <article
      className={`${REVEAL_ITEM} relative flex min-h-0 flex-col rounded-[20px] p-6 sm:p-10 lg:p-12 ${panelBg} ${
        isTinted ? "border border-solid border-brand" : ""
      }`}
      style={isTinted ? undefined : elevatedCardShadow}
    >
      {showPopularBadge ? <PricingPopularBadge label={popularBadgeLabel} /> : null}

      <div className={`flex min-h-0 flex-col gap-6 lg:gap-6 ${showPopularBadge ? "pt-4" : ""}`}>
        <div className="flex min-w-0 flex-col gap-7 lg:gap-7">
          <div className="flex min-w-0 flex-col gap-[19px]">
            <div className="flex min-w-0 flex-col gap-3">
              {card.title?.trim() ? (
                <h3 className="max-w-xl font-sans text-2xl font-semibold leading-[1.1] text-navy-deep">
                  {card.title.trim()}
                </h3>
              ) : null}
              {card.description?.trim() ? (
                <RichText
                  html={card.description}
                  className={`max-w-xl ${cardDescProse}`}
                />
              ) : null}
            </div>
            {hasHeader ? (
              <div
                className="h-px w-full max-w-xl shrink-0 self-start"
                style={cardIntroDivider}
                aria-hidden
              />
            ) : null}
          </div>

          {features.length > 0 ? (
            <ul className="flex list-none flex-col gap-3 p-0 lg:gap-3">
              {features.map((f, i) => (
                <li key={i}>
                  <div
                    className="inline-flex h-[42px] max-w-full flex-row items-center gap-1.5 rounded-[21px] px-2.5 py-2.5"
                    style={pillBg}
                  >
                  {f.icon ? (
                    <Media
                      image={f.icon}
                      width={27}
                      height={23}
                      className="h-[23px] w-[27px] shrink-0 object-contain"
                      sizes="27px"
                      preferLargestSource
                    />
                  ) : null}
                  <span className="font-sans text-sm font-normal leading-[1.6] text-navy-deep">
                    {f.text?.trim()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          ) : null}
        </div>

        <div className="mt-auto flex min-h-0 flex-col gap-6 lg:mt-0">
          <div className="flex flex-col gap-3">
            {card.price_highlight?.trim() ? (
              <RichText
                html={card.price_highlight}
                className={`max-w-xl ${priceHighlightProse}`}
              />
            ) : null}
            {card.price_secondary?.trim() ? (
              <RichText
                html={card.price_secondary}
                className={`max-w-xl ${priceSecondaryProse} font-semibold`}
              />
            ) : null}
            {card.price_footer?.trim() ? (
              <RichText
                html={card.price_footer}
                className={`max-w-xl ${priceFooterProse}`}
              />
            ) : null}
          </div>
          {href && label.trim() ? (
            <Button
              href={href}
              target={link?.target}
              variant={ctaVariant}
              ctaSize="package"
              ctaElevation={isTinted ? "default" : "none"}
              ctaFullWidth={false}
              className="self-start"
            >
              {label.trim()}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function PricingDualCardsSection({
  section,
  lang,
}: {
  section: PricingDualCardsSectionT;
  lang: Locale;
}) {
  const person = section.hero_person_image ?? null;
  const hasIntro =
    Boolean(section.badge?.trim()) ||
    Boolean(section.title?.trim()) ||
    Boolean(section.intro?.trim()) ||
    Boolean(person);
  const cards = (section.cards ?? []).filter(cardHasBody);

  if (!hasIntro && !cards.length) {
    return null;
  }

  return (
    <section className="relative z-0 overflow-x-clip pb-10 pt-12 sm:pb-12 sm:pt-14 lg:pb-14 lg:pt-[112px]">
      <Container className="relative z-0 flex flex-col gap-10 lg:gap-14">
        {hasIntro ? (
          <div className={`${REVEAL_ITEM} relative`}>
            {/* Blue band — compact (padding-driven height); person overflows above it */}
            <div
              className="relative max-lg:overflow-visible overflow-hidden rounded-[20px]"
              style={heroShell}
            >
              <div className="relative flex flex-col px-6 pt-8 pb-0 sm:px-10 sm:pt-10 sm:pb-0 lg:px-12 lg:py-9">
                <div className="relative z-1 flex min-w-0 flex-col gap-5 lg:max-w-[55%]">
                  {section.badge?.trim() ? (
                    <span className="inline-flex h-[42px] min-h-[42px] w-fit shrink-0 items-center justify-center rounded-[21px] bg-white px-3 text-base font-medium leading-[1.6] text-brand">
                      {section.badge.trim()}
                    </span>
                  ) : null}
                  <div className="flex flex-col gap-[18px]">
                    {section.title?.trim() ? (
                      <SectionHeading
                        as="h2"
                        text={section.title}
                        className="font-sans text-3xl font-semibold capitalize leading-tight text-white sm:text-4xl lg:text-[48px] lg:leading-[56px]"
                      />
                    ) : null}
                    {section.title?.trim() && section.intro?.trim() ? (
                      <div
                        className="h-px w-full shrink-0 self-start"
                        style={heroTitleDivider}
                        aria-hidden
                      />
                    ) : null}
                    {section.intro?.trim() ? (
                      <RichText
                        html={section.intro}
                        className={`max-w-[568px] ${heroIntroProse} text-white`}
                      />
                    ) : null}
                  </div>
                </div>

                {/* Mobile — natural PNG sizing (aspect box was clipping the baked-in circle) */}
                {person ? (
                  <div className="relative z-10 mt-5 flex justify-center sm:mt-6 lg:hidden">
                    <Media
                      image={person}
                      width={HERO_PERSON_W}
                      height={HERO_PERSON_H}
                      className="block h-auto w-[260px] max-w-full sm:w-[280px]"
                      sizes="(max-width: 640px) 260px, 280px"
                      preferLargestSource
                      unoptimized
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {person ? (
              <div className="pointer-events-none absolute bottom-0 right-0 z-20 hidden items-end justify-end lg:flex">
                {/* Desktop — natural PNG sizing (aspect fill box clipped the baked-in circle) */}
                <Media
                  image={person}
                  width={HERO_PERSON_W}
                  height={HERO_PERSON_H}
                  className="block h-[360px] w-auto max-w-none object-contain object-bottom"
                  sizes="360px"
                  preferLargestSource
                  unoptimized
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {cards.length > 0 ? (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start lg:gap-6">
            {cards.map((card, i) => (
              <PricingPackageCard key={i} card={card} lang={lang} />
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
