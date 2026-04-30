import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { SalonValueCardAccentT, SalonValuePropositionSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const CARD_SHADOW = "shadow-[0px_11px_12px_rgba(67,87,128,0.09)]";

function accentBarClass(accent: SalonValueCardAccentT) {
  return accent === "rose" ? "bg-[#d27e91]" : "bg-brand";
}

function iconTileClass(accent: SalonValueCardAccentT) {
  return accent === "rose" ? "bg-[#ca7c90]" : "bg-[#398ce9]";
}

function ValueCard({ card }: { card: SalonValuePropositionSectionT["cards"][number] }) {
  return (
    <article
      className={`${REVEAL_ITEM} flex min-h-[min(262px,100%)] min-w-0 flex-col overflow-hidden rounded-[14px] bg-white ${CARD_SHADOW}`}
    >
      <div className={`h-2.5 shrink-0 rounded-t-[14px] ${accentBarClass(card.accent)}`} aria-hidden />
      <div className="flex flex-col gap-7 px-7 py-8 sm:gap-[34px] sm:px-[34px] sm:pb-[34px] sm:pt-8">
        {card.icon ? (
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-[10px] p-2.5 ${iconTileClass(card.accent)}`}
          >
            <Media
              image={card.icon}
              width={56}
              height={56}
              className="size-7 object-contain"
              sizes="48px"
              preferLargestSource
            />
          </div>
        ) : (
          <div className={`size-12 shrink-0 rounded-[10px] ${iconTileClass(card.accent)}`} aria-hidden />
        )}
        <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
          {card.title ? (
            <h3 className="text-xl font-medium leading-[1.1] tracking-tight text-navy sm:text-2xl">{card.title}</h3>
          ) : null}
          {card.text ? (
            <RichText
              html={card.text}
              className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p+_p]:!mt-3 [&_strong]:font-semibold [&_strong]:text-navy"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function SalonValuePropositionSection({ section }: { section: SalonValuePropositionSectionT; lang: Locale }) {
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const cards = section.cards.filter((c) => c.title.trim() || c.text.trim() || c.icon);

  return (
    <section className="bg-white py-16 sm:py-20 md:py-24">
      <Container className="!max-w-[85rem]">
        <div className="flex flex-col gap-10 sm:gap-11 lg:gap-[46px]">
          <div className="flex flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:gap-12 xl:gap-14">
            <div className={`${REVEAL_ITEM} flex min-w-0 w-full flex-col gap-3.5 lg:max-w-[min(100%,440px)] lg:shrink-0`}>
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
                  className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.6] !prose-p:text-muted [&_p+_p]:!mt-3 [&_strong]:font-semibold [&_strong]:text-navy"
                />
              ) : null}
            </div>

            <div
              className={`${REVEAL_ITEM} relative isolate w-full min-w-0 flex-1 overflow-hidden rounded-[14px] bg-gradient-to-b from-brand to-[#0569d7] lg:max-w-[825px]`}
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
      </Container>
    </section>
  );
}
