"use client";

import type { RefObject } from "react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import type { ScrollingTickerSectionT } from "@/types/sections";

const TICKER_SPEED_PX_PER_SEC = 68;

const MARQUEE_MIN_COPIES = 8;

/** Figma 907:27 — four-point sparkle before each phrase */
function TickerSparkle({ className }: { className?: string }) {
  return (
    <svg
      className={`h-8 w-8 shrink-0 ${className ?? ""}`}
      width={31}
      height={32}
      viewBox="0 0 31 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path fill="var(--palette-white)" d="M15.5 0L18.2 11.8L30 14.5L18.2 17.2L15.5 29L12.8 17.2L1 14.5L12.8 11.8L15.5 0Z" />
    </svg>
  );
}

const richTickerClass =
  "prose max-w-none font-sans text-2xl font-medium leading-tight text-inherit md:text-3xl " +
  "[&_p]:my-0 [&_p]:inline [&_p]:whitespace-nowrap [&_p]:text-2xl [&_p]:font-medium [&_p]:leading-tight [&_p]:text-inherit md:[&_p]:text-3xl " +
  "[&_span]:text-2xl [&_span]:font-medium [&_span]:leading-tight [&_span]:text-inherit md:[&_span]:text-3xl " +
  "[&_strong]:text-2xl md:[&_strong]:text-3xl [&_a]:text-inherit [&_em]:text-2xl md:[&_em]:text-3xl";

function TickerSegments({
  items,
  keyPrefix,
  hideFromA11y,
  innerRef,
}: {
  items: NonNullable<ScrollingTickerSectionT["items"]>;
  keyPrefix: string;
  hideFromA11y?: boolean;
  innerRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={innerRef}
      className="flex shrink-0 items-center gap-5"
      aria-hidden={hideFromA11y ? true : undefined}
    >
      {items.map((it, i) => (
        <div key={`${keyPrefix}-${i}`} className="flex shrink-0 items-center gap-5">
          <TickerSparkle />
          <RichText html={it.text ?? ""} className={richTickerClass} />
        </div>
      ))}
    </div>
  );
}

function itemsSignature(items: NonNullable<ScrollingTickerSectionT["items"]>): string {
  return items.map((it) => it.text ?? "").join("\u0001");
}

function cycleWidthPx(el: HTMLElement): number {
  const w = el.getBoundingClientRect().width;
  return Math.round(w * 1000) / 1000;
}

/**
 * Figma 907:27 — tilted brand ribbon with soft brand layer; GSAP infinite marquee.
 */
export function ScrollingTickerSection({
  section,
  lang,
}: {
  section: ScrollingTickerSectionT;
  lang: Locale;
}) {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);

  const rawItems = section.items ?? [];
  const items = rawItems.filter((it) => (it.text ?? "").trim());
  const itemsKey = itemsSignature(items);

  useLayoutEffect(() => {
    const ribbon = ribbonRef.current;
    const track = trackRef.current;
    const first = firstSetRef.current;
    if (!ribbon || !track || !first || !items.length) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(track, { x: 0 });
      return;
    }

    let tween: gsap.core.Tween | null = null;
    let lastCycleW = -1;

    const start = () => {
      const w = cycleWidthPx(first);
      if (w < 1) return;

      if (tween && tween.isActive() && Math.abs(w - lastCycleW) < 0.75) return;
      lastCycleW = w;

      tween?.kill();
      gsap.killTweensOf(track);
      gsap.set(track, { x: 0 });

      tween = gsap.to(track, {
        x: -w,
        duration: w / TICKER_SPEED_PX_PER_SEC,
        ease: "none",
        repeat: -1,
      });
    };

    let debounceId: ReturnType<typeof setTimeout> | undefined;
    const scheduleStart = () => {
      clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        start();
      }, 80);
    };

    start();

    const ro = new ResizeObserver(() => {
      scheduleStart();
    });
    ro.observe(ribbon);
    ro.observe(first);

    const onWinResize = () => scheduleStart();
    window.addEventListener("resize", onWinResize);

    return () => {
      clearTimeout(debounceId);
      window.removeEventListener("resize", onWinResize);
      ro.disconnect();
      tween?.kill();
      gsap.killTweensOf(track);
    };
  }, [items.length, itemsKey]);

  if (!items.length) return null;

  const tickerLabel = lang === "en" ? "Highlights" : "Highlightstrip";

  const copies = Array.from({ length: MARQUEE_MIN_COPIES }, (_, i) => i);

  return (
    <section
      className={`${REVEAL_ITEM} relative z-10 -mb-16 w-full overflow-hidden bg-transparent py-10 sm:py-8`}
      aria-label={tickerLabel}
    >
      <Container className="max-w-none px-0 sm:px-0">
        <div className="relative flex justify-center">
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-16 bg-brand/30 sm:h-20"
            style={{ transform: "translateY(-50%) rotate(-0.42deg)" }}
            aria-hidden
          />
          <div
            ref={ribbonRef}
            className="flex w-max max-w-none origin-center items-center bg-brand py-5 shadow-lg sm:py-6"
            style={{ transform: "rotate(-1.92deg)", minWidth: "125vw" }}
          >
            <div
              ref={trackRef}
              className="flex w-max flex-row flex-nowrap will-change-transform"
              style={{ color: "var(--palette-white)" }}
            >
              {copies.map((i) => (
                <TickerSegments
                  key={i}
                  items={items}
                  keyPrefix={`m${i}`}
                  hideFromA11y={i > 0}
                  innerRef={i === 0 ? firstSetRef : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
