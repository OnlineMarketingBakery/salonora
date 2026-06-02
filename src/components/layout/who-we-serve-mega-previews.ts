/**
 * Mega-menu preview images for "Wie wij bedienen" / Who we serve (Figma: node 953:32–953:42).
 */
const PREVIEW_ORDERED = [
  "/who-we-serve-mega/barbershops.jpg",
  "/who-we-serve-mega/kapperszaken.jpg",
  "/who-we-serve-mega/nagelsalons-manicures.jpg",
  "/who-we-serve-mega/pedicures.jpg",
  "/who-we-serve-mega/massage-salons.jpg",
] as const;

let prefetchStarted = false;

/** Warm browser cache for all mega-menu previews (once per tab). */
export function prefetchWhoWeServeMegaPreviews(): void {
  if (prefetchStarted || typeof window === "undefined") return;
  prefetchStarted = true;

  const run = () => {
    for (const url of PREVIEW_ORDERED) {
      const img = new Image();
      img.src = url;
    }
  };

  const win = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
  };
  if (typeof win.requestIdleCallback === "function") {
    win.requestIdleCallback(run, { timeout: 2500 });
  } else {
    window.setTimeout(run, 400);
  }
}

const PREVIEW_BY_SLUG: Record<string, (typeof PREVIEW_ORDERED)[number]> = {
  barbershops: PREVIEW_ORDERED[0],
  barbershop: PREVIEW_ORDERED[0],
  kapperszaken: PREVIEW_ORDERED[1],
  kapsalon: PREVIEW_ORDERED[1],
  nagelsalons: PREVIEW_ORDERED[2],
  manicures: PREVIEW_ORDERED[2],
  "nagelsalons-manicures": PREVIEW_ORDERED[2],
  pedicures: PREVIEW_ORDERED[3],
  pedicure: PREVIEW_ORDERED[3],
  "massage-salons": PREVIEW_ORDERED[4],
  "massage-salon": PREVIEW_ORDERED[4],
  massagesalons: PREVIEW_ORDERED[4],
};

function lastPathSegment(href: string): string {
  const path = href.split("?")[0]?.replace(/\/$/, "") ?? "";
  const parts = path.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  return last.toLowerCase();
}

export function isWhoWeServeMegaMenuParent(item: { label: string; href: string }): boolean {
  const h = item.href.toLowerCase();
  if (h.includes("wie-wij-bedienen") || h.includes("who-we-serve")) return true;
  const t = item.label.toLowerCase();
  return t.includes("wie wij bedienen") || t.includes("who we serve");
}

export function megaPreviewForChild(href: string, fallbackIndex: number): string {
  const seg = lastPathSegment(href);
  const mapped = PREVIEW_BY_SLUG[seg];
  if (mapped) return mapped;
  const i = Math.min(Math.max(0, fallbackIndex), PREVIEW_ORDERED.length - 1);
  return PREVIEW_ORDERED[i];
}
