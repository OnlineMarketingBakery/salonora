/**
 * Mega-menu preview images for "Wie wij bedienen" / Who we serve (Figma: node 953:32–953:42).
 * Sources are Figma MCP asset URLs — replace with `/public/...` files when exporting final assets.
 */
const PREVIEW_ORDERED = [
  "https://www.figma.com/api/mcp/asset/03287b6a-8a68-4fde-82a2-a8b3c1bb7980",
  "https://www.figma.com/api/mcp/asset/ee0aa1e1-e0bc-4ebb-8dc2-d563d294d2a8",
  "https://www.figma.com/api/mcp/asset/ff28e6aa-e5fe-4a61-80ef-7c9ed8842c9b",
  "https://www.figma.com/api/mcp/asset/4a381387-be67-4a08-8258-a0d11382b523",
  "https://www.figma.com/api/mcp/asset/90d79b4b-0ee5-4af4-89ca-a6c1c8d2b138",
] as const;

let prefetchStarted = false;

/**
 * Warm browser cache for all mega-menu previews (once per tab).
 * Runs on idle so it does not compete with first paint.
 */
export function prefetchWhoWeServeMegaPreviews(): void {
  if (prefetchStarted || typeof window === "undefined") return;
  prefetchStarted = true;

  const run = () => {
    for (const url of PREVIEW_ORDERED) {
      const img = new Image();
      img.src = url;
      if (typeof img.decode === "function") {
        void img.decode().catch(() => {
          /* ignore decode errors (CORS / unsupported) */
        });
      }
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
