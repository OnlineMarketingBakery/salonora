import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type {
  DesignShowcaseGridCardTint,
  DesignShowcaseGridSectionT,
} from "@/types/sections";
import Link from "next/link";

const PANEL_BG: Record<DesignShowcaseGridCardTint, string> = {
  surface: "var(--palette-surface)",
  blush: "var(--palette-showcase-blush)",
  mint: "var(--palette-showcase-mint)",
  gold: "var(--palette-showcase-gold-wash)",
};

/** Figma-style circular outline + northeast arrow (uses palette vars, not button CTA asset). */
function ShowcaseCardCornerArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="var(--palette-brand)"
        strokeOpacity={0.35}
        strokeWidth="1.5"
      />
      <path
        d="M14 26L24 16M24 16H17M24 16V23"
        stroke="var(--palette-navy-deep)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function gridColsClass(cols: 1 | 2 | 3): string {
  switch (cols) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    default:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }
}

function mediaSizesForCols(cols: 1 | 2 | 3): string {
  switch (cols) {
    case 1:
      return "(max-width: 640px) 100vw, min(82rem, 100vw)";
    case 2:
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 41rem";
    default:
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw";
  }
}

export function DesignShowcaseGridSection({
  section,
  lang,
}: {
  section: DesignShowcaseGridSectionT;
  lang: Locale;
}) {
  const cards = section.cards ?? [];
  const footerCtas = section.footerCtas ?? [];
  const cols = section.gridColumns ?? 2;
  const gridClass = gridColsClass(cols);
  const mediaSizes = mediaSizesForCols(cols);

  return (
    <section
      className={`py-16 md:py-24 ${section.whiteBackground ? "bg-white" : ""}`}
    >
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
          <div className={`mt-12 grid ${gridClass} gap-6 sm:gap-7 lg:gap-8`}>
            {cards.map((card, index) => {
              const tint = card.panelTint ?? "surface";
              const bg = PANEL_BG[tint];
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
                        sizes={mediaSizes}
                        preferLargestSource
                        className="object-contain object-center"
                      />
                    ) : null}
                  </div>
                  <div
                    className={`${REVEAL_ITEM} mt-10 flex items-end justify-between gap-6`}
                  >
                    <div className="min-w-0 flex-1 text-2xl font-medium leading-snug text-navy-deep">
                      <RichText
                        html={card.titleHtml}
                        className="[&_p]:mb-1 [&_p:last-child]:mb-0 prose-p:text-navy-deep prose-headings:text-navy-deep"
                      />
                    </div>
                    <ShowcaseCardCornerArrow className="h-10 w-10 shrink-0" />
                  </div>
                </>
              );

              const cardClass = `${REVEAL_ITEM} flex flex-col rounded-2xl bg-white p-6 shadow-lg`;

              return (
                <Link
                  key={`${section.id}-card-${index}`}
                  href={card.href}
                  className={`${cardClass} transition-opacity hover:opacity-95`}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        ) : null}

        {footerCtas.length > 0 ? (
          <div
            className={`${REVEAL_ITEM} mt-12 flex flex-wrap items-center justify-center gap-4`}
          >
            {footerCtas.map((cta, i) => {
              const r = resolveLink(cta.url, lang);
              if (!r?.href) return null;
              const label = cta.text || r.label;
              return (
                <Button
                  key={`${section.id}-footer-${i}`}
                  href={r.href}
                  target={r.target}
                  variant="ctaNavy"
                  ctaSize="promo"
                  ctaFullWidth={false}
                  ctaJustify="center"
                  showArrow={false}
                  className="bg-card text-navy-deep shadow-none ring-0 border-0 hover:bg-pill"
                >
                  <span className="inline-flex items-center gap-3 sm:gap-4">
                    <span className="sm:whitespace-nowrap">{label}</span>
                    <ShowcaseCardCornerArrow className="h-10 w-10 shrink-0" />
                  </span>
                </Button>
              );
            })}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
