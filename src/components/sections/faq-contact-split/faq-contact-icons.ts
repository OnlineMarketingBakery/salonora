import type { WpImage } from "@/types/wordpress";

/** Figma 597:3927 / 597:3934 — 28×28 glyphs inside 50px brand circle. */
export const FAQ_CONTACT_MAIL_ICON = "/faq-contact-mail.png";
export const FAQ_CONTACT_PHONE_ICON = "/faq-contact-phone.svg";

/** Figma 597:3915 — 37×37 circled arrow on navy pricing CTA. */
export const FAQ_PRICING_CTA_ARROW = "/faq-pricing-cta-arrow.png";

export function getWpImageDimensions(image: WpImage | null | undefined): { w: number; h: number } | null {
  if (!image || typeof image === "string") return null;
  const w = image.width ?? 0;
  const h = image.height ?? 0;
  if (w > 0 && h > 0) return { w, h };
  return null;
}

/** CMS uploads are often full tiles (circle + glyph). Skip the extra brand wrapper when true. */
export function isCompositeIconTile(image: WpImage | null | undefined, minSide = 32): boolean {
  const dim = getWpImageDimensions(image);
  if (!dim) return false;
  return Math.min(dim.w, dim.h) >= minSide;
}

/** WP SVG/PNG glyphs (often 0×0 in REST) — render inside the brand circle, not as a full tile. */
export function shouldUseCmsContactGlyph(
  image: WpImage | null | undefined,
  minCompositeSide = 40
): boolean {
  if (!image || isCompositeIconTile(image, minCompositeSide)) return false;
  if (typeof image === "string") return image.trim().length > 0;
  return Boolean(image.url?.trim() || image.id);
}
