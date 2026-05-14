import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import { getImageUrl, getLargestImageUrl } from "@/lib/utils/media";
import type {
  SalonValueCardAccentT,
  SalonValueCardT,
  SalonValuePropositionSectionT,
} from "@/types/sections";

const CARD_SHADOW = "shadow-[0px_11px_12px_rgba(67,87,128,0.09)]";
const CARD_SHADOW_CENTERED = "shadow-[0px_2px_12px_rgba(67,87,128,0.12)]";

function accentBarClass(accent: SalonValueCardAccentT) {
  return accent === "rose" ? "bg-rose" : "bg-brand";
}

function iconTileClass(accent: SalonValueCardAccentT) {
  return accent === "rose" ? "bg-rose-soft" : "bg-brand";
}

function SalonValueCheckIcon({ accent }: { accent: SalonValueCardAccentT }) {
  const bg = accent === "rose" ? "bg-rose-soft" : "bg-brand";
  return (
    <span
      className={`relative mt-0.5 inline-flex size-[25px] shrink-0 items-center justify-center rounded-full ${bg}`}
      aria-hidden
    >
      <svg
        className="h-[13px] w-[15px] text-[var(--palette-white)]"
        viewBox="0 0 15 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 6.5L5.5 11L14 1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function CardChecklistGlyph({
  accent,
  listIcon,
}: {
  accent: SalonValueCardAccentT;
  listIcon: SalonValueCardT["checklistIcon"];
}) {
  const custom =
    listIcon != null && (getLargestImageUrl(listIcon) || getImageUrl(listIcon))
      ? listIcon
      : null;
  if (custom) {
    return (
      <span
        className="relative mt-0.5 inline-flex size-[25px] shrink-0 items-center justify-center"
        aria-hidden
      >
        <Media
          image={custom}
          width={50}
          height={50}
          className="size-[25px] object-contain"
          sizes="25px"
          preferLargestSource
        />
      </span>
    );
  }
  return <SalonValueCheckIcon accent={accent} />;
}

function CardChecklist({ card }: { card: SalonValueCardT }) {
  if (card.checklistItems.length === 0) return null;
  return (
    <ul className="m-0 flex w-full min-w-0 list-none flex-col gap-3 p-0">
      {card.checklistItems.map((row, idx) => (
        <li key={idx} className="flex list-none items-start gap-1">
          <CardChecklistGlyph
            accent={card.accent}
            listIcon={card.checklistIcon}
          />
          <span className="min-w-0 flex-1 text-left text-base font-normal leading-[1.4] text-muted">
            {row.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ValueCard({
  card,
  centeredVariant,
  accentPlacement = "top",
}: {
  card: SalonValuePropositionSectionT["cards"][number];
  centeredVariant?: boolean;
  /** Split / homepage: top strip. Centered: bottom strip + checklist design. */
  accentPlacement?: "top" | "bottom";
}) {
  const figmaCentered = Boolean(centeredVariant);

  const accentStripTop = (
    <div
      className={`h-2.5 shrink-0 rounded-t-[14px] ${accentBarClass(card.accent)}`}
      aria-hidden
    />
  );
  const accentStripBottom = (
    <div
      className={`h-2.5 shrink-0 rounded-b-[14px] ${accentBarClass(card.accent)}`}
      aria-hidden
    />
  );

  const titleLines = card.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const iconBlock = card.icon ? (
    <div
      className={`flex shrink-0 rounded-[10px] ${iconTileClass(card.accent)} ${figmaCentered ? "size-[72px] items-start justify-center p-[15px]" : "size-12 items-center justify-center p-2.5"}`}
    >
      <Media
        image={card.icon}
        width={figmaCentered ? 84 : 56}
        height={figmaCentered ? 84 : 56}
        className={
          figmaCentered ? "size-[42px] object-contain" : "size-7 object-contain"
        }
        sizes={figmaCentered ? "42px" : "48px"}
        preferLargestSource
      />
    </div>
  ) : (
    <div
      className={`shrink-0 rounded-[10px] ${iconTileClass(card.accent)} ${figmaCentered ? "size-[72px]" : "size-12"}`}
      aria-hidden
    />
  );

  const titleEl =
    titleLines.length > 0 ? (
      <h3
        className={
          figmaCentered
            ? "font-sans text-2xl font-semibold leading-[1.1] tracking-tight text-navy"
            : "text-xl font-medium leading-[1.1] tracking-tight text-navy sm:text-2xl"
        }
      >
        {titleLines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </h3>
    ) : null;

  const copyEl =
    card.checklistItems.length > 0 ? <CardChecklist card={card} /> : null;

  const body = figmaCentered ? (
    <div className="flex min-h-[min(432px,100%)] flex-1 flex-col gap-3 p-[34px] pb-[34px]">
      <div className="flex min-w-0 flex-col gap-[34px]">
        {iconBlock}
        {titleEl}
      </div>
      {copyEl}
    </div>
  ) : (
    <div className="flex flex-1 flex-col gap-7 px-7 py-8 sm:gap-[34px] sm:px-[34px] sm:pb-[34px] sm:pt-8">
      {iconBlock}
      <div className="flex min-w-0 flex-col gap-3 sm:gap-6">
        {titleEl}
        {copyEl}
      </div>
    </div>
  );

  const showTopAccent = !figmaCentered && accentPlacement === "top";
  const showBottomAccent =
    figmaCentered || (!figmaCentered && accentPlacement === "bottom");

  return (
    <article
      className={`${REVEAL_ITEM} flex min-w-0 flex-col overflow-hidden rounded-[14px] bg-white ${figmaCentered ? `min-h-[min(432px,100%)] ${CARD_SHADOW_CENTERED}` : `min-h-[min(262px,100%)] ${CARD_SHADOW}`}`}
    >
      {showTopAccent ? accentStripTop : null}
      {body}
      {showBottomAccent ? accentStripBottom : null}
    </article>
  );
}

function SplitPanelLayout({
  section,
  titleLines,
  cards,
}: {
  section: SalonValuePropositionSectionT;
  titleLines: string[];
  cards: SalonValuePropositionSectionT["cards"];
}) {
  return (
    <div className="flex flex-col gap-10 sm:gap-11 lg:gap-[46px]">
      <div className="flex flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:gap-12 xl:gap-14">
        <div
          className={`${REVEAL_ITEM} flex min-w-0 w-full flex-col gap-3.5 lg:max-w-[min(100%,440px)] lg:shrink-0`}
        >
          {section.eyebrow ? (
            <span className="inline-flex h-[42px] w-fit max-w-full items-center rounded-[21px] bg-brand/10 px-[18px] text-base font-medium leading-tight text-brand">
              {section.eyebrow}
            </span>
          ) : null}
          {titleLines.length > 0 ? (
            <h2 className="font-sans text-[32px] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-[40px] sm:leading-[1.1] md:text-[44px] lg:text-[48px] lg:leading-[56px]">
              {titleLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>
          ) : null}
          {section.intro ? (
            <RichText
              html={section.intro}
              className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.6] !prose-p:text-muted [&_p+_p]:mt-3! [&_strong]:font-semibold [&_strong]:text-navy"
            />
          ) : null}
        </div>

        <div
          className={`${REVEAL_ITEM} relative isolate w-full min-w-0 flex-1 overflow-hidden rounded-[14px] bg-gradient-to-b from-brand to-brand-strong lg:max-w-[825px]`}
        >
          {section.visualImage ? (
            <div className="relative flex min-h-[280px] items-center justify-center sm:min-h-[360px] lg:min-h-[460px]">
              <Media
                image={section.visualImage}
                width={1650}
                height={920}
                className="h-auto w-full max-w-full object-contain object-center"
                sizes="(min-width: 1024px) 50vw, 100vw"
                preferLargestSource
              />
            </div>
          ) : (
            <div className="min-h-[200px] lg:min-h-[320px]" aria-hidden />
          )}
        </div>
      </div>

      {cards.length > 0 ? (
        <div className="grid w-full grid-cols-1 gap-6 pt-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-6">
          {cards.map((card, i) => (
            <ValueCard key={`${section.id}-card-${i}`} card={card} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CenteredFooterLayout({
  section,
  titleLines,
  cards,
  lang,
}: {
  section: SalonValuePropositionSectionT;
  titleLines: string[];
  cards: SalonValuePropositionSectionT["cards"];
  lang: Locale;
}) {
  const footerResolved = section.footerCtaLink
    ? resolveLink(section.footerCtaLink, lang)
    : null;
  const footerHref = footerResolved?.href;
  const footerLabel = footerResolved?.label || "";

  const hasFooterCopy = Boolean(section.footerTitle?.trim());
  const hasFooterCta = Boolean(footerHref);
  const showFooterBlock = hasFooterCopy || hasFooterCta;

  const footerIcon = section.footerCtaIcon;
  const footerIconSrc =
    footerIcon != null
      ? getLargestImageUrl(footerIcon) || getImageUrl(footerIcon)
      : "";
  const footerCtaArrow =
    footerIcon && footerIconSrc !== "" ? (
      <Media
        image={footerIcon}
        width={40}
        height={40}
        className="h-8 w-8 shrink-0 object-contain"
        sizes="20px"
        preferLargestSource
      />
    ) : undefined;

  return (
    <div className="flex flex-col items-center gap-10 sm:gap-10 lg:gap-10">
      <div
        className={`${REVEAL_ITEM} flex w-full max-w-[687px] flex-col items-center gap-[27px] text-center`}
      >
        {section.eyebrow ? (
          <span className="inline-flex h-[42px] shrink-0 items-center justify-center rounded-[21px] bg-brand/10 px-3 py-3 text-base font-medium leading-[1.6] text-brand">
            {section.eyebrow}
          </span>
        ) : null}
        <div className="flex w-full flex-col items-center gap-[18px]">
          {titleLines.length > 0 ? (
            <h2 className="font-sans text-[32px] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-[40px] sm:leading-[1.1] md:text-[44px] lg:text-[48px] lg:leading-[56px]">
              {titleLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>
          ) : null}
          {section.intro ? (
            <RichText
              html={section.intro}
              className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-center !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p+_p]:mt-[18px]! [&_strong]:font-semibold [&_strong]:text-navy max-w-[599px]"
            />
          ) : null}
        </div>
      </div>

      {cards.length > 0 ? (
        <div className="flex w-full flex-col items-stretch gap-6 lg:flex-row lg:justify-center lg:gap-6">
          {cards.map((card, i) => (
            <div
              key={`${section.id}-card-${i}`}
              className="w-full max-w-[418px] lg:shrink-0"
            >
              <ValueCard card={card} centeredVariant />
            </div>
          ))}
        </div>
      ) : null}

      {showFooterBlock ? (
        <div
          className={`${REVEAL_ITEM} flex w-full max-w-[418px] flex-col items-center gap-[18px]`}
        >
          {hasFooterCopy ? (
            <p className="text-center font-sans text-xl font-medium leading-[1.1] tracking-tight text-navy sm:text-2xl">
              {section.footerTitle}
            </p>
          ) : null}
          {hasFooterCta ? (
            <div className="flex w-full justify-center">
              <Button
                href={footerHref}
                target={footerResolved?.target}
                variant="ctaBrand"
                ctaSize="promo"
                ctaJustify="between"
                ctaFullWidth
                arrowContent={footerCtaArrow}
              >
                {footerLabel}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function SalonValuePropositionSection({
  section,
  lang,
}: {
  section: SalonValuePropositionSectionT;
  lang: Locale;
}) {
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const cards = section.cards.filter(
    (c) =>
      c.title.trim() ||
      c.icon ||
      c.checklistIcon ||
      c.checklistItems.length > 0,
  );

  const showSplitPanelLayout = Boolean(section.visualImage);

  return (
    <section
      className={`py-16 md:py-24 ${showSplitPanelLayout ? "bg-white" : "bg-surface"}`}
    >
      <Container className="!max-w-[85rem]">
        {showSplitPanelLayout ? (
          <SplitPanelLayout
            section={section}
            titleLines={titleLines}
            cards={cards}
          />
        ) : (
          <CenteredFooterLayout
            section={section}
            titleLines={titleLines}
            cards={cards}
            lang={lang}
          />
        )}
      </Container>
    </section>
  );
}
