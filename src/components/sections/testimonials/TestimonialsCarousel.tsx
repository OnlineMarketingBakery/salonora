"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { TestimonialDocument } from "@/types/testimonials";
import "./testimonials-carousel.css";

const MOBILE_MQ = "(max-width: 767px)";
const SWIPE_THRESHOLD_PX = 48;
const VIEWPORT_HEIGHT_BUFFER_PX = 16;

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
      className="flex h-[30px] w-[65px] shrink-0 items-center gap-[5px] rounded-[15px] bg-white p-0.5"
      aria-label={`${formatRatingLabel(rating)} van 5 sterren`}
    >
      <span
        className="flex size-[26px] shrink-0 items-center justify-center text-sm leading-none"
        style={{ color: "var(--palette-star)" }}
        aria-hidden
      >
        ★
      </span>
      <p className="w-[22px] text-center font-sans text-sm font-medium leading-[1.6] text-navy tabular-nums">
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

function useMobileCarousel(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialDocument }) {
  return (
    <blockquote
      className={`testimonials-carousel__card ${REVEAL_ITEM} relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-[14px] bg-white p-6 shadow-[0_8px_20px_rgba(67,87,128,0.06)] sm:p-[34px]`}
    >
      <QuoteGlyph className="mb-[23px] shrink-0" />
      <RichText
        html={testimonial.clientTestimonial}
        className="flex-1 text-left text-sm font-normal leading-5 text-copy [&_p]:mb-3 [&_p:last-child]:mb-0"
      />
      <div className="mt-[23px] w-full shrink-0">
        <div className="h-px w-full bg-[rgba(21,41,81,0.12)]" aria-hidden />
        <div className="mt-[23px] flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {testimonial.avatar ? (
              <Media
                image={testimonial.avatar}
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
                {testimonial.clientName
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase() || "?"}
              </div>
            )}
            <div className="testimonials-carousel__author-meta min-w-0">
              <p className="testimonials-carousel__author-name line-clamp-2 text-base font-medium leading-[1.6] text-navy">
                {testimonial.clientName}
              </p>
              <p className="testimonials-carousel__author-role line-clamp-2 text-xs font-normal leading-[1.4] text-muted">
                {testimonial.clientRole}
              </p>
            </div>
          </div>
          {typeof testimonial.rating === "number" && testimonial.rating > 0 ? (
            <RatingPill rating={testimonial.rating} />
          ) : null}
        </div>
      </div>
    </blockquote>
  );
}

export function TestimonialsCarousel({
  items,
  perView,
  sectionId,
  narrowSingleTotal,
}: {
  items: TestimonialDocument[];
  perView: 1 | 2 | 3;
  sectionId: string;
  /** When only one testimonial exists, constrain card width like legacy grid. */
  narrowSingleTotal?: boolean;
}) {
  const isMobile = useMobileCarousel();
  const effectivePerView = isMobile ? 1 : perView;
  const slides = useMemo(() => chunk(items, effectivePerView), [items, effectivePerView]);
  const [active, setActive] = useState(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [slideHeights, setSlideHeights] = useState<number[]>([]);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setActive((a) => (slides.length === 0 ? 0 : Math.min(a, slides.length - 1)));
  }, [slides.length]);

  useLayoutEffect(() => {
    const observers: ResizeObserver[] = [];

    slides.forEach((_, idx) => {
      const el = slideRefs.current[idx];
      if (!el) return;

      const measure = () => {
        const h = Math.ceil(el.getBoundingClientRect().height);
        setSlideHeights((prev) => {
          const next = [...prev];
          next[idx] = h;
          return next;
        });
      };

      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      observers.push(ro);
    });

    return () => observers.forEach((ro) => ro.disconnect());
  }, [slides]);

  useEffect(() => {
    const h = slideHeights[active] ?? 0;
    if (h > 0) setViewportHeight(h + VIEWPORT_HEIGHT_BUFFER_PX);
  }, [active, slideHeights]);

  const go = useCallback(
    (i: number) => {
      if (i < 0 || i >= slides.length) return;
      setActive(i);
    },
    [slides.length],
  );

  const onTouchStart = useCallback((clientX: number) => {
    touchStartX.current = clientX;
  }, []);

  const onTouchEnd = useCallback(
    (clientX: number) => {
      if (touchStartX.current == null) return;
      const dx = clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
      if (dx < 0) go(active + 1);
      else go(active - 1);
    },
    [active, go],
  );

  if (!items.length) return null;

  const slideFractionPct = slides.length ? 100 / slides.length : 100;

  return (
    <div
      className={
        narrowSingleTotal && !isMobile ? "mx-auto w-full max-w-[637px]" : "w-full"
      }
    >
      <div
        className={`testimonials-carousel__viewport relative w-full overflow-hidden will-change-[height] [transition-property:height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none`}
        style={viewportHeight != null ? { height: viewportHeight } : undefined}
        onTouchStart={(e) => onTouchStart(e.touches[0]?.clientX ?? 0)}
        onTouchEnd={(e) => onTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
      >
        <div
          className="testimonials-carousel__track flex will-change-transform [transition-property:transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translate3d(-${active * slideFractionPct}%, 0, 0)`,
          }}
        >
          {slides.map((slideItems, slideIdx) => (
            <div
              key={`${sectionId}-slide-${slideIdx}`}
              className="shrink-0 px-0"
              style={{ width: `${slideFractionPct}%` }}
            >
              <div
                ref={(el) => {
                  slideRefs.current[slideIdx] = el;
                }}
                className={`grid w-full items-stretch gap-6 ${gridColsClass(effectivePerView)}`}
              >
                {slideItems.map((t) => (
                  <TestimonialCard key={t.id} testimonial={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 ? (
        <div
          className="testimonials-carousel__dots flex justify-center"
          role="tablist"
          aria-label="Testimonial slides"
        >
          <div className="flex flex-wrap items-center justify-center gap-[3px]">
            {slides.map((_, i) => (
              <button
                key={`${sectionId}-dot-${i}`}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Slide ${i + 1} van ${slides.length}`}
                className={
                  i === active
                    ? "h-3 w-[37px] shrink-0 rounded-[29px] bg-brand transition-[width] duration-200"
                    : "size-3 shrink-0 rounded-[29px] bg-[rgba(57,144,240,0.28)] transition-colors duration-200 hover:bg-[rgba(57,144,240,0.45)]"
                }
                onClick={() => go(i)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
