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
  | TestimonialsSectionT
  | AnnouncementBarSectionT
  | ProcessStepsSectionT
  | FaqContactSplitSectionT
  | FormEmbedSectionT
  | LatestPostsSectionT
  | CtaSectionT
  | PricingCtaSectionT
  | RichTextSectionT
  | FaqSectionT;

export type LatestPostResolved = { id: number; title: string; excerpt: string; href: string };
