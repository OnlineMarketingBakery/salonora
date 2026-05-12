/** @see Figma **830:2196** — blog index: hero, search, featured row, card grid, pagination (header/footer from layout). */
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import type { BlogPostOverviewCardT, BlogPostOverviewSectionT } from "@/types/sections";
import type { CSSProperties } from "react";

/** Figma `68aa8766d05fb7bf86a05084_hero-bg` — blog overview **830:2207** uses same mesh + brand blend as `feature-highlight-split`. */
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
    featuredEyebrow: "Uitgelichte blog",
    gridHeading: "Recente blogs",
    searchPlaceholder: "Zoek in blogs",
    readFallback: "Lees de blog",
    minRead: (n: number) => `${n} minuten`,
    empty: "Geen artikelen gevonden.",
    prev: "Vorige",
    next: "Volgende",
  },
  en: {
    featuredEyebrow: "Featured article",
    gridHeading: "Recent posts",
    searchPlaceholder: "Search articles…",
    readFallback: "Read article",
    minRead: (n: number) => `${n} min read`,
    empty: "No articles found.",
    prev: "Previous",
    next: "Next",
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

function MetaRow({
  card,
  lang,
  variant,
}: {
  card: BlogPostOverviewCardT;
  lang: Locale;
  /** Figma 830:2196 — featured: 16px medium navy + 44px wells; cards: 16px regular muted + 24px icons */
  variant: "featured" | "card";
}) {
  const t = COPY[lang];
  const author = card.authorName.trim() || "—";
  const isCard = variant === "card";
  const rowGap = isCard ? "gap-[18px]" : "gap-6";
  const textTone = isCard
    ? "text-base font-normal leading-[1.4] text-[var(--palette-muted)]"
    : "text-base font-medium leading-[1.4] text-[var(--palette-navy)]";
  const avatarSize = isCard ? 24 : 44;

  return (
    <div className={`flex flex-wrap items-center ${rowGap} ${textTone}`}>
      <span className={`inline-flex items-center ${isCard ? "gap-0.5" : "gap-[7px]"}`}>
        {card.authorAvatarUrl ? (
          <Image
            src={card.authorAvatarUrl}
            alt=""
            width={avatarSize}
            height={avatarSize}
            className="rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span
            className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--palette-brand)_10%,var(--palette-white))]"
            style={{ width: avatarSize, height: avatarSize }}
            aria-hidden
          />
        )}
        <span>{author}</span>
      </span>
      <span className={`inline-flex items-center ${isCard ? "gap-0.5" : "gap-2"}`}>
        {isCard ? (
          <span className="inline-flex size-6 shrink-0 items-center justify-center text-[var(--palette-brand)]">
            <CalendarIcon className="size-6" />
          </span>
        ) : (
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--palette-white)] text-[var(--palette-brand)]">
            <CalendarIcon className="size-5" />
          </span>
        )}
        <span>{card.dateLabel || "—"}</span>
      </span>
      <span className={`inline-flex items-center ${isCard ? "gap-0.5" : "gap-2"}`}>
        {isCard ? (
          <span className="inline-flex size-6 shrink-0 items-center justify-center text-[var(--palette-brand)]">
            <ClockIcon className="size-6" />
          </span>
        ) : (
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--palette-white)] text-[var(--palette-brand)]">
            <ClockIcon className="size-5" />
          </span>
        )}
        <span>{t.minRead(card.readMinutes)}</span>
      </span>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5 3.5h1.5V2.75a.75.75 0 011.5 0V3.5h4V2.75a.75.75 0 011.5 0V3.5H15A1.5 1.5 0 0116.5 5v10A1.5 1.5 0 0115 16.5H5A1.5 1.5 0 013.5 15V5A1.5 1.5 0 015 3.5zm-1 4v8.5h11V7.5h-11z"
        fill="currentColor"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 3a7 7 0 110 14 7 7 0 010-14zm0 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm.75 2.25a.75.75 0 00-1.5 0V10a.75.75 0 00.22.53l2 2a.75.75 0 101.06-1.06l-1.78-1.78V6.75z"
        fill="currentColor"
      />
    </svg>
  );
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12.5 12.5L17 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function BlogPostOverviewSection({
  section,
  lang,
}: {
  section: BlogPostOverviewSectionT;
  lang: Locale;
}) {
  const t = COPY[lang];
  const readLabel = section.readMoreLabel.trim() || t.readFallback;
  const path = section.archivePath;
  const searchQ = section.searchQuery;
  const cur = section.currentPage;
  const pages = visiblePages(section.totalPages, cur);

  const showFeatured =
    section.showFeatured &&
    cur === 1 &&
    !searchQ.trim() &&
    section.items.length > 0;
  const featured = showFeatured ? section.items[0] : null;
  const gridItems = showFeatured ? section.items.slice(1) : section.items;

  return (
    <section className="relative overflow-hidden bg-[var(--palette-white)] pb-16 md:pb-24">
      {/* Top band — Figma 830:2196 / 830:2207: same hero-bg image + brand color blend as feature-highlight-split */}
      <div className="relative isolate w-full overflow-hidden border-b border-[rgba(57,144,240,0.14)] pt-28 pb-12 md:pt-36 md:pb-16 lg:pt-44 lg:pb-[4.5rem]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
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
            {section.showSearch && path ? (
              <form
                method="get"
                action={buildLocalePath(lang, path)}
                className="mt-10 flex h-[52px] w-full max-w-[40rem] items-center gap-2 rounded-[40px] border border-[rgba(57,144,240,0.14)] bg-[var(--palette-white)] py-1.5 pl-6 pr-1.5 shadow-[0px_4px_14px_rgba(48,89,133,0.17)] md:mt-12 md:h-14 md:pl-7"
                role="search"
              >
                <label htmlFor={`blog-search-${section.id}`} className="sr-only">
                  {t.searchPlaceholder}
                </label>
                <input
                  id={`blog-search-${section.id}`}
                  name="s"
                  type="search"
                  defaultValue={searchQ}
                  placeholder={t.searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-base text-[var(--palette-navy)] outline-none placeholder:text-[rgba(67,87,128,0.3)] placeholder:leading-[1.6]"
                />
                <button
                  type="submit"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--palette-brand)] text-[var(--palette-white)] shadow-[0_2px_8px_rgba(57,144,240,0.35)] transition hover:opacity-95 md:size-12"
                  aria-label={t.searchPlaceholder}
                >
                  <SearchIcon className="size-[1.35rem] md:size-6" />
                </button>
              </form>
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
            <div className="flex flex-col gap-6">
              <p className="text-base font-normal leading-[1.4] text-[var(--palette-muted)]">{t.featuredEyebrow}</p>
              <h2 className="text-[2rem] font-semibold leading-[1.1] text-[var(--palette-navy)] sm:text-[2.25rem] md:text-[48px] md:leading-[1.1]">
                {featured.title}
              </h2>
              {featured.excerpt ? (
                <p className="line-clamp-4 text-base font-normal leading-[1.4] text-[var(--palette-muted)]">{featured.excerpt}</p>
              ) : null}
              <div className="flex flex-col gap-6 border-t border-b border-[color-mix(in_srgb,var(--palette-navy)_12%,transparent)] py-[18px]">
                <MetaRow card={featured} lang={lang} variant="featured" />
              </div>
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

        <div className={`mt-14 md:mt-20 ${REVEAL_ITEM}`}>
          <h2 className="text-base font-normal leading-[1.4] text-[var(--palette-muted)]">{t.gridHeading}</h2>
          {gridItems.length === 0 ? (
            <p className="mt-6 text-base font-normal leading-[1.4] text-[var(--palette-muted)]">{t.empty}</p>
          ) : (
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gridItems.map((card) => (
                <li key={card.id}>
                  <article className="flex h-full flex-col overflow-hidden rounded-[14px] bg-[var(--palette-surface)] p-6 shadow-sm transition hover:shadow-md">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[10px] bg-[var(--palette-white)]">
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
                    <div className="mt-[18px] flex flex-1 flex-col gap-4">
                      <MetaRow card={card} lang={lang} variant="card" />
                      <div className="h-px w-full bg-[color-mix(in_srgb,var(--palette-navy)_10%,transparent)]" aria-hidden />
                      <h3 className="text-2xl font-semibold leading-[1.24] text-[var(--palette-navy)]">{card.title}</h3>
                      {card.excerpt ? (
                        <p className="line-clamp-3 flex-1 text-base font-normal leading-[1.4] text-[var(--palette-muted)]">
                          {card.excerpt}
                        </p>
                      ) : null}
                      <Link
                        href={card.href}
                        className="mt-1 inline-flex items-center gap-2.5 text-base font-normal leading-[1.4] text-[var(--palette-brand)] hover:underline"
                      >
                        {readLabel}
                        <ArrowRightIcon className="size-[16.667px] shrink-0" />
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>

        {path && section.totalPages > 1 ? (
          <nav
            className={`mt-12 flex flex-wrap items-center justify-center gap-2.5 ${REVEAL_ITEM}`}
            aria-label="Pagination"
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
