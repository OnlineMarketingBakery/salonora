import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { formatHeadingCase, formatHeadingLines } from "@/lib/i18n/format-heading";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import {
  SECTION_SHELL_SALON_VALUE_FEATURED,
  SECTION_SHELL_SALON_VALUE_SIMPLE,
} from "@/lib/layout/section-spacing";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import { getImageUrl, getLargestImageUrl } from "@/lib/utils/media";
import { stripTags } from "@/lib/utils/strings";
import type {
  SalonValueAccentPlacementT,
  SalonValueCardAccentT,
  SalonValueCardT,
  SalonValuePropositionSectionT,
} from "@/types/sections";

const CARD_SHADOW = "shadow-[0px_11px_12px_rgba(67,87,128,0.09)]";
const CARD_SHADOW_CENTERED = "shadow-[0px_2px_12px_rgba(67,87,128,0.12)]";

function accentBarClass(accent: SalonValueCardAccentT) {
  return accent === "rose" ? "bg-rose" : "bg-brand";
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

type SalonValueCardMode =
  | "simple"
  | "featured_compact"
  | "featured_centered";

function cardHasVisibleBody(html: string): boolean {
  return stripTags(html).length > 0;
}

function ValueCard({
  card,
  cardMode,
  accentPlacement = "bottom",
}: {
  card: SalonValuePropositionSectionT["cards"][number];
  cardMode: SalonValueCardMode;
  accentPlacement?: SalonValueAccentPlacementT;
}) {
  const figmaCentered = cardMode === "featured_centered";
  const isSimple = cardMode === "simple";

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

  const titleLines = formatHeadingLines(card.title ?? "");

  const iconBlock = card.icon ? (
    <Media
      image={card.icon}
      width={112}
      height={112}
      className="size-14 shrink-0 object-contain"
      sizes="56px"
      preferLargestSource
    />
  ) : (
    <div className="size-14 shrink-0" aria-hidden />
  );

  const titleEl =
    titleLines.length > 0 ? (
      <h3
        className={
          figmaCentered
            ? "font-sans text-[24px] font-semibold leading-[26px] text-navy"
            : "text-xl font-medium leading-[1.1] text-navy sm:text-2xl"
        }
      >
        {figmaCentered ? (
          titleLines.join(" ")
        ) : (
          titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))
        )}
      </h3>
    ) : null;

  const hasBody = cardHasVisibleBody(card.body);
  const copyEl = isSimple ? (
    hasBody ? (
      <RichText
        html={card.body}
        className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p+_p]:mt-3! [&_strong]:font-semibold [&_strong]:text-navy"
      />
    ) : card.checklistItems.length > 0 ? (
      <CardChecklist card={card} />
    ) : null
  ) : card.checklistItems.length > 0 ? (
    <CardChecklist card={card} />
  ) : hasBody ? (
    <RichText
      html={card.body}
      className={
        figmaCentered
          ? "!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p+_p]:mt-3! [&_strong]:font-semibold [&_strong]:text-navy"
          : "!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.6] !prose-p:text-muted [&_p+_p]:mt-3! [&_strong]:font-semibold [&_strong]:text-navy"
      }
    />
  ) : null;

  const body = figmaCentered ? (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-[34px] pb-[34px]">
      <div className="flex shrink-0 min-w-0 flex-col gap-5">
        {iconBlock}
        {titleEl}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{copyEl}</div>
    </div>
  ) : (
    <div className="flex min-h-0 flex-1 flex-col gap-5 px-6 py-6 sm:gap-7 sm:px-7 sm:pb-7 sm:pt-7">
      {iconBlock}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 sm:gap-6">
        {titleEl}
        {copyEl}
      </div>
    </div>
  );

  const showTopAccent = accentPlacement === "top";
  const showBottomAccent = accentPlacement === "bottom";

  return (
    <article
      className={`${REVEAL_ITEM} flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[14px] bg-white ${figmaCentered ? CARD_SHADOW_CENTERED : `min-h-[min(262px,100%)] ${CARD_SHADOW}`}`}
    >
      {showTopAccent ? accentStripTop : null}
      {body}
      {showBottomAccent ? accentStripBottom : null}
    </article>
  );
}

function SimpleCardsLayout({
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
      <div
        className={`${REVEAL_ITEM} mx-auto flex w-full max-w-[720px] flex-col items-center gap-4 text-center sm:gap-5`}
      >
        {titleLines.length > 0 ? (
          <h2 className="font-sans text-[32px] font-semibold leading-tight text-navy sm:text-[40px] sm:leading-[1.1] md:text-[44px] lg:text-[48px] lg:leading-[56px]">
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
            className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-center !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.6] !prose-p:text-muted [&_p+_p]:mt-3! [&_strong]:font-semibold [&_strong]:text-navy"
          />
        ) : null}
      </div>

      {cards.length > 0 ? (
        <div className="grid w-full grid-cols-1 items-stretch gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-6">
          {cards.map((card, i) => (
            <ValueCard
              key={`${section.id}-simple-card-${i}`}
              card={card}
              cardMode="simple"
              accentPlacement={section.cardAccentPlacement}
            />
          ))}
        </div>
      ) : null}
    </div>
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
            <h2 className="font-sans text-[32px] font-semibold leading-tight text-navy sm:text-[40px] sm:leading-[1.1] md:text-[44px] lg:text-[48px] lg:leading-[56px]">
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
          className={`${REVEAL_ITEM} relative isolate w-full min-w-0 flex-1 overflow-hidden rounded-[14px] lg:max-w-[825px] ${
            section.visualImage
              ? ""
              : "bg-gradient-to-b from-brand to-brand-strong"
          }`}
        >
          {section.visualImage ? (
            <div className="relative aspect-[165/92] w-full min-h-[280px] sm:min-h-[360px] lg:aspect-auto lg:min-h-[460px]">
              <Media
                image={section.visualImage}
                width={1650}
                height={920}
                className="absolute inset-0 h-full w-full object-cover object-bottom"
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
        <div className="grid w-full grid-cols-1 items-stretch gap-6 pt-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-6">
          {cards.map((card, i) => (
            <ValueCard
              key={`${section.id}-card-${i}`}
              card={card}
              cardMode="featured_compact"
              accentPlacement={section.cardAccentPlacement}
            />
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
  const titleText = titleLines.join(" ");
  const footerResolved = section.footerCtaLink
    ? resolveLink(section.footerCtaLink, lang)
    : null;
  const footerHref = footerResolved?.href;
  const footerLabel = footerResolved?.label || "";

  const hasFooterCopy = Boolean(section.footerTitle?.trim());
  const hasFooterCta = Boolean(footerHref);
  const showFooterBlock = hasFooterCopy || hasFooterCta;

  return (
    <div className="flex flex-col items-center gap-10 sm:gap-10 lg:gap-10">
      <div
        className={`${REVEAL_ITEM} flex w-full max-w-[755px] flex-col items-center gap-[18px] text-center`}
      >
        {section.eyebrow ? (
          <span className="inline-flex h-[42px] shrink-0 items-center justify-center rounded-[21px] bg-brand/10 px-3 py-3 text-base font-medium leading-[1.6] text-brand">
            {section.eyebrow}
          </span>
        ) : null}
        <div className="flex w-full flex-col items-center gap-[18px]">
          {titleText ? (
            <h2 className="w-full min-w-0 font-sans text-[32px] font-semibold leading-tight text-navy sm:text-[40px] sm:leading-[48px] md:text-[48px] md:leading-[56px] md:whitespace-nowrap">
              {titleText}
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
        <div className="flex w-full flex-col items-stretch gap-6 lg:flex-row lg:items-stretch lg:justify-center lg:gap-6">
          {cards.map((card, i) => (
            <div
              key={`${section.id}-card-${i}`}
              className="flex min-h-0 w-full max-w-[418px] flex-col lg:shrink-0"
            >
              <ValueCard
                card={card}
                cardMode="featured_centered"
                accentPlacement={section.cardAccentPlacement}
              />
            </div>
          ))}
        </div>
      ) : null}

      {showFooterBlock ? (
        <div
          className={`${REVEAL_ITEM} flex w-full flex-col items-center gap-6 px-2 sm:px-0`}
        >
          {hasFooterCopy ? (
            <p className="max-w-none text-center font-sans text-[24px] font-semibold leading-[26px] text-navy">
              {formatHeadingCase(section.footerTitle ?? "")}
            </p>
          ) : null}
          {hasFooterCta ? (
            <Button
              href={footerHref}
              target={footerResolved?.target}
              variant="ctaBrand"
              ctaSize="compact"
              ctaJustify="center"
              ctaFullWidth={false}
              ctaElevation="none"
              showArrow={false}
              leadingContent={
                section.footerCtaIcon ? (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white p-1.5 sm:size-10 sm:p-1.5">
                    <Media
                      image={section.footerCtaIcon}
                      width={44}
                      height={44}
                      className="size-full object-contain"
                      sizes="44px"
                      preferLargestSource
                    />
                  </span>
                ) : undefined
              }
              className="!h-[56px] !min-h-[56px] max-w-full shrink-0 !rounded-full border-2 border-brand/35 !bg-gradient-to-b !from-brand !to-brand-strong !px-4 !pl-4 !pr-5 text-base shadow-[0px_6px_20px_rgba(57,144,240,0.45)] sm:!h-[63px] sm:!min-h-[63px] sm:text-[20px]"
            >
              {formatHeadingCase(footerLabel)}
            </Button>
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
  const titleLines = formatHeadingLines(section.title ?? "");

  const cards = section.cards.filter((c) => {
    const hasCopy =
      cardHasVisibleBody(c.body) || c.checklistItems.length > 0;
    return Boolean(
      c.title.trim() || c.icon || c.checklistIcon || hasCopy,
    );
  });

  const showSplitPanelLayout = Boolean(section.visualImage);
  /** WP may keep `simple` while a visual is set — use the featured split panel so EN/NL match Figma. */
  const isSimpleLayout =
    section.sectionLayout === "simple" && !showSplitPanelLayout;
  const sectionSurfaceClass = section.whiteBackground
    ? "bg-white"
    : isSimpleLayout
      ? "bg-surface"
      : showSplitPanelLayout
        ? "bg-white"
        : "bg-surface";

  if (isSimpleLayout) {
    return (
      <section className={`${SECTION_SHELL_SALON_VALUE_SIMPLE} ${sectionSurfaceClass}`}>
        <Container>
          <SimpleCardsLayout
            section={section}
            titleLines={titleLines}
            cards={cards}
          />
        </Container>
      </section>
    );
  }

  return (
    <section className={`${SECTION_SHELL_SALON_VALUE_FEATURED} ${sectionSurfaceClass}`}>
      <Container>
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
