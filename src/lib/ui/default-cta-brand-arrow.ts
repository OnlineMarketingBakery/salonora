import type { WpImage } from "@/types/wordpress";

export const BUILT_IN_DEFAULT_CTA_BRAND_ARROW_URL =
  "https://backend.salonora.eu/wp-content/uploads/2026/05/Frame-7.png";

/** True when the arrow should use the local SVG (Figma) instead of a remote raster. */
export function isBuiltInCtaBrandArrow(image: WpImage | null | undefined): boolean {
  const url = image?.url?.trim();
  if (!url) return true;
  if (url.includes("Frame-7.png")) return true;
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_DEFAULT_CTA_BRAND_ARROW_URL?.trim()
      : "";
  return Boolean(fromEnv && url === fromEnv);
}

/** Fallback when Site Options has no `default_cta_brand_arrow` image. */
export function defaultCtaBrandArrowFallback(): WpImage {
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_DEFAULT_CTA_BRAND_ARROW_URL?.trim()
      : "";
  const url =
    fromEnv && fromEnv.length > 8 ? fromEnv : BUILT_IN_DEFAULT_CTA_BRAND_ARROW_URL;
  return { url, alt: "" };
}
