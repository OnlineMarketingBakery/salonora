import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { ArrowInCircle } from "@/components/ui/ArrowInCircle";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { resolveLink } from "@/lib/utils/links";
import type { DesignShowcaseGridCardTint, DesignShowcaseGridSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const PANEL_BG: Record<DesignShowcaseGridCardTint, string> = {
  surface: "var(--palette-surface)",
  blush: "var(--palette-showcase-blush)",
  mint: "var(--palette-showcase-mint)",
  gold: "var(--palette-showcase-gold-wash)",
};

export function DesignShowcaseGridSection({
  section,
  lang,
}: {
  section: DesignShowcaseGridSectionT;
  lang: Locale;
}) {
  const cards = section.cards ?? [];
  const footerCtas = section.footerCtas ?? [];

  return (
    <section className="py-16 md:py-24">
      <Container>
        {(section.title || section.intro) && (
          <header className="mx-auto max-w-4xl text-center">
            {section.title ? (
              <h2
                className={`${REVEAL_ITEM} text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy-deep sm:text-4xl lg:text-[48px] lg:leading-[56px]`}
              >
                {section.title}
              </h2>
            ) : null}
            {section.intro ? (
              <RichText
                html={section.intro}
                className={`${REVEAL_ITEM} mt-4 text-sm leading-relaxed text-muted prose-headings:text-muted prose-a:text-brand prose-a:no-underline hover:prose-a:underline`}
              />
            ) : null}
          </header>
        )}

        {cards.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {cards.map((card, index) => {
              const tint = card.panelTint ?? "surface";
              const bg = PANEL_BG[tint];
              const resolved = resolveLink(card.link ?? null, lang);
              const inner = (
                <>
                  <div
                    className={`${REVEAL_ITEM} relative w-full overflow-hidden rounded-md`}
                    style={{
                      aspectRatio: "480 / 315",
                      backgroundColor: bg,
                    }}
                  >
                    {card.visual ? (
                      <Media
                        image={card.visual}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        preferLargestSource
                        className="object-contain object-center"
                      />
                    ) : null}
                  </div>
                  <div className={`${REVEAL_ITEM} mt-10 flex items-end justify-between gap-6`}>
                    <div className="min-w-0 flex-1 text-2xl font-medium leading-snug text-navy-deep">
                      {card.titleHtml ? (
                        <RichText
                          html={card.titleHtml}
                          className="[&_p]:mb-1 [&_p:last-child]:mb-0 prose-p:text-navy-deep prose-headings:text-navy-deep"
                        />
                      ) : null}
                    </div>
                    <span className="inline-flex shrink-0" aria-hidden>
                      <ArrowInCircle variant="on-light" className="h-10 w-10" />
                    </span>
                  </div>
                </>
              );

              const cardClass =
                `${REVEAL_ITEM} flex flex-col rounded-2xl bg-white p-6 shadow-lg`;

              if (resolved?.href) {
                return (
                  <Link
                    key={`${section.id}-card-${index}`}
                    href={resolved.href}
                    target={resolved.target}
                    rel={resolved.target === "_blank" ? "noopener noreferrer" : undefined}
                    className={`${cardClass} transition-opacity hover:opacity-95`}
                  >
                    {inner}
                  </Link>
                );
              }

              return (
                <article key={`${section.id}-card-${index}`} className={cardClass}>
                  {inner}
                </article>
              );
            })}
          </div>
        ) : null}

        {footerCtas.length > 0 ? (
          <div className={`${REVEAL_ITEM} mt-12 flex flex-wrap items-center justify-center gap-4`}>
            {footerCtas.map((cta, i) => {
              const r = resolveLink(cta.url, lang);
              if (!r?.href) return null;
              const label = cta.text || r.label;
              return (
                <Button
                  key={`${section.id}-footer-${i}`}
                  href={r.href}
                  target={r.target}
                  variant="ctaWhite"
                  ctaSize="promo"
                  className="bg-pill text-navy-deep shadow-none ring-0 border-0 hover:bg-card"
                >
                  {label}
                </Button>
              );
            })}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
