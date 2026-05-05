"use client";

import type { RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { RichText } from "@/components/ui/RichText";
import type { AnnouncementBarSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const TICKER_SPEED_PX_PER_SEC = 68;

/**
 * Figma 907:27 — bar `#3990f0`, wash `rgba(57,144,240,0.29)` @ +0.42° / bar @ −1.92°.
 * Until WordPress exposes a choice, switch preset here or use the dev-only control (development builds).
 */
type AnnouncementBarBgPresetKey =
  | "figma_default"
  | "brand"
  | "navy"
  | "navy_deep"
  | "accent"
  | "brand_soft"
  | "rose"
  | "muted";

type AnnouncementBarBgPreset = {
  label: string;
  /** Solid fill for the main ribbon */
  bar: string;
  /** Tilted wash behind the ribbon (cross effect), ~29% opacity of the bar hue */
  crossWash: string;
};

function rgbTupleFromHex(hex: string): [number, number, number] {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  const v = Number.parseInt(full, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function washFromHex(hex: string, alpha = 0.29): string {
  const [r, g, b] = rgbTupleFromHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const ANNOUNCEMENT_BAR_BG_PRESETS: Record<AnnouncementBarBgPresetKey, AnnouncementBarBgPreset> = {
  figma_default: {
    label: "Figma (#3990f0)",
    bar: "#3990f0",
    crossWash: "rgba(57, 144, 240, 0.29)",
  },
  brand: {
    label: "Brand (#3990f0)",
    bar: "var(--palette-brand)",
    crossWash: washFromHex("#3990f0"),
  },
  navy: {
    label: "Navy (#152951)",
    bar: "var(--palette-navy)",
    crossWash: washFromHex("#152951"),
  },
  navy_deep: {
    label: "Navy deep (#002752)",
    bar: "var(--palette-navy-deep)",
    crossWash: washFromHex("#002752"),
  },
  accent: {
    label: "Accent (#1d5898)",
    bar: "var(--palette-accent)",
    crossWash: washFromHex("#1d5898"),
  },
  brand_soft: {
    label: "Brand soft (#3a8ae4)",
    bar: "var(--palette-brand-soft)",
    crossWash: washFromHex("#3a8ae4"),
  },
  rose: {
    label: "Rose (#d27e91)",
    bar: "var(--palette-rose)",
    crossWash: washFromHex("#d27e91"),
  },
  muted: {
    label: "Muted (#435780)",
    bar: "var(--palette-muted)",
    crossWash: washFromHex("#435780"),
  },
};

const ANNOUNCEMENT_BAR_BACKGROUND_DEFAULT: AnnouncementBarBgPresetKey = "figma_default";

const IS_DEV_BUILD = process.env.NODE_ENV === "development";

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
 * Figma 907:27 — tilted ribbon + opposing wash (“cross”); GSAP marquee.
 */
export function AnnouncementBarSection({ section, lang }: { section: AnnouncementBarSectionT; lang: Locale }) {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const [bgPreset, setBgPreset] = useState<AnnouncementBarBgPresetKey>(ANNOUNCEMENT_BAR_BACKGROUND_DEFAULT);
  const { bar, crossWash } = ANNOUNCEMENT_BAR_BG_PRESETS[bgPreset];

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
  }, [items.length, itemsKey, bgPreset]);

  if (!items.length) return null;

  const tickerLabel = lang === "en" ? "Announcements" : "Aankondigingen";

  const copies = Array.from({ length: MARQUEE_MIN_COPIES }, (_, i) => i);

  return (
    <section
      className="relative z-10 -mb-16 w-full overflow-hidden bg-transparent py-10 sm:py-8"
      aria-label={tickerLabel}
    >
      {IS_DEV_BUILD ? (
        <div className="pointer-events-auto absolute right-3 top-2 z-20 sm:right-6">
          <label className="flex flex-col gap-1 rounded-md bg-white/95 px-2 py-1.5 text-[11px] shadow-md ring-1 ring-navy-deep/15 backdrop-blur-sm">
            <span className="font-medium text-navy-deep">Announcement bar (dev)</span>
            <select
              className="max-w-[220px] rounded border border-muted/40 bg-white px-2 py-1 text-[11px] text-navy-deep"
              value={bgPreset}
              onChange={(e) => setBgPreset(e.target.value as AnnouncementBarBgPresetKey)}
              aria-label="Announcement bar background preset"
            >
              {(Object.keys(ANNOUNCEMENT_BAR_BG_PRESETS) as AnnouncementBarBgPresetKey[]).map((key) => (
                <option key={key} value={key}>
                  {ANNOUNCEMENT_BAR_BG_PRESETS[key].label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="relative mx-auto flex min-h-[104px] w-full items-center justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
        >
          <div className="flex min-w-[128vw] max-w-none origin-center translate-y-[10px] rotate-[0.42deg] items-center justify-center sm:min-w-[134vw]">
            <div className="h-[81px] w-full min-w-full shrink-0" style={{ backgroundColor: crossWash }} />
          </div>
        </div>

        <div className="relative z-10 flex w-full justify-center">
          <div
            ref={ribbonRef}
            className="flex h-[81px] w-max min-w-[125vw] max-w-none origin-center rotate-[-1.92deg] items-center sm:min-w-[130vw]"
            style={{ backgroundColor: bar }}
          >
            <div ref={trackRef} className="flex w-max flex-row flex-nowrap items-center will-change-transform">
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
      </div>
    </section>
  );
}
