export type CtaNonBrandVariant = "ctaWhite" | "ctaNavyDeep";

export type CtaAlternateVariant = "ctaBrand" | CtaNonBrandVariant;

export type CtaAlternationLead = "brand" | "white";

/**
 * Alternating marketing CTAs for repeatable lists: brand → (white|navyDeep) → brand → …
 * Use `lead: "white"` when the first pill should be white (e.g. on a saturated brand background).
 * Use `nonBrand: "ctaNavyDeep"` for brand → dark navy pills (e.g. CTA card with two promos).
 */
export function ctaVariantAt(
  index: number,
  lead: CtaAlternationLead = "brand",
  nonBrand: CtaNonBrandVariant = "ctaWhite",
): CtaAlternateVariant {
  const brandOnEven = lead === "brand";
  const useBrand = brandOnEven ? index % 2 === 0 : index % 2 === 1;
  return useBrand ? "ctaBrand" : nonBrand;
}
