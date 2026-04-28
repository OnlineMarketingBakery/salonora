"use client";

import type { RefObject } from "react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { RichText } from "@/components/ui/RichText";
import type { AnnouncementBarSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const TICKER_SPEED_PX_PER_SEC = 68;

/** Minimum copies of one phrase-set; ribbon is min ~125vw so we need enough width to cover + seamless loop */
const MARQUEE_MIN_COPIES = 8;

/** Figma 324:2889 — four-point sparkle before each phrase */
function TickerSparkle({ className }: { className?: string }) {
  return (
    <svg
      className={`h-8 w-[31px] shrink-0 text-white ${className ?? ""}`}
      width={31}
      height={32}
      viewBox="0 0 31 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M15.5 0L18.2 11.8L30 14.5L18.2 17.2L15.5 29L12.8 17.2L1 14.5L12.8 11.8L15.5 0Z"
      />
    </svg>
  );
}

/** Figma 26px — typography plugin defaults win in CSS order; use ! and [&_] to force size. */
const richTickerClass =
  "prose max-w-none font-sans !text-[26px] !font-medium !leading-[1.1] !text-white " +
  "[&_p]:!my-0 [&_p]:!inline [&_p]:!whitespace-nowrap [&_p]:!text-[26px] [&_p]:!font-medium [&_p]:!leading-[1.1] [&_p]:!text-white " +
  "[&_span]:!text-[26px] [&_span]:!font-medium [&_span]:!leading-[1.1] [&_span]:!text-white " +
  "[&_strong]:!text-[26px] [&_a]:!text-white [&_em]:!text-[26px]";

function TickerSegments({
  items,
  keyPrefix,
  hideFromA11y,
  innerRef,
}: {
  items: AnnouncementBarSectionT["items"];
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
          <RichText html={it.text} className={richTickerClass} />
        </div>
      ))}
    </div>
  );
}

function itemsSignature(items: AnnouncementBarSectionT["items"]): string {
  return items.map((it) => it.text).join("\u0001");
}

function cycleWidthPx(el: HTMLElement): number {
  const w = el.getBoundingClientRect().width;
  return Math.round(w * 1000) / 1000;
}

/**
 * Figma 622:30 — tilted brand ribbon; GSAP infinite marquee (enough copies + stable cycle width).
 */
export function AnnouncementBarSection({ section, lang }: { section: AnnouncementBarSectionT; lang: Locale }) {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);

  const items = section.items;
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

      /** Avoid killing a running loop on sub-pixel / irrelevant layout noise (common cause of “mid-screen” resets). */
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

  const tickerLabel = lang === "en" ? "Announcements" : "Aankondigingen";

  const copies = Array.from({ length: MARQUEE_MIN_COPIES }, (_, i) => i);

  return (
    <section
      className="relative w-full overflow-hidden bg-transparent py-10 sm:py-8 -mb-[4rem]"
      aria-label={tickerLabel}
    >
      <div className="relative z-10 flex justify-center">
        <div
          ref={ribbonRef}
          className="flex w-max min-w-[125vw] max-w-none origin-center -rotate-[1.92deg] items-center bg-brand py-[22px] shadow-[0_8px_32px_rgba(57,144,240,0.35)] sm:min-w-[130vw]"
        >
          <div ref={trackRef} className="flex w-max flex-row flex-nowrap will-change-transform">
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
    </section>
  );
}
