"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { buildArchivePaginationRange } from "@/lib/utils/archive-pagination-range";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  nl: { prev: "Vorige", next: "Volgende", paginationNav: "Paginering" },
  en: { prev: "Previous", next: "Next", paginationNav: "Pagination" },
} as const;

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

const prevEnabledClass =
  "inline-flex size-[54px] items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,var(--palette-brand)_25%,transparent)] bg-[var(--palette-brand)] text-[var(--palette-white)] transition hover:opacity-95";
const prevDisabledClass =
  "inline-flex size-[54px] items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,var(--palette-brand)_25%,transparent)] bg-[var(--palette-brand)]/40 text-[var(--palette-white)]";
const pageActiveClass =
  "inline-flex size-[54px] items-center justify-center rounded-[10px] border border-[rgba(57,144,240,0.27)] bg-[var(--palette-white)] text-2xl font-medium leading-[1.4] text-[var(--palette-navy)]";
const pageInactiveClass =
  "inline-flex size-[54px] items-center justify-center rounded-[10px] bg-[var(--palette-surface)] text-2xl font-medium leading-[1.4] text-[rgba(21,41,81,0.49)] hover:bg-[color-mix(in_srgb,var(--palette-brand)_8%,var(--palette-white))] hover:text-[var(--palette-brand)]";

type BlogArchivePaginationProps = {
  lang: Locale;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
};

export function BlogArchivePagination({
  lang,
  currentPage,
  totalPages,
  searchQuery,
}: BlogArchivePaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = COPY[lang];

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("s", searchQuery.trim());
      if (page > 1) params.set("page", String(page));
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchQuery],
  );

  if (totalPages <= 1) return null;

  const items = buildArchivePaginationRange(totalPages, currentPage);
  const cur = currentPage;

  return (
    <nav
      className={`mt-12 flex flex-wrap items-center justify-center gap-2.5 ${REVEAL_ITEM}`}
      aria-label={t.paginationNav}
    >
      {cur <= 1 ? (
        <span className={prevDisabledClass} aria-hidden>
          <ChevronLeft className="size-6" />
        </span>
      ) : (
        <button type="button" className={prevEnabledClass} aria-label={t.prev} onClick={() => goToPage(cur - 1)}>
          <ChevronLeft className="size-6" />
        </button>
      )}

      {items.map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            className="inline-flex size-[54px] items-center justify-center text-2xl font-medium leading-[1.4] text-[rgba(21,41,81,0.49)]"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={item === cur ? pageActiveClass : pageInactiveClass}
            aria-label={`Page ${item}`}
            aria-current={item === cur ? "page" : undefined}
            onClick={() => goToPage(item)}
          >
            {item}
          </button>
        ),
      )}

      {cur >= totalPages ? (
        <span className={prevDisabledClass} aria-hidden>
          <ChevronRight className="size-6" />
        </span>
      ) : (
        <button type="button" className={prevEnabledClass} aria-label={t.next} onClick={() => goToPage(cur + 1)}>
          <ChevronRight className="size-6" />
        </button>
      )}
    </nav>
  );
}
