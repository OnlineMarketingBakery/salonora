import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { PricingDualCardsCardItemT, PricingDualCardsSectionT } from "@/types/sections";
import type { CSSProperties } from "react";

/** Figma Ellipse behind portrait (exported semi-circle). */
const HERO_ELLIPSE_SRC = "/pricing-dual-cards-hero-ellipse.png";

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

/** Lighter blue left → deeper blue right (Figma). */
const heroShell: CSSProperties = {
  borderRadius: "32px",
  background: `linear-gradient(
    90deg,
    var(--palette-brand) 0%,
    color-mix(in srgb, var(--palette-brand) 55%, var(--palette-accent)) 52%,
    color-mix(in srgb, var(--palette-accent) 78%, var(--palette-brand)) 100%
  )`,
};

const elevatedCardShadow: CSSProperties = {
  boxShadow: "0 4px 40px color-mix(in srgb, var(--palette-muted) 13%, transparent)",
};

const cardRule: CSSProperties = {
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderColor: "color-mix(in srgb, var(--palette-muted) 28%, transparent)",
};

/** Semi-circle backdrop: sits behind figure, anchored bottom-right. */
const heroEllipseLayer: CSSProperties = {
  backgroundImage: `url("${HERO_ELLIPSE_SRC}")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center bottom",
  backgroundSize: "contain",
  opacity: 0.75,
  mixBlendMode: "screen",
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

  return (
    <article
      className={`${REVEAL_ITEM} flex min-h-0 flex-col rounded-[20px] p-10 sm:p-12 lg:p-12 ${panelBg}`}
      style={isTinted ? undefined : elevatedCardShadow}
    >
      <div className="flex w-full min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            {card.title?.trim() ? (
              <h3 className="max-w-xl font-sans text-2xl font-semibold leading-tight tracking-normal text-navy-deep">
                {card.title.trim()}
              </h3>
            ) : null}
            {card.description?.trim() ? (
              <RichText html={card.description} className={`max-w-xl ${cardDescProse}`} />
            ) : null}
          </div>
          {card.title?.trim() || card.description?.trim() ? (
            <div className="w-full max-w-xl" style={cardRule} aria-hidden />
          ) : null}
        </div>

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
                  <span className="font-sans text-sm font-normal leading-relaxed text-navy-deep">{f.text?.trim()}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-col gap-3">
          {card.price_highlight?.trim() ? (
            <RichText html={card.price_highlight} className={`max-w-xl ${priceHighlightProse}`} />
          ) : null}
          {card.price_secondary?.trim() ? (
            <RichText html={card.price_secondary} className={`max-w-xl ${priceSecondaryProse}`} />
          ) : null}
          {card.price_footer?.trim() ? (
            <RichText html={card.price_footer} className={`max-w-xl ${priceFooterProse}`} />
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
            className="mt-2 w-fit gap-8 sm:w-auto"
            arrowClassName="size-[27px] shrink-0"
          >
            {label.trim()}
          </Button>
        ) : null}
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
    <section
      className={`overflow-visible pb-10 pt-10 sm:pb-12 sm:pt-12 lg:pb-14 lg:pt-14 ${person ? "lg:pb-16" : ""}`}
    >
      <Container className="relative flex max-w-[90rem] flex-col gap-6 overflow-visible sm:gap-8">
        {hasIntro ? (
          <div
            className={`${REVEAL_ITEM} relative isolate overflow-visible ${person ? "mt-[clamp(-5rem,-10vw,-3rem)] pt-[clamp(5rem,11vw,8.5rem)] lg:mt-[clamp(-6.5rem,-11vw,-4rem)] lg:pt-[clamp(6.5rem,12vw,9rem)]" : ""}`}
          >
            {/* Blue band: copy only; portrait layers above/right and bleeds upward outside this box */}
            <div
              className={`relative z-[1] overflow-visible rounded-[32px] px-8 pb-10 pt-11 sm:px-11 sm:pb-11 sm:pt-12 lg:min-h-[min(320px,42vw)] lg:px-14 lg:pb-14 lg:pt-14 xl:px-16 ${person ? "lg:pr-[min(46%,26rem)]" : ""}`}
              style={heroShell}
            >
              <div className="flex max-w-xl flex-col gap-5 lg:max-w-[26rem] xl:max-w-xl">
                {section.badge?.trim() ? (
                  <Button
                    type="button"
                    variant="white"
                    className="h-[42px] min-h-[42px] w-fit rounded-[21px] border-0 bg-white px-4 font-sans text-base font-medium leading-relaxed text-brand shadow-none hover:bg-white"
                  >
                    {section.badge.trim()}
                  </Button>
                ) : null}
                <div className="flex flex-col gap-4">
                  {section.title?.trim() ? (
                    <h2 className="font-sans text-4xl font-semibold leading-tight tracking-normal text-white sm:text-5xl sm:leading-[1.05]">
                      {section.title.trim()}
                    </h2>
                  ) : null}
                  {section.intro?.trim() ? (
                    <RichText html={section.intro} className={`max-w-none ${heroIntroProse}`} />
                  ) : null}
                </div>
              </div>
            </div>

            {person ? (
              <div
                className="pointer-events-none absolute bottom-0 right-[max(0.75rem,3vw)] z-[3] flex w-[min(92vw,440px)] justify-end overflow-visible sm:right-[max(1rem,4vw)] lg:right-[max(1.25rem,4vw)] lg:w-[min(46vw,480px)] xl:right-[max(2rem,5vw)]"
                style={{
                  height: "clamp(400px, 52vw, 600px)",
                }}
              >
                {/* Semi-circle artwork behind subject — flat edge down */}
                <div
                  className="absolute bottom-[2%] right-[-4%] z-0 h-[78%] w-[118%] max-w-none"
                  style={heroEllipseLayer}
                  aria-hidden
                />

                <div className="relative z-[1] flex h-full w-full items-end justify-end overflow-visible">
                  <Media
                    image={person}
                    width={560}
                    height={720}
                    className="h-[128%] max-h-none w-auto max-w-none -translate-y-[4%] object-contain object-bottom lg:h-[138%] lg:-translate-y-[6%]"
                    sizes="(min-width: 1024px) min(480px, 46vw), min(380px, 92vw)"
                    preferLargestSource
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {cards.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6">
            {cards.map((card, i) => (
              <PricingPackageCard key={i} card={card} lang={lang} />
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
