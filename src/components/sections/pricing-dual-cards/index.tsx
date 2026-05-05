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
  "!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-base !prose-p:font-normal !prose-p:leading-relaxed",
  "!prose-p:text-white prose-strong:text-white prose-a:text-white prose-a:underline",
  "[&_p+p]:mt-3",
].join(" ");

const cardDescProse = [
  "!prose-p:mt-0 !prose-p:mb-0 !prose-p:text-base !prose-p:leading-relaxed",
  "!prose-p:text-muted prose-strong:text-navy-deep",
].join(" ");

/** Primary price line — bold navy per Figma reference */
const priceHighlightProse = [
  "!prose-p:my-0 !prose-p:text-xl !prose-p:font-semibold !prose-p:leading-snug",
  "!prose-p:text-navy-deep prose-strong:text-navy-deep",
].join(" ");

const priceSecondaryProse = [
  "!prose-p:my-0 !prose-p:text-sm !prose-p:font-medium !prose-p:leading-relaxed !prose-p:tracking-tight",
  "!prose-p:text-navy-deep prose-strong:text-navy-deep",
].join(" ");

const priceFooterProse = [
  "!prose-p:my-0 !prose-p:text-sm !prose-p:leading-relaxed !prose-p:tracking-tight",
  "!prose-p:text-muted prose-strong:text-navy-deep",
  "[&_p+p]:mt-3",
].join(" ");

/** Figma: radius 20; fill linear 90deg — `--palette-brand` / `--palette-brand-strong` (= #3990F0 / #0569D7). */
const heroShell: CSSProperties = {
  borderRadius: "20px",
  background:
    "linear-gradient(90deg, var(--palette-brand) 0%, var(--palette-brand-strong) 100%)",
};

/** Hero: thin rule between title and intro — opaque white left, fades out ~mid-width */
const heroTitleDivider: CSSProperties = {
  height: "1px",
  backgroundImage:
    "linear-gradient(90deg, rgb(255 255 255 / 0.92) 0%, rgb(255 255 255 / 0.22) 44%, transparent 56%)",
};

const elevatedCardShadow: CSSProperties = {
  boxShadow:
    "0 4px 40px color-mix(in srgb, var(--palette-muted) 13%, transparent)",
};

/** Between header and features — solid muted left, fades out mid-row (aligned via lg subgrid) */
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

/** Title, gradient rule, features — participates in lg row subgrid when wrapped by parent grid */
function PricingCardSync({ card }: { card: PricingDualCardsCardItemT }) {
  const isTinted = card.panel_style === "tinted";
  const pillBg: CSSProperties = {
    backgroundColor: isTinted ? "var(--palette-white)" : "var(--palette-pill)",
  };
  const hasHeader = Boolean(card.title?.trim() || card.description?.trim());
  const features = (card.features ?? []).filter((f) => f.text?.trim());

  return (
    <>
      <div className="flex min-w-0 flex-col gap-3 lg:min-h-0">
        {card.title?.trim() ? (
          <h3 className="max-w-xl font-sans text-2xl font-semibold leading-tight tracking-normal text-navy-deep">
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

      <div className="min-h-px min-w-0 shrink-0 lg:min-h-0">
        {hasHeader ? (
          <div
            className="h-px w-full max-w-xl shrink-0 self-start"
            style={cardIntroDivider}
            aria-hidden
          />
        ) : null}
      </div>

      <div className="min-w-0">
        {features.length > 0 ? (
          <ul className="flex list-none flex-col gap-3 p-0">
            {features.map((f, i) => (
              <li key={i}>
                <div
                  className="inline-flex max-w-full flex-row items-center gap-1.5 rounded-[21px] px-2.5 py-2.5"
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
                  <span className="font-sans text-sm font-normal leading-relaxed text-navy-deep">
                    {f.text?.trim()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}

function PricingCardFooterBlock({
  card,
  lang,
}: {
  card: PricingDualCardsCardItemT;
  lang: Locale;
}) {
  const isTinted = card.panel_style === "tinted";
  const ctas = card.ctas ?? [];
  const primary = ctas[0];
  const link = primary ? resolveLink(primary.url, lang) : null;
  const href = link?.href;
  const label = primary?.text || link?.label || "";
  const ctaVariant = isTinted ? "ctaNavy" : "ctaBrand";

  return (
    <>
      <div className="flex flex-col gap-3">
        {card.price_highlight?.trim() ? (
          <RichText
            html={card.price_highlight}
            className={`max-w-xl ${priceHighlightProse} font-bold text-navy`}
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
          className="mt-2 self-start gap-8"
          arrowClassName="size-[27px] shrink-0"
        >
          {label.trim()}
        </Button>
      ) : null}
    </>
  );
}

function desktopShellTop(card: PricingDualCardsCardItemT): string {
  const tinted = card.panel_style === "tinted";
  return [
    REVEAL_ITEM,
    "flex min-w-0 flex-col gap-6 px-10 pt-10 pb-6 sm:px-12 sm:pt-12 lg:grid lg:grid-rows-subgrid lg:row-span-3 lg:gap-y-6 lg:px-12 lg:pb-6 rounded-t-[20px]",
    tinted ? "bg-card" : "bg-white",
  ].join(" ");
}

function desktopShellBottom(card: PricingDualCardsCardItemT): string {
  const tinted = card.panel_style === "tinted";
  return [
    "flex min-h-0 min-w-0 flex-1 flex-col rounded-b-[20px] px-10 pb-10 pt-6 sm:px-12 sm:pb-12 lg:px-12",
    tinted ? "bg-card" : "bg-white",
  ].join(" ");
}

/** lg only: row-subgrid aligns heading + divider across columns; footers sit outside grid so card heights differ */
function PricingDualCardsDesktopPair({
  cards,
  lang,
}: {
  cards: [PricingDualCardsCardItemT, PricingDualCardsCardItemT];
  lang: Locale;
}) {
  const [a, b] = cards;

  return (
    <div className="hidden lg:flex lg:flex-col lg:gap-0">
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 [grid-template-rows:repeat(3,minmax(0,auto))]">
        <div
          className={desktopShellTop(a)}
          style={a.panel_style === "tinted" ? undefined : elevatedCardShadow}
        >
          <PricingCardSync card={a} />
        </div>
        <div
          className={desktopShellTop(b)}
          style={b.panel_style === "tinted" ? undefined : elevatedCardShadow}
        >
          <PricingCardSync card={b} />
        </div>
      </div>
      <div className="flex flex-row gap-x-6">
        <article
          className={desktopShellBottom(a)}
          style={a.panel_style === "tinted" ? undefined : elevatedCardShadow}
        >
          <PricingCardFooterBlock card={a} lang={lang} />
        </article>
        <article
          className={desktopShellBottom(b)}
          style={b.panel_style === "tinted" ? undefined : elevatedCardShadow}
        >
          <PricingCardFooterBlock card={b} lang={lang} />
        </article>
      </div>
    </div>
  );
}

function PricingPackageCard({
  card,
  lang,
}: {
  card: PricingDualCardsCardItemT;
  lang: Locale;
}) {
  const isTinted = card.panel_style === "tinted";
  const panelBg = isTinted ? "bg-card" : "bg-white";

  return (
    <article
      className={`${REVEAL_ITEM} flex min-h-0 flex-col gap-6 rounded-[20px] p-10 sm:p-12 lg:p-12 ${panelBg}`}
      style={isTinted ? undefined : elevatedCardShadow}
    >
      <PricingCardSync card={card} />

      <div className="mt-auto flex min-h-0 flex-col">
        <PricingCardFooterBlock card={card} lang={lang} />
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
    <section className="relative z-0 overflow-x-clip py-10 sm:py-12 lg:py-14">
      <Container className="relative z-0 flex max-w-360 flex-col gap-6 sm:gap-8">
        {hasIntro ? (
          <div
            className={`${REVEAL_ITEM} relative isolate overflow-hidden rounded-[20px]`}
            style={heroShell}
          >
            {/* Figma ~62% copy / ~38% visual; 48–64px band padding */}
            <div className="grid min-h-0 grid-cols-1 gap-8 px-12 sm:gap-10 lg:min-h-[369px] lg:grid-cols-[1.65fr_1fr] lg:items-stretch lg:gap-12 lg:px-16">
              <div className="relative z-2 flex min-w-0 flex-col gap-5 self-center lg:max-w-xl lg:gap-6 lg:pr-4 xl:max-w-152">
                {section.badge?.trim() ? (
                  <Button
                    type="button"
                    variant="white"
                    className="h-[42px] min-h-[42px] w-fit rounded-full border-0 bg-white px-4 font-sans text-base font-medium leading-relaxed text-navy-deep shadow-none hover:bg-white"
                  >
                    {section.badge.trim()}
                  </Button>
                ) : null}
                <div className="flex flex-col gap-4 lg:gap-5">
                  {section.title?.trim() ? (
                    <h2 className="font-sans text-4xl font-semibold leading-[1.08] tracking-normal text-white sm:text-5xl">
                      {section.title.trim()}
                    </h2>
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
                      className={`max-w-prose ${heroIntroProse} text-white`}
                    />
                  ) : null}
                </div>
              </div>

              {person ? (
                <div className="relative z-1 flex min-h-[260px] w-full items-end justify-center sm:min-h-[300px] lg:min-h-0 lg:justify-end">
                  <Media
                    image={person}
                    width={560}
                    height={720}
                    className="h-auto max-h-[min(100%,420px)] w-full max-w-[min(100%,380px)] object-contain object-bottom sm:max-h-[min(100%,460px)] sm:max-w-[400px] lg:max-h-full lg:max-w-[min(100%,420px)] lg:translate-y-1px"
                    sizes="(min-width: 1024px) 420px, min(380px, 100vw)"
                    preferLargestSource
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {cards.length > 0 ? (
          cards.length === 2 ? (
            <>
              <div className="grid grid-cols-1 gap-6 lg:hidden">
                <PricingPackageCard card={cards[0]} lang={lang} />
                <PricingPackageCard card={cards[1]} lang={lang} />
              </div>
              <PricingDualCardsDesktopPair
                cards={[cards[0], cards[1]]}
                lang={lang}
              />
            </>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-6">
              {cards.map((card, i) => (
                <PricingPackageCard key={i} card={card} lang={lang} />
              ))}
            </div>
          )
        ) : null}
      </Container>
    </section>
  );
}
