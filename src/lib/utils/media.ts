import type { WpImage } from "@/types/wordpress";

function sizeEntryUrl(
  e: string | { url: string; width?: number; height?: number } | undefined
): string | null {
  if (!e) return null;
  if (typeof e === "string") return e;
  if (typeof e === "object" && e.url) return e.url;
  return null;
}

/**
 * ACF/REST `url` is often a smaller generated size. For crisp logos/badges, use
 * the largest `sizes` entry (full, 1536, large, …) so `next/image` is not
 * up‑scaling a thumbnail.
 */
export function getLargestImageUrl(image: WpImage | null | undefined): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  const sizes = image.sizes;
  if (sizes && typeof sizes === "object") {
    for (const key of ["full", "2048x2048", "1536x1536", "large", "medium_large", "medium"] as const) {
      const u = sizeEntryUrl(sizes[key] as { url: string } | string | undefined);
      if (u) return u;
    }
  }
  return image.url || null;
}

export function getImageUrl(image: WpImage | null | undefined): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  return image.url || null;
}

export function getImageAlt(image: WpImage | null | undefined): string {
  if (!image) return "";
  if (typeof image === "string") return "";
  return image.alt || image.title || "";
}
