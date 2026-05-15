import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type {
  SalonValueCardAccentT,
  WhyOwnersChooseSectionT,
} from "@/types/sections";
import Image from "next/image";
import type { CSSProperties } from "react";

/** Figma 597:6058 — base fill inside mask group (638×668). */
const panelBaseGradient: CSSProperties = {
  backgroundImage: [
    "radial-gradient(ellipse 95% 80% at 68% 92%, color-mix(in srgb, var(--palette-brand) 38%, transparent) 0%, transparent 58%)",
    "linear-gradient(180deg, var(--palette-navy-deep) 0%, color-mix(in srgb, var(--palette-navy-deep) 78%, var(--palette-navy)) 40%, color-mix(in srgb, var(--palette-navy) 60%, var(--palette-brand-strong)) 100%)",
  ].join(", "),
};

/** Figma 597:6059 — Ellipse 1996 glow (348×348, inset -62% in Dev Mode). */
const portraitHaloGradient: CSSProperties = {
  backgroundImage: [
    "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--palette-brand) 68%, transparent) 0%, color-mix(in srgb, var(--palette-brand) 28%, transparent) 38%, transparent 68%)",
  ].join(", "),
};

/** Figma 597:6060 — Ellipse 1995 arc + white rim (757×757). */
const PANEL_ARC_ELLIPSE_SRC = "/partner-intro-ellipse.svg";

function accentBarClass(accent: SalonValueCardAccentT) {
  return accent === "rose" ? "bg-[#d27e91]" : "bg-[#3990f0]";
}

function iconTileClass(accent: SalonValueCardAccentT) {
  return accent === "rose" ? "bg-[#d27e91]" : "bg-[#398ce9]";
}

function OwnersChooseCard({
  card,
  index,
}: {
  card: WhyOwnersChooseSectionT["cards"][number];
  index: number;
}) {
  const solidEmphasis = index === 1;
  const surfaceClass = solidEmphasis
    ? "bg-white shadow-[0px_6px_24px_rgba(21,41,81,0.24)]"
    : "border border-white/50 bg-gradient-to-b from-white to-white/[0.4] backdrop-blur-[11px]";

  return (
    <article
      className={`${REVEAL_ITEM} relative flex w-full min-w-0 items-center pr-[18px]`}
    >
      <div
        className={`mr-[-18px] h-[85px] w-[23px] shrink-0 rounded-[10px] ${accentBarClass(card.accent)}`}
        aria-hidden
      />
      <div
        className={`mr-[-18px] flex min-h-[127px] min-w-0 flex-1 flex-col justify-center gap-2.5 rounded-[10px] p-6 sm:p-6 ${surfaceClass}`}
      >
        <div className="flex min-w-0 items-center gap-5">
          <div
            className={`flex size-[62px] shrink-0 items-center justify-center rounded-[10px] p-4 ${iconTileClass(card.accent)}`}
          >
            {card.icon ? (
              <Media
                image={card.icon}
                width={64}
                height={64}
                className="size-[30px] object-contain"
                sizes="48px"
                preferLargestSource
              />
            ) : null}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {card.title ? (
              <h3 className="text-lg font-semibold leading-[1.1] tracking-tight text-navy sm:text-xl">
                {card.title}
              </h3>
            ) : null}
            {card.text ? (
              <RichText
                html={card.text}
                className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-sm !prose-p:font-normal !prose-p:leading-[1.33] !prose-p:text-muted [&_p+_p]:!mt-2 [&_strong]:font-semibold [&_strong]:text-navy"
              />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function WhyOwnersChoosePanelBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0" style={panelBaseGradient} />
      {/* Figma 597:6059 — x=146 y=154, 348×348 */}
      <div className="absolute left-[22.88%] top-[23.05%] aspect-square w-[54.55%] max-w-[348px]">
        <div
          className="absolute inset-[-62%] rounded-full"
          style={portraitHaloGradient}
        />
      </div>
      {/* Figma 597:6060 — x=62 y=305, 757×757 */}
      <div className="absolute left-[9.72%] top-[60%] aspect-square w-[118.68%] max-w-[757px]">
        <Image
          src={PANEL_ARC_ELLIPSE_SRC}
          alt=""
          width={757}
          height={757}
          unoptimized
          className="block size-full max-h-[757px] max-w-[757px] select-none object-contain opacity-95"
          draggable={false}
        />
      </div>
    </div>
  );
}

export function WhyOwnersChooseSection({
  section,
  lang,
}: {
  section: WhyOwnersChooseSectionT;
  lang: Locale;
}) {
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const cards = section.cards.filter(
    (c) => c.title.trim() || c.text.trim() || c.icon,
  );

  const primaryCta = section.ctas[0];
  const ctaLink = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaHref = ctaLink?.href;
  const ctaLabel =
    primaryCta?.text || ctaLink?.label || (ctaHref ? "Lees meer" : "");

  return (
    <section className="bg-white py-16 sm:py-20 md:py-24">
      <Container className="!max-w-[85rem]">
        <div className="flex flex-col items-center gap-10 sm:gap-12">
          <header
            className={`${REVEAL_ITEM} flex max-w-[min(100%,705px)] flex-col items-center gap-6 text-center`}
          >
            {section.eyebrow ? (
              <span className="inline-flex h-[42px] max-w-full items-center justify-center rounded-[21px] bg-brand/10 px-6 text-base font-medium leading-tight text-brand">
                {section.eyebrow}
              </span>
            ) : null}
            {titleLines.length > 0 ? (
              <h2 className="font-sans text-[32px] font-semibold leading-tight tracking-[-0.04em] text-navy-deep sm:text-[40px] sm:leading-[1.1] md:text-[44px] lg:text-[48px] lg:leading-[56px]">
                {titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            ) : null}
          </header>

          <div className="grid w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
            <div
              className={`${REVEAL_ITEM} relative isolate min-h-[min(560px,100%)] overflow-hidden rounded-[14px] bg-[#ebf3fe] p-6 sm:p-10 lg:p-12`}
            >
              <div
                className="pointer-events-none absolute -left-24 bottom-0 h-[55%] w-[75%] rounded-full bg-brand/[0.07] blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-16 top-0 h-[45%] w-[60%] rounded-full bg-white/80 blur-3xl"
                aria-hidden
              />
              <div className="relative z-10 flex flex-col gap-5">
                {cards.map((card, i) => (
                  <OwnersChooseCard
                    key={`${section.id}-woc-${i}`}
                    card={card}
                    index={i}
                  />
                ))}
              </div>
            </div>

            {/* Figma Frame 2147229423 (597:6055): 638×668, copy inset 48px */}
            <div
              className={`${REVEAL_ITEM} relative isolate flex min-h-[min(560px,100%)] flex-col overflow-hidden rounded-[14px] px-8 pt-8 sm:px-10 sm:pt-10 lg:min-h-[668px] lg:px-12 lg:pt-12`}
            >
              <WhyOwnersChoosePanelBackdrop />
              {section.panelImage ? (
                <div className="pointer-events-none absolute bottom-[-10%] right-0 z-[2] h-[min(78%,520px)] w-[min(58%,360px)] sm:w-[min(56%,400px)] lg:h-[min(82%,548px)] lg:w-[min(54%,420px)]">
                  <Media
                    image={section.panelImage}
                    width={638}
                    height={668}
                    className="h-full w-full object-contain object-bottom object-right"
                    sizes="(min-width: 1024px) 28vw, 58vw"
                    preferLargestSource
                  />
                </div>
              ) : null}
              <div className="relative z-10 flex w-full max-w-[376px] shrink-0 flex-col">
                <div className="flex flex-col gap-5">
                  {section.panelTitle ? (
                    <h3 className="text-[34px] font-semibold leading-[1.12] tracking-tight text-white">
                      {section.panelTitle}
                    </h3>
                  ) : null}
                  {section.panelText ? (
                    <RichText
                      html={section.panelText}
                      className="max-w-[337px] !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-[14px] !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-white [&_p+_p]:!mt-0 [&_strong]:font-semibold [&_strong]:text-white text-white"
                    />
                  ) : null}
                </div>
                {ctaHref ? (
                  <div className="mt-5">
                    <Button
                      href={ctaHref}
                      target={ctaLink?.target}
                      variant="ctaBrand"
                      ctaElevation="none"
                      ctaFullWidth={false}
                      className="!h-12 !min-h-12 !w-[196px] !min-w-[196px] !max-w-[196px] shrink-0 !rounded-[24px] !px-[17px] !text-base !font-normal whitespace-nowrap shadow-[0px_6px_10px_color-mix(in_srgb,var(--palette-brand)_54%,transparent)]"
                      arrowClassName="!size-5"
                    >
                      {ctaLabel}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
