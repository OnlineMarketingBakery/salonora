/**
 * Vertical section band padding — aligned with homepage Figma rhythm (1714:110).
 *
 * Use these on `<section>` shells instead of one-off py-* values so multi-page
 * routes (home, over-ons, etc.) stay visually consistent.
 */

/** Default white band — design_showcase_grid, faq_contact_split, combined_strengths. */
export const SECTION_SHELL_WHITE = "py-16 md:py-24";

/** White band after a split row — tighter top, standard bottom. */
export const SECTION_SHELL_WHITE_TIGHT_TOP =
  "pt-4 pb-16 sm:pt-6 sm:pb-20 md:pt-6 md:pb-24";

/** First content band after a hero — image_intro_split on homepage. */
export const SECTION_SHELL_AFTER_HERO =
  "pt-10 pb-8 sm:pt-12 sm:pb-10 md:pt-14 md:pb-12";

/** Split copy + media rows — why_owners_choose on homepage. */
export const SECTION_SHELL_SPLIT =
  "pt-12 pb-16 sm:pt-14 sm:pb-20 md:pt-16 md:pb-24";

/** Split row before a closing banner — standard top, tighter bottom. */
export const SECTION_SHELL_SPLIT_TIGHT_BOTTOM =
  "pt-12 pb-6 sm:pt-14 sm:pb-8 md:pt-16 md:pb-10";

/** Split row following a tight section — reduced top air on mobile, standard bottom. */
export const SECTION_SHELL_SPLIT_TIGHT_TOP =
  "pt-4 pb-16 sm:pt-6 sm:pb-20 md:pt-16 md:pb-24";

/** Pale surface band — how_it_works_steps on homepage. */
export const SECTION_SHELL_SURFACE = "pt-14 pb-20 md:pt-20 md:pb-28";

/** Dark navy band — faq_contact_split (navy), feature blocks. */
export const SECTION_SHELL_DARK = "py-16 sm:py-20 md:py-24";

/** Guarantee-style split — guarantee_split on homepage. */
export const SECTION_SHELL_GUARANTEE = "py-20 md:py-24";

/** Guarantee split before dual-card CTA — standard top, slightly tighter bottom. */
export const SECTION_SHELL_GUARANTEE_TIGHT_BOTTOM =
  "pt-20 pb-14 md:pt-24 md:pb-16";

/** Dual-card CTA row — faq_contact_split / talk_dual_cards. */
export const SECTION_SHELL_DUAL_CARDS = "py-16 sm:py-20 md:py-24";

/** Dual-card row after a split section — less top air, same bottom as dual cards. */
export const SECTION_SHELL_DUAL_CARDS_TIGHT_TOP =
  "pt-6 pb-16 sm:pt-8 sm:pb-20 md:pt-8 md:pb-24";

/** White faq_contact_split — tight top after split; modest bottom before our_promises. */
export const SECTION_SHELL_FAQ_WHITE =
  "pt-6 pb-12 sm:pt-8 sm:pb-14 md:pt-8 md:pb-16";

/** our_promises — reduced top when paired with FAQ; standard bottom before next band. */
export const SECTION_SHELL_OUR_PROMISES =
  "pt-10 pb-16 sm:pt-12 sm:pb-20 md:pt-12 md:pb-20 lg:pb-[4.5rem]";

/** Testimonial carousel band — homepage testimonials section. */
export const SECTION_SHELL_TESTIMONIALS =
  "pt-10 pb-16 sm:pt-12 sm:pb-20 md:pt-14 md:pb-24";

/** audience_promo_card (split_copy_framed card_grid) — compact top; room before pricing band. */
export const SECTION_SHELL_AUDIENCE_PROMO_CARD =
  "pt-7 pb-14 sm:pt-8 sm:pb-16 md:pt-8 md:pb-20";

/** salon_value_proposition simple layout. */
export const SECTION_SHELL_SALON_VALUE_SIMPLE =
  "pt-16 pb-12 sm:pt-20 sm:pb-14 md:pt-24 md:pb-16";

/** pricing_dual_cards — standard top; modest bottom before salon_value_proposition. */
export const SECTION_SHELL_PRICING_DUAL =
  "pb-8 pt-12 sm:pb-10 sm:pt-14 lg:pb-12 lg:pt-[112px]";

/** salon_value_proposition featured / split — tighter top when following pricing; tight bottom when paired. */
export const SECTION_SHELL_SALON_VALUE_FEATURED =
  "pt-10 pb-6 sm:pt-12 sm:pb-7 md:pt-12 md:pb-8";
