import type { WpImage } from "@/types/wordpress";

const BUILT_IN_DEFAULT =
  "https://backend.salonora.eu/wp-content/uploads/2026/05/Frame-7.png";

/** Fallback when Site Options has no `default_cta_brand_arrow` image. */
export function defaultCtaBrandArrowFallback(): WpImage {
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_DEFAULT_CTA_BRAND_ARROW_URL?.trim()
      : "";
  const url = fromEnv && fromEnv.length > 8 ? fromEnv : BUILT_IN_DEFAULT;
  return { url, alt: "" };
}
