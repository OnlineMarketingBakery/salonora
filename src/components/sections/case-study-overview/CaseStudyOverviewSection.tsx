/** @see Figma **866:4217** — featured strip right column: title `#1a2b4b` bold, body `#4a5568`, accent `#3182ce`, rules `#cbd5e1`, CTA `#3b82f6` + white disc; single `text-left` axis. */
import { Container } from "@/components/ui/Container";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import type { CaseStudyOverviewSectionT } from "@/types/sections";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

const HERO_BG_SRC = "/feature-highlight-split-hero-bg.png";

const heroBgImageStyle: Pick<CSSProperties, "backgroundImage"> = {
  backgroundImage: `url("${HERO_BG_SRC}")`,
};

const brandColorBlendLayer: CSSProperties = {
  backgroundColor: "var(--palette-brand)",
  mixBlendMode: "color",
};

const COPY = {
  nl: {
    featuredEyebrow: "Uitgelichte casestudy",
    gridHeading: "Recente casestudies",
    readFallback: "Lees de casestudy",
    empty: "Geen casestudies gevonden.",
    prev: "Vorige",
    next: "Volgende",
    paginationNav: "Paginering",
  },
  en: {
    featuredEyebrow: "Featured case study",
    gridHeading: "Recent case studies",
    readFallback: "Read the case study",
    empty: "No case studies found.",
    prev: "Previous",
    next: "Next",
    paginationNav: "Pagination",
  },
} as const;

function caseStudyGridColClass(cols: 1 | 2 | 3 | 4): string {
  switch (cols) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    case 4:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    default:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }
}

/** Case study cards below the hero: fixed 3 columns at `lg` (not tied to hero KPI column setting). */
const CASE_STUDY_LIST_GRID_CLASS = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
const CASE_STUDY_LIST_CARD_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

function listUrl(
  lang: Locale,
  archivePath: string,
  opts: { page?: number; s?: string },
) {
  const base = buildLocalePath(lang, archivePath);
  const p = new URLSearchParams();
  if (opts.s) p.set("s", opts.s);
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  const q = p.toString();
  return q ? `${base}?${q}` : base;
}

function visiblePages(total: number, cur: number): number[] {
  if (total <= 1) return [1];
  const span = Math.min(7, total);
  let start = Math.max(1, cur - 3);
  let end = start + span - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - span + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma grid card — text link + arrow in a thin circular stroke. */
function CaseStudyCardLinkArrow() {
  return (
    <span
      className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border border-[var(--palette-brand)] text-[var(--palette-brand)]"
      aria-hidden
    >
      <ArrowRightIcon className="size-2.5" />
    </span>
  );
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M12 5l-5 5 5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M8 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma featured case study (right column) — inspect-aligned colours + single left axis. */
const FIGMA_TITLE_COLOR = "text-[#1a2b4b]";
const FIGMA_BODY_COLOR = "text-[#4a5568]";
const FIGMA_ACCENT_BLUE = "text-[#3182ce]";
const FIGMA_EYEBROW =
  "text-left text-[13px] font-normal leading-[1.4] text-[#64748b] sm:text-sm";
const FIGMA_METRIC_LABEL = `text-left text-sm font-normal leading-[1.4] ${FIGMA_ACCENT_BLUE} sm:text-[15px] sm:leading-[1.4]`;
const FIGMA_METRIC_VALUE = `text-left text-[1.875rem] font-bold leading-none tracking-[-0.02em] ${FIGMA_TITLE_COLOR} sm:text-[2.125rem] whitespace-nowrap`;
/** Hairlines: light blue-grey (vertical + hr). */
const FIGMA_RULE_BG = "bg-[#cbd5e1]";
const FIGMA_RULE_BORDER = "border-[#cbd5e1]";

/** Three equal-width columns (`flex-1 basis-0`); same horizontal padding; hairline between. */
function FeaturedCaseStudyMetricsRow({
  metrics,
}: {
  metrics: { label: string; value: string }[];
}) {
  if (!metrics.length) return null;
  const rows = metrics.slice(0, 3);
  return (
    <div className="flex w-full flex-col gap-6 text-left sm:flex-row sm:gap-0">
      {rows.map((m, i) => (
        <div
          key={`${m.label}-${m.value}-${i}`}
          className={`flex min-w-0 flex-1 basis-0 flex-col gap-2.5 px-2 sm:px-3 md:px-4 ${
            i > 0
              ? `border-t pt-6 sm:border-t-0 sm:border-l sm:pt-0 ${FIGMA_RULE_BORDER}`
              : ""
          }`}
        >
          <p className={FIGMA_METRIC_LABEL}>{m.label}</p>
          <p className={FIGMA_METRIC_VALUE}>{m.value}</p>
        </div>
      ))}
    </div>
  );
}

export function CaseStudyOverviewSection({
  section,
  lang,
}: {
  section: CaseStudyOverviewSectionT;
  lang: Locale;
}) {
  const t = COPY[lang];
  const readLabel = section.readMoreLabel.trim() || t.readFallback;
  const path = section.archivePath;
  const searchQ = section.searchQuery;
  const cur = section.currentPage;
  const pages = visiblePages(section.totalPages, cur);
  const heroKpiGridClass = caseStudyGridColClass(section.gridColumns);

  const showFeatured =
    section.showFeatured &&
    cur === 1 &&
    !searchQ.trim() &&
    section.items.length > 0;
  const featured = showFeatured ? section.items[0] : null;
  const gridItems = showFeatured ? section.items.slice(1) : section.items;

  return (
    <section className="relative overflow-hidden bg-[var(--palette-white)] pb-16 md:pb-24">
      <div className="relative isolate w-full overflow-hidden border-b border-[rgba(57,144,240,0.14)] pt-28 pb-12 md:pt-36 md:pb-16 lg:pt-44 lg:pb-[4.5rem]">
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "color-mix(in srgb, var(--palette-white) 88%, var(--palette-surface))",
            }}
          />
          <div
            className="absolute top-0 left-[-19.42%] h-[186.44%] min-h-full w-[138.84%] bg-cover bg-top bg-no-repeat lg:h-[134.3%]"
            style={heroBgImageStyle}
          />
          <div className="absolute inset-0" style={brandColorBlendLayer} />
        </div>
        <Container className="relative z-10">
          <header className={`max-w-[65rem] ${REVEAL_ITEM}`}>
            {section.title ? (
              <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--palette-navy)] sm:text-[2.5rem] md:text-[3rem] lg:text-[60px] lg:leading-[1.05]">
                {section.title}
              </h1>
            ) : null}
            {section.intro ? (
              <p className="mt-4 max-w-2xl text-base font-normal leading-[1.41] text-[var(--palette-muted)] md:mt-6">
                {section.intro}
              </p>
            ) : null}
            {section.heroStats.length > 0 ? (
              <div className={`mt-8 grid gap-5 md:mt-10 ${heroKpiGridClass}`}>
                {section.heroStats.map((row, idx) => (
                  <div
                    key={`${row.label}-${row.value}-${idx}`}
                    className="flex min-h-[88px] min-w-0 flex-col justify-center gap-2.5 rounded-[7px] bg-[var(--palette-white)] px-4 py-[14px]"
                  >
                    <p className="text-base font-normal leading-[1.4] text-[var(--palette-brand)]">
                      {row.label}
                    </p>
                    <p className="text-[2.125rem] font-medium leading-none text-[var(--palette-navy)]">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </header>
        </Container>
      </div>

      <Container className="relative">
        {featured ? (
          <div
            className={`mt-12 flex flex-col gap-3 pt-0 md:mt-14 md:gap-4 ${REVEAL_ITEM}`}
          >
            <p className={FIGMA_EYEBROW}>{t.featuredEyebrow}</p>
            {/* FIX: items-stretch so image column matches right content height */}
            <div className="grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-x-16 lg:gap-y-0">
              {/*
                FIX: On mobile keep aspect-[638/436]. On lg+ drop fixed aspect and
                let image fill the height set by right content. object-cover ensures
                no letterbox padding (top/bottom blue bars).
              */}
              <div className="relative aspect-[638/436] w-full max-w-[638px] shrink-0 overflow-hidden rounded-[20px] border border-[color-mix(in_srgb,var(--palette-navy)_8%,transparent)] bg-[var(--palette-surface)] shadow-[0_10px_40px_rgba(48,89,133,0.07),0_2px_8px_rgba(21,41,81,0.04)] lg:aspect-auto lg:max-w-none">
                {featured.image ? (
                  <Image
                    src={featured.image.url}
                    alt={featured.image.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    className="object-cover"
                  />
                ) : null}
              </div>
              {/* FIX: Tighter gap (gap-5 / lg:gap-6) so right column is shorter, image stays compact */}
              <div className="flex w-full min-w-0 flex-col gap-5 text-left lg:gap-6">
                <div className="flex w-full flex-col gap-3 sm:gap-4">
                  {/* FIX: projectLabel removed from featured section to match Figma */}
                  <h2
                    className={`text-left w-full text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2rem] md:text-[2.5rem] md:leading-[1.12] lg:text-[48px] lg:leading-[1.08] ${FIGMA_TITLE_COLOR}`}
                  >
                    {featured.title}
                  </h2>
                  {featured.excerpt ? (
                    <p
                      className={`w-full max-w-none text-left text-base font-normal leading-[1.65] ${FIGMA_BODY_COLOR}`}
                    >
                      {featured.excerpt}
                    </p>
                  ) : null}
                </div>
                {/* FIX: hr restored to original position (below metrics, above CTA) */}
                {featured.metrics.length > 0 ? (
                  <>
                    <FeaturedCaseStudyMetricsRow metrics={featured.metrics} />
                    <hr
                      className={`m-0 h-px w-full shrink-0 border-0 ${FIGMA_RULE_BG}`}
                    />
                  </>
                ) : null}
                <div className="w-full">
                  <Link
                    href={featured.href}
                    className="inline-flex h-12 w-fit min-w-[10.5rem] items-center justify-center gap-3 rounded-full bg-[#3b82f6] py-1.5 pl-7 pr-1.5 text-base font-normal leading-none text-white shadow-[0_8px_24px_rgba(59,130,246,0.35),0_2px_8px_rgba(59,130,246,0.22)] transition hover:bg-[#2563eb]"
                  >
                    <span>{readLabel}</span>
                    <span
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-[#3b82f6] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                      aria-hidden
                    >
                      <ArrowRightIcon className="size-4" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {(section.items.length === 0 || gridItems.length > 0) && (
          <div
            className={`${featured ? "mt-16" : "mt-14"} md:mt-20 ${REVEAL_ITEM}`}
          >
            {section.items.length === 0 ? (
              <p className="mt-6 text-base font-normal leading-[1.4] text-[var(--palette-muted)]">
                {t.empty}
              </p>
            ) : (
              <>
                <h2 className="text-base font-normal leading-[1.4] text-[var(--palette-muted)]">
                  {t.gridHeading}
                </h2>
                <ul
                  className={`mt-8 grid gap-6 lg:gap-6 ${CASE_STUDY_LIST_GRID_CLASS}`}
                >
                  {gridItems.map((card) => (
                    <li key={card.id}>
                      <article className="flex h-full flex-col gap-6 overflow-hidden rounded-2xl bg-[#f0f7ff] p-6 md:p-8">
                        <div className="relative aspect-[369/260] w-full overflow-hidden rounded-xl bg-[var(--palette-white)]">
                          {card.image ? (
                            <Image
                              src={card.image.url}
                              alt={card.image.alt}
                              fill
                              className="object-cover"
                              sizes={CASE_STUDY_LIST_CARD_SIZES}
                            />
                          ) : null}
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col gap-5">
                          {card.projectLabel ? (
                            <p className="text-base font-medium leading-[1.4] text-[var(--palette-brand)]">
                              {card.projectLabel}
                            </p>
                          ) : null}
                          {card.projectLabel ? (
                            <div
                              className="h-px w-full bg-[rgba(57,144,240,0.2)]"
                              aria-hidden
                            />
                          ) : null}
                          <h3 className="text-2xl font-semibold leading-[1.2] text-[var(--palette-navy)] md:text-[1.75rem]">
                            {card.title}
                          </h3>
                          {card.excerpt ? (
                            <span className="sr-only">{card.excerpt}</span>
                          ) : null}
                          <Link
                            href={card.href}
                            className="mt-auto inline-flex items-center gap-2.5 text-base font-normal leading-[1.4] text-[var(--palette-brand)] no-underline transition hover:opacity-90"
                          >
                            {readLabel}
                            <CaseStudyCardLinkArrow />
                          </Link>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {path && section.totalPages > 1 ? (
          <nav
            className={`mt-12 flex flex-wrap items-center justify-center gap-2.5 ${REVEAL_ITEM}`}
            aria-label={t.paginationNav}
          >
            {cur <= 1 ? (
              <span
                className="inline-flex size-[54px] items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,var(--palette-brand)_25%,transparent)] bg-[var(--palette-brand)]/40 text-[var(--palette-white)]"
                aria-hidden
              >
                <ChevronLeft className="size-6" />
              </span>
            ) : (
              <Link
                href={listUrl(lang, path, {
                  page: cur - 1,
                  s: searchQ || undefined,
                })}
                className="inline-flex size-[54px] items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,var(--palette-brand)_25%,transparent)] bg-[var(--palette-brand)] text-[var(--palette-white)] transition hover:opacity-95"
                aria-label={t.prev}
              >
                <ChevronLeft className="size-6" />
              </Link>
            )}
            {pages.map((n) => (
              <Link
                key={n}
                href={listUrl(lang, path, {
                  page: n > 1 ? n : undefined,
                  s: searchQ || undefined,
                })}
                className={`inline-flex size-[54px] items-center justify-center rounded-[10px] text-2xl font-medium leading-[1.4] ${
                  n === cur
                    ? "border border-[rgba(57,144,240,0.27)] bg-[var(--palette-white)] text-[var(--palette-navy)]"
                    : "bg-[var(--palette-surface)] text-[rgba(21,41,81,0.49)] hover:bg-[color-mix(in_srgb,var(--palette-brand)_8%,var(--palette-white))] hover:text-[var(--palette-brand)]"
                }`}
              >
                {n}
              </Link>
            ))}
            {cur >= section.totalPages ? (
              <span
                className="inline-flex size-[54px] items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,var(--palette-brand)_25%,transparent)] bg-[var(--palette-brand)]/40 text-[var(--palette-white)]"
                aria-hidden
              >
                <ChevronRight className="size-6" />
              </span>
            ) : (
              <Link
                href={listUrl(lang, path, {
                  page: cur + 1,
                  s: searchQ || undefined,
                })}
                className="inline-flex size-[54px] items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,var(--palette-brand)_25%,transparent)] bg-[var(--palette-brand)] text-[var(--palette-white)] transition hover:opacity-95"
                aria-label={t.next}
              >
                <ChevronRight className="size-6" />
              </Link>
            )}
          </nav>
        ) : null}
      </Container>
    </section>
  );
}
