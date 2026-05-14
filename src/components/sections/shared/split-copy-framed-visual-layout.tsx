import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import type { Locale } from "@/lib/i18n/locales";
import type { WpImage } from "@/types/wordpress";

export type SplitCopyFramedVisualPosition = "left" | "right";

export type SplitCopyFramedVisualLayoutMode = "card_grid" | "flush_flex";

export type SplitChecklistRowModel = {
  text: string;
  icon: WpImage | null;
};

export type SplitChecklistVariant = "filled_disc" | "outlined_tile";

/** Figma promo checklist: solid brand disc + optional CMS icon or white check. */
function FilledDiscListGlyph({ icon }: { icon: WpImage | null }) {
  if (icon) {
    return (
      <span className="relative mt-0.5 inline-flex size-[39px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--palette-brand)] p-1.5 [&_img]:object-contain">
        <Media
          image={icon}
          width={39}
          height={39}
          className="h-full w-full"
          sizes="39px"
          preferLargestSource
        />
      </span>
    );
  }
  return (
    <span
      className="relative mt-0.5 inline-flex size-[39px] shrink-0 items-center justify-center rounded-full bg-[var(--palette-brand)]"
      aria-hidden
    >
      <svg
        className="h-[13px] w-[15px] text-[var(--palette-white)]"
        viewBox="0 0 15 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 6.5L5.5 11L14 1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Figma editorial checklist: optional row icon on surface pad, else thin ring + brand check. */
function OutlinedTileListGlyph({ icon }: { icon: WpImage | null }) {
  const surfacePad =
    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px]";

  if (icon) {
    return (
      <span className={`mt-[2px] ${surfacePad} [&_img]:object-contain`}>
        <Media
          image={icon}
          width={39}
          height={39}
          className="h-[39px] max-h-[39px] w-[39px] max-w-[39px]"
          sizes="39px"
          preferLargestSource
        />
      </span>
    );
  }
  return (
    <span className={`relative mt-[2px] ${surfacePad}`} aria-hidden>
      <span className="flex size-[39px] items-center justify-center rounded-full border-2 border-[var(--palette-brand)] bg-[var(--palette-white)]">
        <svg
          className="h-[13px] w-[15px] text-[var(--palette-brand)]"
          viewBox="0 0 15 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 6.5L5.5 11L14 1"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}

export function SplitChecklistRows({
  idPrefix,
  rows,
  variant,
  ulClassName,
  rowTextClassName,
}: {
  idPrefix: string;
  rows: SplitChecklistRowModel[];
  variant: SplitChecklistVariant;
  ulClassName?: string;
  rowTextClassName: string;
}) {
  const Glyph =
    variant === "filled_disc" ? FilledDiscListGlyph : OutlinedTileListGlyph;
  const defaultUl =
    variant === "filled_disc"
      ? "flex list-none flex-col gap-2.5 p-0"
      : "flex list-none flex-col gap-1 p-0";

  return (
    <ul className={ulClassName?.trim() ? ulClassName : defaultUl}>
      {rows.map((row, i) => {
        const line = row.text.trim();
        if (!line) return null;
        return (
          <li key={`${idPrefix}-${i}`} className="flex items-start gap-[7px]">
            <Glyph icon={row.icon} />
            <span className={rowTextClassName}>{line}</span>
          </li>
        );
      })}
    </ul>
  );
}

function FramedTiltedVisual({ image }: { image: WpImage }) {
  /**
   * Fanned stack matching Figma exactly:
   * - White card (front): rotated +3deg CW, leans right at top.
   * - Blue backing (behind): rotated -4deg CCW, leans left at top, centered behind
   *   so it peeks top-left, left edge, bottom-left, and bottom-right.
   */
  return (
    <div className="relative w-[26rem] max-w-full shrink-0">
      {/* Blue backing — centered behind, rotated CCW */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 mx-auto aspect-[460/523] w-[24rem] origin-[50%_50%] rotate-[-4deg] rounded-[16px] bg-[var(--palette-brand)]"
      />
      {/* White card — on top, rotated CW */}
      <div className="relative z-10 aspect-[460/523] w-[24rem] origin-[50%_50%] rotate-[3deg] overflow-hidden rounded-[16px] bg-[var(--palette-white)] shadow-[0px_8px_22px_color-mix(in_srgb,var(--palette-navy-deep)_10%,transparent)]">
        <Media
          image={image}
          width={920}
          height={1046}
          className="h-full w-full object-contain object-center"
          sizes="(min-width: 1024px) 384px, 90vw"
          preferLargestSource
        />
      </div>
    </div>
  );
}

export type SplitCopyFramedVisualLayoutProps = {
  lang: Locale;
  layoutMode: SplitCopyFramedVisualLayoutMode;
  /** Large-screen column order. Mobile order is always visual first when `framedImage` is set. */
  visualPosition: SplitCopyFramedVisualPosition;
  /** When `layoutMode` is `card_grid`, toggles Figma-style card shadow. */
  cardShadow: boolean;
  /** Optional class on outer `<section>`. */
  sectionClassName?: string;
  /** Extra classes on `<Container>`. */
  containerClassName?: string;
  /** Extra classes on the inner layout wrapper (grid / flex shell). */
  innerClassName?: string;
  /** Extra classes on the framed visual column wrapper (e.g. scroll reveal). */
  visualInnerClassName?: string;
  copy: ReactNode;
  framedImage: WpImage | null;
};

/**
 * Shared split layout: copy column + framed photo with rotated brand backing panel.
 * Used by `split_copy_framed` (and legacy WP layouts normalized to it).
 */
export function SplitCopyFramedVisualLayout({
  lang,
  layoutMode,
  visualPosition,
  cardShadow,
  sectionClassName,
  containerClassName,
  innerClassName,
  visualInnerClassName,
  copy,
  framedImage,
}: SplitCopyFramedVisualLayoutProps) {
  const visualOrderMobile = "order-1";
  const copyOrderMobile = "order-2";
  const visualOrderLg = visualPosition === "left" ? "lg:order-1" : "lg:order-2";
  const copyOrderLg = visualPosition === "left" ? "lg:order-2" : "lg:order-1";

  const visualNode = framedImage ? (
    <FramedTiltedVisual image={framedImage} />
  ) : null;

  /** `card_grid` + shadow = white rounded card; `card_grid` + no shadow = flat strip (no card chrome). */
  const isFlatCardGrid = layoutMode === "card_grid" && !cardShadow;

  const cardShell =
    layoutMode === "card_grid" && cardShadow
      ? [
          "rounded-[14px] bg-[var(--palette-white)] p-10 sm:p-12 md:p-14 lg:p-[54px]",
          "grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-x-20 lg:gap-y-10",
          "shadow-[0px_12px_24px_color-mix(in_srgb,var(--palette-muted)_18%,transparent)]",
        ].join(" ")
      : isFlatCardGrid
        ? "grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-x-12 lg:gap-y-10 xl:gap-x-14"
        : "flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-center lg:gap-14";

  return (
    <section
      lang={lang}
      className={`py-16 lg:py-24 ${sectionClassName ?? ""}`.trim()}
    >
      <Container className={containerClassName}>
        <div className={`${cardShell} ${innerClassName ?? ""}`.trim()}>
          {visualNode ? (
            <>
              <div
                className={`${visualOrderMobile} ${visualOrderLg} flex shrink-0 justify-center ${visualInnerClassName ?? ""}`.trim()}
              >
                {visualNode}
              </div>
              <div
                className={`${copyOrderMobile} ${copyOrderLg} min-w-0 lg:w-[28rem] lg:shrink-0`}
              >
                {copy}
              </div>
            </>
          ) : (
            copy
          )}
        </div>
      </Container>
    </section>
  );
}
