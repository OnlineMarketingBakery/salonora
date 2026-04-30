import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { SalonValueCardAccentT, WhyOwnersChooseSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

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
    <article className={`${REVEAL_ITEM} relative flex w-full min-w-0 items-center pr-[18px]`}>
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
              <h3 className="text-lg font-semibold leading-[1.1] tracking-tight text-navy sm:text-xl">{card.title}</h3>
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

export function WhyOwnersChooseSection({ section, lang }: { section: WhyOwnersChooseSectionT; lang: Locale }) {
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const cards = section.cards.filter((c) => c.title.trim() || c.text.trim() || c.icon);

  const primaryCta = section.ctas[0];
  const ctaLink = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaHref = ctaLink?.href;
  const ctaLabel =
    primaryCta?.text || ctaLink?.label || (ctaHref ? "Lees meer" : "");

  return (
    <section className="bg-white py-16 sm:py-20 md:py-24">
      <Container className="!max-w-[85rem]">
        <div className="flex flex-col items-center gap-10 sm:gap-12">
          <header className={`${REVEAL_ITEM} flex max-w-[min(100%,705px)] flex-col items-center gap-6 text-center`}>
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
              <div className="pointer-events-none absolute -left-24 bottom-0 h-[55%] w-[75%] rounded-full bg-brand/[0.07] blur-3xl" aria-hidden />
              <div className="pointer-events-none absolute -right-16 top-0 h-[45%] w-[60%] rounded-full bg-white/80 blur-3xl" aria-hidden />
              <div className="relative z-10 flex flex-col gap-5">
                {cards.map((card, i) => (
                  <OwnersChooseCard key={`${section.id}-woc-${i}`} card={card} index={i} />
                ))}
              </div>
            </div>

            <div
              className={`${REVEAL_ITEM} relative isolate flex min-h-[min(560px,100%)] flex-col justify-center overflow-hidden rounded-[14px] bg-navy-deep p-8 sm:p-10 lg:min-h-0 lg:p-12`}
            >
              {section.panelImage ? (
                <Media
                  image={section.panelImage}
                  width={1276}
                  height={1336}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  preferLargestSource
                />
              ) : (
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_100%_100%,rgba(57,144,240,0.42)_0%,transparent_55%)]"
                  aria-hidden
                />
              )}
              <div className="relative z-10 flex max-w-[min(100%,376px)] flex-col gap-5 text-white">
                {section.panelTitle ? (
                  <h3 className="text-[28px] font-semibold leading-[1.12] tracking-tight sm:text-[32px] md:text-[34px]">
                    {section.panelTitle}
                  </h3>
                ) : null}
                {section.panelText ? (
                  <RichText
                    html={section.panelText}
                    className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-sm !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-white/95 [&_p+_p]:!mt-3 [&_strong]:font-semibold [&_strong]:text-white"
                  />
                ) : null}
                {ctaHref ? (
                  <Button
                    href={ctaHref}
                    target={ctaLink?.target}
                    variant="ctaBrand"
                    ctaElevation="none"
                    ctaFullWidth={false}
                    className="!h-12 max-w-full self-start whitespace-normal shadow-[0px_6px_10px_rgba(57,144,240,0.54)] sm:whitespace-nowrap"
                    arrowClassName="h-5 w-5"
                  >
                    {ctaLabel}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
