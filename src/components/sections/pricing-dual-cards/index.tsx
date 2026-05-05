import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { PricingDualCardsCardItemT, PricingDualCardsSectionT } from "@/types/sections";
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

const priceHighlightProse = [
  "!prose-p:my-0 !prose-p:text-xl !prose-p:font-medium !prose-p:leading-snug",
  "!prose-p:text-accent prose-strong:text-accent",
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

const heroShell: CSSProperties = {
  borderRadius: "20px",
  background:
    "linear-gradient(180deg, var(--palette-brand) 0%, color-mix(in srgb, var(--palette-brand) 42%, var(--palette-accent)) 100%)",
};

const elevatedCardShadow: CSSProperties = {
  boxShadow: "0 4px 40px color-mix(in srgb, var(--palette-muted) 13%, transparent)",
};

const heroRule: CSSProperties = {
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderColor: "color-mix(in srgb, var(--palette-white) 42%, transparent)",
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
      className={`${REVEAL_ITEM} flex min-h-0 flex-col rounded-[20px] p-8 sm:p-10 lg:p-12 ${panelBg}`}
      style={isTinted ? undefined : elevatedCardShadow}
    >
      <div className="flex w-full min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            {card.title?.trim() ? (
              <h3 className="max-w-lg font-sans text-2xl font-semibold leading-tight tracking-normal text-navy-deep">
                {card.title.trim()}
              </h3>
            ) : null}
            {card.description?.trim() ? (
              <RichText html={card.description} className={`max-w-xl ${cardDescProse}`} />
            ) : null}
          </div>
          {card.title?.trim() || card.description?.trim() ? (
            <div className="w-full max-w-[33.875rem]" style={heroRule} aria-hidden />
          ) : null}
        </div>

        {features.length > 0 ? (
          <ul className="flex list-none flex-col gap-3 p-0">
            {features.map((f, i) => (
              <li key={i}>
                <div
                  className="inline-flex max-w-full flex-row items-center gap-1.5 rounded-[21px] px-2.5 py-2"
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
            className="mt-2 w-fit min-w-[13.875rem] gap-8 sm:w-auto"
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
  const hasIntro =
    Boolean(section.badge?.trim()) || Boolean(section.title?.trim()) || Boolean(section.intro?.trim());
  const cards = (section.cards ?? []).filter(cardHasBody);

  if (!hasIntro && !cards.length) {
    return null;
  }

  return (
    <section className="py-10 sm:py-12 lg:py-14">
      <Container className="flex max-w-[90rem] flex-col gap-6 sm:gap-8">
        {hasIntro ? (
          <div className={`${REVEAL_ITEM} px-8 py-12 sm:px-12 sm:py-14 lg:px-16 lg:py-16`} style={heroShell}>
            <div className="flex max-w-xl flex-col gap-5">
              {section.badge?.trim() ? (
                <Button
                  type="button"
                  variant="white"
                  className="h-[42px] min-h-[42px] w-fit rounded-[21px] border-0 px-4 font-sans text-base font-medium leading-relaxed text-brand shadow-none hover:bg-white"
                >
                  {section.badge.trim()}
                </Button>
              ) : null}
              <div className="flex flex-col gap-4">
                {section.title?.trim() ? (
                  <h2 className="font-sans text-4xl font-semibold leading-tight text-white sm:text-5xl sm:leading-tight">
                    {section.title.trim()}
                  </h2>
                ) : null}
                {section.title?.trim() ? <div className="w-full max-w-[35.5rem]" style={heroRule} aria-hidden /> : null}
                {section.intro?.trim() ? (
                  <RichText html={section.intro} className={`max-w-none ${heroIntroProse}`} />
                ) : null}
              </div>
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
