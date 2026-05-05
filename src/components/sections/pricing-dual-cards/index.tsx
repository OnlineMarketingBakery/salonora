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

const elevatedCardShadow: CSSProperties = {
  boxShadow:
    "0 4px 40px color-mix(in srgb, var(--palette-muted) 13%, transparent)",
};

const cardRule: CSSProperties = {
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderColor: "color-mix(in srgb, var(--palette-muted) 28%, transparent)",
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
              <RichText
                html={card.description}
                className={`max-w-xl ${cardDescProse}`}
              />
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
                  <span className="font-sans text-sm font-normal leading-relaxed text-navy-deep">
                    {f.text?.trim()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-col gap-3">
          {card.price_highlight?.trim() ? (
            <RichText
              html={card.price_highlight}
              className={`max-w-xl ${priceHighlightProse}`}
            />
          ) : null}
          {card.price_secondary?.trim() ? (
            <RichText
              html={card.price_secondary}
              className={`max-w-xl ${priceSecondaryProse}`}
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
    <section className="relative z-0 overflow-x-clip py-10 sm:py-12 lg:py-14">
      <Container className="relative z-0 flex max-w-[90rem] flex-col gap-6 sm:gap-8">
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
                  {section.intro?.trim() ? (
                    <RichText
                      html={section.intro}
                      className={`max-w-prose ${heroIntroProse}`}
                    />
                  ) : null}
                </div>
              </div>

              {person ? (
                <div className="relative z-[1] flex min-h-[260px] w-full items-end justify-center sm:min-h-[300px] lg:min-h-0 lg:justify-end">
                  <Media
                    image={person}
                    width={560}
                    height={720}
                    className="h-auto max-h-[min(100%,420px)] w-full max-w-[min(100%,380px)] object-contain object-bottom sm:max-h-[min(100%,460px)] sm:max-w-[400px] lg:max-h-full lg:max-w-[min(100%,420px)] lg:translate-y-[1px]"
                    sizes="(min-width: 1024px) 420px, min(380px, 100vw)"
                    preferLargestSource
                  />
                </div>
              ) : null}
            </div>
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
