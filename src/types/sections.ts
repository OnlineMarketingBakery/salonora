import type { WpAcfLink, WpImage } from "./wordpress";
import type { TestimonialDocument } from "./testimonials";
import type { CF7FormDefinition } from "./forms";

export type CtaItem = { text: string; url: WpAcfLink | null };

export type CoreSection = { _key: string; id: string };

export type HeroSectionT = CoreSection & {
  type: "hero";
  eyebrow: string;
  title: string;
  text: string;
  offerText: string;
  /** Optional: line next to avatars + stars, e.g. "Al 100+ salon-eigenaren…" */
  trustLine: string;
  ctas: CtaItem[];
  trustImage: WpImage | null;
  /** Large visual behind the foreground person (e.g. product UI), optional */
  behindImage: WpImage | null;
  image: WpImage | null;
};

export type CardItemT = {
  icon: WpImage | null;
  title: string;
  text: string;
  link: WpAcfLink | null;
  ctaText: string;
  /** Optional subline under the CTA on the highlighted (dark) card, Figma */
  ctaSubtext: string;
  highlight: boolean;
};

export type CardsSectionT = CoreSection & {
  type: "cards";
  title: string;
  columns: "2" | "3" | "4" | "6";
  items: CardItemT[];
};

export type LossItem = { label: string; value: string };

export type CostComparisonSectionT = CoreSection & {
  type: "cost_comparison";
  title: string;
  text: string;
  /** e.g. “Wekelijkse verliezen zonder Salonora” (comparison card) */
  lossCardTitle: string;
  ctas: CtaItem[];
  lossItems: LossItem[];
  priceLabel: string;
  price: string;
  priceSubtext: string;
};

export type BenefitItem = { icon: WpImage | null; title: string; text: string };

export type BenefitsGridSectionT = CoreSection & {
  type: "benefits_grid";
  eyebrow: string;
  title: string;
  intro: string;
  items: BenefitItem[];
  urgencyText: string;
  bannerLeftImage: WpImage | null;
  bannerRightImage: WpImage | null;
  bannerText: string;
  ctas: CtaItem[];
};

export type PricingPackageInclude = { icon: WpImage | null; text: string };
export type SolvesItem = { icon: WpImage | null; text: string };
export type PricingPackageItemT = {
  badge: string;
  title: string;
  intro: string;
  priceLine: string;
  includes: PricingPackageInclude[];
  solvesTitle: string;
  solvesItems: SolvesItem[];
  note: string;
  smallPrint: string;
  featured: boolean;
  ctas: CtaItem[];
};

export type PricingPackagesSectionT = CoreSection & {
  type: "pricing_packages";
  eyebrow: string;
  title: string;
  intro: string;
  items: PricingPackageItemT[];
  bottomNote: string;
  ctas: CtaItem[];
};

export type GuaranteePointT = { icon: WpImage | null; text: string };
export type GuaranteeSplitSectionT = CoreSection & {
  type: "guarantee_split";
  image: WpImage | null;
  title: string;
  text: string;
  points: GuaranteePointT[];
  ctas: CtaItem[];
  mediaPosition: "left" | "right";
};

export type StorySplitSectionT = CoreSection & {
  type: "story_split";
  image: WpImage | null;
  title: string;
  body: string;
  ctas: CtaItem[];
  showAccentShape: boolean;
};

export type ImageIntroSplitRowT = { icon: WpImage | null; text: string };

export type ImageIntroSplitSectionT = CoreSection & {
  type: "image_intro_split";
  /** Visual on the left */
  image: WpImage | null;
  eyebrow: string;
  title: string;
  intro: string;
  /** Icon + emphasis line(s) below the divider */
  imageTextRows: ImageIntroSplitRowT[];
};

export type SalonValueCardAccentT = "brand" | "rose";

export type SalonValueCardT = {
  accent: SalonValueCardAccentT;
  icon: WpImage | null;
  title: string;
  text: string;
};

/** Figma: eyebrow + headline + intro, blue gradient visual, three accent cards */
export type SalonValuePropositionSectionT = CoreSection & {
  type: "salon_value_proposition";
  eyebrow: string;
  title: string;
  intro: string;
  /** Composite illustration for the gradient panel */
  visualImage: WpImage | null;
  cards: SalonValueCardT[];
};

/** Figma: centered header, light panel + stacked feature cards, navy CTA panel with optional composite art */
export type WhyOwnersChooseCardT = {
  accent: SalonValueCardAccentT;
  icon: WpImage | null;
  title: string;
  text: string;
};

export type WhyOwnersChooseSectionT = CoreSection & {
  type: "why_owners_choose";
  eyebrow: string;
  title: string;
  cards: WhyOwnersChooseCardT[];
  panelTitle: string;
  panelText: string;
  panelImage: WpImage | null;
  ctas: CtaItem[];
};

/** Figma: light blue section, left copy + CTA, right gradient panel with “Wist je dat”, white insight cards, phone mockup */
export type WhySalonoraDifferentInsightCardT = { text: string };

export type WhySalonoraDifferentSectionT = CoreSection & {
  type: "why_salonora_different";
  title: string;
  paragraph1: string;
  paragraph2: string;
  ctas: CtaItem[];
  insightHeading: string;
  insightCards: WhySalonoraDifferentInsightCardT[];
  phoneImage: WpImage | null;
};

/** Same UI as `why_salonora_different`; separate ACF layout (Figma 754:35). */
export type WhySalonoraAndersInsightCardT = { text: string };

export type WhySalonoraAndersSectionT = CoreSection & {
  type: "why_salonora_anders";
  title: string;
  paragraph1: string;
  paragraph2: string;
  ctas: CtaItem[];
  insightHeading: string;
  insightCards: WhySalonoraAndersInsightCardT[];
  phoneImage: WpImage | null;
};

export type TestimonialsSectionT = CoreSection & {
  type: "testimonials";
  title: string;
  intro: string;
  ctas: CtaItem[];
  items: TestimonialDocument[];
  /** Filled in during server enrichment from the relationship field */
  testimonialIds: number[];
};

export type AnnouncementBarSectionT = CoreSection & {
  type: "announcement_bar";
  items: { text: string }[];
};

export type ProcessStepItemT = {
  number: string;
  title: string;
  text: string;
  highlight: boolean;
};

export type ProcessStepsSectionT = CoreSection & {
  type: "process_steps";
  title: string;
  intro: string;
  smallText: string;
  items: ProcessStepItemT[];
  ctas: CtaItem[];
};

/** Icon tile accent for “How it works” step cards (Figma: brand blue vs rose). */
export type HowItWorksStepsIconAccentT = "brand" | "rose";

export type HowItWorksStepsStepItemT = {
  icon?: WpImage | null;
  iconAccent?: HowItWorksStepsIconAccentT;
  title?: string;
  /** HTML / line breaks from CMS */
  description?: string;
};

/** Figma 346:6578 — badge, headline, three icon cards, CTA pill, footer highlights line */
export type HowItWorksStepsSectionT = CoreSection & {
  type: "how_it_works_steps";
  badge?: string;
  title?: string;
  steps?: HowItWorksStepsStepItemT[];
  ctas?: CtaItem[];
  footerTagline?: string;
};

/** Figma 907:27 — tilted brand ribbon, star separators, infinite ticker phrases */
export type ScrollingTickerItemT = { text?: string };

export type ScrollingTickerSectionT = CoreSection & {
  type: "scrolling_ticker";
  items?: ScrollingTickerItemT[];
};

/** Figma 909:31 — headline, intro row, service-driven cards, footer pill CTA */
export type DesignShowcaseGridCardTint = "surface" | "blush" | "mint" | "gold";

/** Populated in `enrichSections` from the Service CPT (featured image, title, permalink). */
export type DesignShowcaseGridCardT = {
  visual: WpImage | null;
  titleHtml: string;
  href: string;
  panelTint?: DesignShowcaseGridCardTint;
};

export type DesignShowcaseGridSectionT = CoreSection & {
  type: "design_showcase_grid";
  title?: string;
  intro?: string;
  /** Horizontal bands of cards (≥1). Total services loaded = rows × columns. */
  gridRows: number;
  /** Desktop/tablet columns (max 3); mobile stays one column until breakpoints. */
  gridColumns: 1 | 2 | 3;
  /** WordPress REST `per_page` (= gridRows × gridColumns). */
  count: number;
  /** Full-width band behind section content (cards stay white). */
  whiteBackground?: boolean;
  /** Panel tint applied to every auto-generated card. */
  cardPanelTint?: DesignShowcaseGridCardTint;
  cards: DesignShowcaseGridCardT[];
  footerCtas?: CtaItem[];
};

export type FaqItemT = { question: string; answer: string };

export type FaqContactSplitSectionT = CoreSection & {
  type: "faq_contact_split";
  title: string;
  intro: string;
  items: FaqItemT[];
  pricingCtas: { icon: WpImage | null; text: string; link: WpAcfLink | null }[];
  cardTitle: string;
  cardText: string;
  contactCtas: { icon: WpImage | null; ctaText: string; ctaLink: WpAcfLink | null }[];
  ctaform: string;
  customForm: { id: number } | null;
  useForm: boolean;
  formDefinition: CF7FormDefinition | null;
  /** Resolved default CF7 id when form mode is active */
  defaultFormId: number | null;
};

export type FormEmbedSectionT = CoreSection & {
  type: "form_embed";
  title: string;
  intro: string;
  formId: number;
  formDefinition: CF7FormDefinition | null;
  successMode: "inline" | "redirect";
  redirectLink: WpAcfLink | null;
  trackingContext: string;
};

export type LatestPostsSectionT = CoreSection & {
  type: "latest_posts";
  title: string;
  source: "post" | "service";
  count: number;
  showExcerpt: boolean;
  items: { id: number; title: string; excerpt: string; href: string }[];
};

export type CtaSectionT = CoreSection & {
  type: "cta";
  title: string;
  text: string;
  ctas: CtaItem[];
  alignment: "left" | "center";
  theme?: "light" | "dark" | "brand";
  backgroundImage?: WpImage | null;
  /** single-link variant from post/service flexible content */
  singleLink?: WpAcfLink | null;
};

export type PricingCtaCard = {
  title: string;
  description: string;
  ctas: CtaItem[];
};

export type PricingCtaSectionT = CoreSection & {
  type: "pricing_cta";
  title: string;
  intro: string;
  cardsTitle: string;
  pricingCards: PricingCtaCard[];
  bottomContactText: string;
};

export type RichTextSectionT = CoreSection & {
  type: "rich_text";
  title: string;
  body: string;
  contentWidth: "default" | "narrow" | "wide";
};

export type FaqSectionT = CoreSection & {
  type: "faq";
  title: string;
  items: FaqItemT[];
};

/** Figma 939:58 — navy band, pill badge, headline, bordered highlight cards with divider */
export type FeatureHighlightGridCardT = {
  title?: string;
  /** Optional illustration behind card content (bottom glow area). */
  visual?: WpImage | null;
  description?: string;
};

export type FeatureHighlightGridSectionT = CoreSection & {
  type: "feature_highlight_grid";
  badge?: string;
  title?: string;
  cards?: FeatureHighlightGridCardT[];
};

/** Figma 946:34 — light gradient band: badge + headline + CTA, center mockup, stacked promise cards */
export type FeatureHighlightSplitPromiseItemT = {
  text?: string;
};

export type FeatureHighlightSplitSectionT = CoreSection & {
  type: "feature_highlight_split";
  badge?: string;
  title?: string;
  ctas?: CtaItem[];
  mockup_image?: WpImage | null;
  promise_items?: FeatureHighlightSplitPromiseItemT[];
};

export type AnySectionT =
  | HeroSectionT
  | CardsSectionT
  | CostComparisonSectionT
  | BenefitsGridSectionT
  | PricingPackagesSectionT
  | GuaranteeSplitSectionT
  | StorySplitSectionT
  | ImageIntroSplitSectionT
  | SalonValuePropositionSectionT
  | WhyOwnersChooseSectionT
  | WhySalonoraDifferentSectionT
  | WhySalonoraAndersSectionT
  | TestimonialsSectionT
  | AnnouncementBarSectionT
  | ProcessStepsSectionT
  | HowItWorksStepsSectionT
  | ScrollingTickerSectionT
  | DesignShowcaseGridSectionT
  | FaqContactSplitSectionT
  | FormEmbedSectionT
  | LatestPostsSectionT
  | CtaSectionT
  | PricingCtaSectionT
  | RichTextSectionT
  | FaqSectionT
  | FeatureHighlightGridSectionT
  | FeatureHighlightSplitSectionT;

export type LatestPostResolved = { id: number; title: string; excerpt: string; href: string };
