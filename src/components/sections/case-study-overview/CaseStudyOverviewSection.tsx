/** @see Figma **866:4217** — case study index; hero stats + featured metrics; grid cards match blog surface cards (**892:617** rhythm). */
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Container } from "@/components/ui/Container";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import type { CaseStudyOverviewSectionT } from "@/types/sections";
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
    readFallback: "Read case study",
    empty: "No case studies found.",
    prev: "Previous",
    next: "Next",
    paginationNav: "Pagination",
  },
} as const;

function listUrl(lang: Locale, archivePath: string, opts: { page?: number; s?: string }) {
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

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeaturedMetrics({ metrics }: { metrics: { label: string; value: string }[] }) {
  if (!metrics.length) return null;
  return (
    <div className="flex flex-wrap items-start gap-x-11 gap-y-4">
      {metrics.map((m, i) => (
        <Fragment key={`${m.label}-${m.value}-${i}`}>
          {i > 0 ? (
            <div
              className="hidden h-[60px] w-px shrink-0 self-center bg-[color-mix(in_srgb,var(--palette-navy)_18%,transparent)] sm:block"
              aria-hidden
            />
          ) : null}
          <div className="flex min-w-0 flex-col gap-2.5">
            <p className="text-base font-normal leading-[1.4] text-[var(--palette-brand)]">{m.label}</p>
            <p className="text-[2.125rem] font-medium leading-[1.1] text-[var(--palette-navy)]">{m.value}</p>
          </div>
        </Fragment>
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

  const showFeatured =
    section.showFeatured && cur === 1 && !searchQ.trim() && section.items.length > 0;
  const featured = showFeatured ? section.items[0] : null;
  const gridItems = showFeatured ? section.items.slice(1) : section.items;

  return (
    <section className="relative overflow-hidden bg-[var(--palette-white)] pb-16 md:pb-24">
      <div className="relative isolate w-full overflow-hidden border-b border-[rgba(57,144,240,0.14)] pt-28 pb-12 md:pt-36 md:pb-16 lg:pt-44 lg:pb-[4.5rem]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              background: "color-mix(in srgb, var(--palette-white) 88%, var(--palette-surface))",
            }}
          />
          <div
            className="absolute top-0 left-[-19.42%] h-[186.44%] min-h-full w-[138.84%] bg-cover bg-top bg-no-repeat lg:h-[134.3%]"
            style={heroBgImageStyle}
          />
          <div className="absolute inset-0" style={brandColorBlendLayer} />
        </div>
        <Container className="relative z-10">
          <header className={`max-w-4xl ${REVEAL_ITEM}`}>
            {section.title ? (
              <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--palette-navy)] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.75rem] lg:leading-[1.1]">
                {section.title}
              </h1>
            ) : null}
            {section.intro ? (
              <p className="mt-4 max-w-2xl text-base font-normal leading-[1.6] text-[var(--palette-muted)] md:mt-[18px]">
                {section.intro}
              </p>
            ) : null}
            {section.heroStats.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-5 md:mt-10">
                {section.heroStats.map((row, idx) => (
                  <div
                    key={`${row.label}-${row.value}-${idx}`}
                    className="flex min-h-[88px] min-w-[10rem] flex-1 flex-col justify-center gap-2.5 rounded-[7px] bg-[var(--palette-white)] px-4 py-3.5 shadow-[0px_4px_14px_rgba(48,89,133,0.12)] sm:min-w-[14rem] sm:px-4"
                  >
                    <p className="text-base font-normal leading-[1.4] text-[var(--palette-brand)]">{row.label}</p>
                    <p className="text-[2.125rem] font-medium leading-none text-[var(--palette-navy)]">{row.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </header>
        </Container>
      </div>

      <Container className="relative">
        {featured ? (
          <article
            className={`mt-10 grid gap-8 rounded-[14px] border border-[color-mix(in_srgb,var(--palette-brand)_14%,transparent)] bg-[var(--palette-white)] p-6 shadow-[0_6px_24px_rgba(57,144,240,0.12)] md:mt-14 md:grid-cols-2 md:items-center md:gap-10 md:p-8 lg:gap-12 ${REVEAL_ITEM}`}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-[var(--palette-surface)] md:aspect-[16/11]">
              {featured.image ? (
                <Image
                  src={featured.image.url}
                  alt={featured.image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : null}
            </div>
            <div className="flex flex-col gap-6 md:gap-[34px]">
              <p className="text-base font-normal leading-[1.4] text-[var(--palette-muted)]">{t.featuredEyebrow}</p>
              <div className="flex flex-col gap-5">
                {featured.projectLabel ? (
                  <p className="text-base font-normal leading-[1.4] text-[var(--palette-brand)]">{featured.projectLabel}</p>
                ) : null}
                <h2 className="text-[2rem] font-semibold leading-[1.1] text-[var(--palette-navy)] sm:text-[2.25rem] md:text-[48px] md:leading-[1.1]">
                  {featured.title}
                </h2>
                {featured.excerpt ? (
                  <p className="line-clamp-4 text-base font-normal leading-[1.4] text-[var(--palette-muted)]">
                    {featured.excerpt}
                  </p>
                ) : null}
              </div>
              {featured.metrics.length > 0 ? (
                <div className="flex flex-col gap-6 border-t border-b border-[color-mix(in_srgb,var(--palette-navy)_12%,transparent)] py-6">
                  <FeaturedMetrics metrics={featured.metrics} />
                </div>
              ) : null}
              <div>
                <Link
                  href={featured.href}
                  className="inline-flex h-12 min-w-[10rem] items-center justify-center gap-[18px] rounded-[24px] bg-[var(--palette-brand)] px-3 text-base font-normal text-[var(--palette-white)] shadow-[0_6px_10px_rgba(57,144,240,0.54)] transition hover:opacity-95"
                >
                  {readLabel}
                  <ArrowRightIcon className="size-6 shrink-0" />
                </Link>
              </div>
            </div>
          </article>
        ) : null}

        {(section.items.length === 0 || gridItems.length > 0) && (
        <div className={`mt-14 md:mt-20 ${REVEAL_ITEM}`}>
          {section.items.length === 0 ? (
            <p className="mt-6 text-base font-normal leading-[1.4] text-[var(--palette-muted)]">{t.empty}</p>
          ) : (
            <>
              <h2 className="text-base font-normal leading-[1.4] text-[var(--palette-muted)]">{t.gridHeading}</h2>
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {gridItems.map((card) => (
                  <li key={card.id}>
                    <article className="flex h-full flex-col overflow-hidden rounded-[14px] bg-[var(--palette-surface)] p-6">
                      <div className="relative aspect-[369/260] w-full overflow-hidden rounded-[10px] bg-[var(--palette-white)]">
                        {card.image ? (
                          <Image
                            src={card.image.url}
                            alt={card.image.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : null}
                      </div>
                      <div className="mt-[18px] flex min-h-0 flex-1 flex-col gap-4">
                        {card.projectLabel ? (
                          <p className="text-base font-normal leading-[1.4] text-[var(--palette-brand)]">{card.projectLabel}</p>
                        ) : null}
                        {card.projectLabel ? (
                          <div
                            className="h-px w-full bg-[color-mix(in_srgb,var(--palette-navy)_10%,transparent)]"
                            aria-hidden
                          />
                        ) : null}
                        <div className="flex min-h-0 flex-1 flex-col gap-3">
                          <h3 className="text-2xl font-semibold leading-[1.24] text-[var(--palette-navy)]">{card.title}</h3>
                          {card.excerpt ? (
                            <p className="line-clamp-3 flex-1 text-base font-normal leading-[1.4] text-[var(--palette-muted)]">
                              {card.excerpt}
                            </p>
                          ) : null}
                          <Link
                            href={card.href}
                            className="mt-auto inline-flex items-center gap-[10px] text-base font-normal leading-[1.4] text-[var(--palette-brand)] no-underline transition hover:opacity-90"
                          >
                            {readLabel}
                            <ArrowRightIcon className="size-[16.667px] shrink-0" />
                          </Link>
                        </div>
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
                href={listUrl(lang, path, { page: cur - 1, s: searchQ || undefined })}
                className="inline-flex size-[54px] items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,var(--palette-brand)_25%,transparent)] bg-[var(--palette-brand)] text-[var(--palette-white)] transition hover:opacity-95"
                aria-label={t.prev}
              >
                <ChevronLeft className="size-6" />
              </Link>
            )}
            {pages.map((n) => (
              <Link
                key={n}
                href={listUrl(lang, path, { page: n > 1 ? n : undefined, s: searchQ || undefined })}
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
                href={listUrl(lang, path, { page: cur + 1, s: searchQ || undefined })}
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
