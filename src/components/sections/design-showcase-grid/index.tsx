import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { SECTION_SHELL_WHITE } from "@/lib/layout/section-spacing";
import type { Locale } from "@/lib/i18n/locales";
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

/** Figma 346:6074 — plain northeast arrow (brand stroke, no circle). */
function ShowcaseCardArrow({ className = "" }: { className?: string }) {
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
      <path
        d="M11 29L29 11M29 11H19M29 11V21"
        stroke="var(--palette-brand)"
        strokeWidth="2.5"
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
      return "(max-width: 640px) 100vw, min(81.25rem, 100vw)";
    case 2:
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 41rem";
    default:
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw";
  }
}

export function DesignShowcaseGridSection({
  section,
}: {
  section: DesignShowcaseGridSectionT;
  lang: Locale;
}) {
  const cards = section.cards ?? [];
  const cols = section.gridColumns ?? 2;
  const gridClass = gridColsClass(cols);
  const mediaSizes = mediaSizesForCols(cols);

  return (
    <section
      className={`${SECTION_SHELL_WHITE} ${section.whiteBackground ? "bg-white" : ""}`}
      id="design-showcase-grid"
    >
      <Container>
        {(section.title || section.intro) && (
          <header className="mx-auto max-w-4xl text-center">
            {section.title ? (
              <SectionHeading
                as="h2"
                text={section.title}
                className={`${REVEAL_ITEM} text-3xl font-semibold leading-tight text-navy-deep sm:text-4xl lg:text-[48px] lg:leading-[56px]`}
              />
            ) : null}
            {section.intro ? (
              <RichText
                html={section.intro}
                className={`${REVEAL_ITEM} mt-4 text-base leading-relaxed text-muted prose-p:text-base prose-headings:text-muted prose-a:text-brand prose-a:no-underline hover:prose-a:underline`}
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
                    className={`${REVEAL_ITEM} relative w-full overflow-hidden rounded-[6px]`}
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
                    className={`${REVEAL_ITEM} flex w-full items-center justify-between gap-6`}
                  >
                    <div className="min-w-0 flex-1 text-xl font-medium leading-[0.91] text-navy-deep sm:text-2xl">
                      <RichText
                        html={card.titleHtml}
                        className="[&_p]:mb-[5px] [&_p:last-child]:mb-0 prose-p:text-navy-deep prose-p:leading-[0.91] prose-headings:text-navy-deep"
                      />
                    </div>
                    <ShowcaseCardArrow className="h-10 w-10 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </>
              );

              const cardClass = `${REVEAL_ITEM} group flex flex-col gap-6 rounded-[14px] bg-white p-5 shadow-[0px_5px_32px_rgba(67,87,128,0.12)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0px_8px_40px_rgba(67,87,128,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:gap-10 sm:p-6`;

              return (
                <Link
                  key={`${section.id}-card-${index}`}
                  href={card.href}
                  className={cardClass}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        ) : null}

        {/* {footerCtas.length > 0 ? (
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
                  variant="secondary"
                  ctaSize="promo"
                  ctaFullWidth={false}
                  ctaJustify="center"
                  showArrow={false}
                  className="bg-card text-navy-deep shadow-none ring-0 border-0 hover:bg-pill"
                >
                  <span className="inline-flex items-center gap-3 sm:gap-4">
                    <span className="sm:whitespace-nowrap">{label}</span>
                    <ShowcaseCardArrow className="h-10 w-10 shrink-0" />
                  </span>
                </Button>
              );
            })}
          </div>
        ) : null} */}
      </Container>
    </section>
  );
}
