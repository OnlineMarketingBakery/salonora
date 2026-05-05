"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { TestimonialDocument } from "@/types/testimonials";

function chunk<T>(arr: T[], size: number): T[][] {
  if (size < 1) return [];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function formatRatingLabel(rating: number): string {
  if (Number.isInteger(rating)) return String(rating);
  const s = rating.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

function QuoteGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={32}
      height={24}
      viewBox="0 0 32 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M0 0H14.1667V12.75L6.69667 23.3333H2.15833L6.60167 13.3333H0V0ZM17.5 0H31.6667V12.75L24.1967 23.3333H19.6583L24.1017 13.3333H17.5V0Z"
        fill="var(--palette-brand)"
      />
    </svg>
  );
}

function RatingPill({ rating }: { rating: number }) {
  return (
    <div
      className="relative inline-grid shrink-0 place-items-start leading-none"
      aria-label={`${formatRatingLabel(rating)} van 5 sterren`}
    >
      <div className="col-start-1 row-start-1 h-[30px] w-[65px] rounded-[15px] bg-white shadow-md ring-1 ring-navy-deep/10" />
      <div className="col-start-1 row-start-1 ml-0.5 mt-0.5 flex size-[26px] items-center justify-center rounded-full bg-surface">
        <span className="text-sm leading-none" style={{ color: "var(--palette-star)" }} aria-hidden>
          ★
        </span>
      </div>
      <p className="col-start-1 row-start-1 ml-[33px] mt-2 font-sans text-sm font-medium leading-none tabular-nums text-navy">
        {formatRatingLabel(rating)}
      </p>
    </div>
  );
}

function gridColsClass(perView: 1 | 2 | 3): string {
  switch (perView) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 md:grid-cols-2";
    default:
      return "grid-cols-1 md:grid-cols-3";
  }
}

export function TestimonialsSliderCarousel({
  items,
  perView,
  sectionId,
}: {
  items: TestimonialDocument[];
  perView: 1 | 2 | 3;
  sectionId: string;
}) {
  const slides = useMemo(() => chunk(items, perView), [items, perView]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive((a) => (slides.length === 0 ? 0 : Math.min(a, slides.length - 1)));
  }, [slides.length]);

  const go = useCallback(
    (i: number) => {
      if (i < 0 || i >= slides.length) return;
      setActive(i);
    },
    [slides.length]
  );

  if (!items.length) return null;

  const slideFractionPct = slides.length ? 100 / slides.length : 100;

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${active * slideFractionPct}%)`,
          }}
        >
          {slides.map((slideItems, slideIdx) => (
            <div
              key={`${sectionId}-slide-${slideIdx}`}
              className="shrink-0 px-0"
              style={{ width: `${slideFractionPct}%` }}
            >
              <div className={`grid w-full gap-6 md:gap-8 ${gridColsClass(perView)}`}>
                {slideItems.map((t) => (
                  <blockquote
                    key={t.id}
                    className={`${REVEAL_ITEM} relative flex h-full min-h-[200px] flex-col gap-6 rounded-2xl bg-gradient-to-b from-white to-white/50 p-6 shadow-lg shadow-navy-deep/10 md:p-8`}
                  >
                    <QuoteGlyph />
                    <RichText
                      html={t.clientTestimonial}
                      className="text-left text-sm font-normal leading-5 text-navy [&_p]:mb-3 [&_p:last-child]:mb-0"
                    />
                    <div className="h-px w-full shrink-0 bg-navy/10" aria-hidden />
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {t.avatar ? (
                          <Media
                            image={t.avatar}
                            width={48}
                            height={48}
                            className="size-12 shrink-0 rounded-full object-cover"
                            preferLargestSource
                            sizes="48px"
                            quality={90}
                          />
                        ) : (
                          <div
                            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-navy ring-1 ring-navy-deep/10"
                            aria-hidden
                          >
                            {t.clientName
                              .split(/\s+/)
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((w) => w[0])
                              .join("")
                              .toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-base font-medium leading-relaxed text-navy">{t.clientName}</p>
                          <p className="truncate text-xs font-medium leading-snug text-muted">{t.clientRole}</p>
                        </div>
                      </div>
                      {typeof t.rating === "number" && t.rating > 0 && <RatingPill rating={t.rating} />}
                    </div>
                  </blockquote>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="mt-10 flex justify-center md:mt-12" role="tablist" aria-label="Testimonial slides">
          <div className="flex flex-wrap items-center justify-center gap-1">
            {slides.map((_, i) => (
              <button
                key={`${sectionId}-dot-${i}`}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Slide ${i + 1} van ${slides.length}`}
                className={
                  i === active
                    ? "h-3 w-9 rounded-full bg-brand transition-[width] duration-200"
                    : "size-3 rounded-full bg-brand/30 transition-colors duration-200 hover:bg-brand/50"
                }
                onClick={() => go(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
