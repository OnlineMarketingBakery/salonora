import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { PromoChecklistGlyph } from "@/components/ui/PromoChecklistGlyph";
import type { Locale } from "@/lib/i18n/locales";
import type { WpImage } from "@/types/wordpress";

export type SplitCopyFramedVisualPosition = "left" | "right";

export type SplitCopyFramedVisualLayoutMode = "card_grid" | "flush_flex";

export type SplitChecklistRowModel = {
  text: string;
  icon: WpImage | null;
};

export type SplitChecklistVariant = "filled_disc" | "outlined_tile";

/** Figma **696:3562** promo checklist — white ring + brand check (ignores CMS row icons for this variant). */
function FilledDiscListGlyph({ icon }: { icon: WpImage | null }) {
  void icon;
  return <PromoChecklistGlyph />;
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

/** Figma **1325:36** / **692:194** — 497×556 shell; brand panel **296:2422**; photo mask **296:2424**. */
const FRAMED_PHOTO_LEFT = "3.68%";
const FRAMED_PHOTO_TOP = "3.04%";
const FRAMED_PHOTO_WIDTH = "92.56%";
const FRAMED_PHOTO_HEIGHT = "94.07%";
const FRAMED_BRAND_WIDTH = "92.56%";
const FRAMED_BRAND_HEIGHT = "94.25%";

function FramedTiltedVisual({ image }: { image: WpImage }) {
  return (
    <div className="relative aspect-[497/556] w-[min(100%,497px)] shrink-0">
      {/* Brand backing — rotate -4.13deg; only layer behind photo (no white card stack). */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: FRAMED_BRAND_WIDTH, height: FRAMED_BRAND_HEIGHT }}
        aria-hidden
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-full w-full rotate-[-4.13deg] rounded-[14px] bg-brand" />
        </div>
      </div>

      {/* Photo — rounded 14px mask, object-cover (Figma mask group). */}
      <div
        className="absolute overflow-hidden rounded-[14px]"
        style={{
          left: FRAMED_PHOTO_LEFT,
          top: FRAMED_PHOTO_TOP,
          width: FRAMED_PHOTO_WIDTH,
          height: FRAMED_PHOTO_HEIGHT,
        }}
      >
        <Media
          image={image}
          width={920}
          height={1046}
          className="h-full w-full object-cover object-center"
          sizes="(min-width: 1024px) 460px, 90vw"
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

  const copyWrapperClass =
    layoutMode === "flush_flex"
      ? `${copyOrderMobile} ${copyOrderLg} min-w-0 w-full max-w-full lg:w-auto lg:min-w-0`
      : `${copyOrderMobile} ${copyOrderLg} min-w-0 w-full lg:min-w-0`;

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
        : "flex w-full flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:justify-center lg:gap-x-8 xl:gap-x-10";

  return (
    <section lang={lang} className={sectionClassName?.trim() || "py-16 lg:py-24"}>
      <Container className={containerClassName}>
        <div className={`${cardShell} ${innerClassName ?? ""}`.trim()}>
          {visualNode ? (
            <>
              <div
                className={`${visualOrderMobile} ${visualOrderLg} flex w-[min(100%,497px)] shrink-0 justify-center self-center ${visualInnerClassName ?? ""}`.trim()}
              >
                {visualNode}
              </div>
              <div className={copyWrapperClass.trim()}>
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
