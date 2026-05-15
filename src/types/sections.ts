import type { WpAcfLink, WpImage } from "./wordpress";
import type { TestimonialDocument } from "./testimonials";
import type { CF7FormDefinition } from "./forms";

export type CtaItem = { text: string; url: WpAcfLink | null };

export type CoreSection = { _key: string; id: string };

/** Hero variant — controls vertical density. `default` keeps existing layout; `compact` is for shorter intro headers (e.g. About-style pages). */
export type HeroVariantT = "default" | "compact";

/** Offer text scale. `large` is the original homepage size (lg:36px); `medium` (lg:30px) and `small` (lg:24px) for inner pages. */
export type HeroOfferTextSizeT = "large" | "medium" | "small";

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
  /** Extra space on the right of the behind-image layer (px). 0 = none. */
  behindImageRightPadding?: number;
  image: WpImage | null;
  /** Optional small line under the eyebrow (e.g. "We are Salonora"). */
  tagline?: string;
  /** Optional small overlay card next to the image (e.g. "From €10 per month…"). HTML allowed. */
  floatingCard?: string;
  /** Layout density. Defaults to "default" (full hero). */
  variant?: HeroVariantT;
  /** Responsive size scale for `offerText`. Defaults to "large" (current homepage). */
  offerTextSize?: HeroOfferTextSizeT;
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
export type PricingPackageItemT = {
  badge: string;
  title: string;
  intro: string;
  includes: PricingPackageInclude[];
  /** Accent line (e.g. €500 / €50) — maps ACF `pricing_title` or legacy `price_line`. */
  pricingTitle: string;
  /** Navy-deep line (e.g. “Stap je nu in?…”) — maps `secondary_title` or legacy `note`. */
  secondaryTitle: string;
  /** Optional body under titles — maps `pricing_paragraph` or legacy `small_print`. */
  pricingParagraph: string;
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

export type GuaranteesPromiseSplitFloatingBadgeT = {
  icon: WpImage | null;
  text: string;
  /** Visual accent for the badge icon background. */
  accent: "brand" | "rose";
  /** Where the floating badge sits over the image. */
  position: "left" | "right";
};

/** Figma: 1127:55 (“Group 596”) — portrait with floating badges + guarantee checklist + download CTA*/
export type GuaranteesPromiseSplitPointT = {
  text: string;
  /** Resolved: row image, else optional section `list_default_icon`. */
  icon: WpImage | null;
};

export type GuaranteesPromiseSplitSectionT = CoreSection & {
  type: "guarantees_promise_split";
  badge: string;
  title: string;
  image: WpImage | null;
  /** Applies to rows with no row-level icon when set. */
  list_default_icon: WpImage | null;
  points: GuaranteesPromiseSplitPointT[];
  floatingBadges: GuaranteesPromiseSplitFloatingBadgeT[];
  downloadLink: WpAcfLink | null;
  /** Trailing graphic on download CTA (e.g. export SVG/PNG/SVG asset from design). */
  cta_trailing_icon: WpImage | null;
};

/** Figma 1144:31 (“Group 599”) — split: collage visual + roadmap copy, upcoming checklist, highlight + pill CTA */
export type GrowthPlansUpcomingItemT = {
  text: string;
  icon: WpImage | null;
};

export type GrowthPlansSplitSectionT = CoreSection & {
  type: "growth_plans_split";
  title: string;
  intro: string;
  upcoming_heading: string;
  list_default_icon: WpImage | null;
  upcoming_items: GrowthPlansUpcomingItemT[];
  body: string;
  highlight_line: string;
  ctas: CtaItem[];
  cta_trailing_icon: WpImage | null;
  decorative_panel: WpImage | null;
  main_visual: WpImage | null;
  floating_circles: WpImage[];
  media_position: "left" | "right";
};

/** Figma 597:3120 (“Frame 2147228004”) — brand banner: founders photos + centered headline + white badge pill */
export type FoundersBannerSectionT = CoreSection & {
  type: "founders_banner";
  headline: string;
  badge_text: string;
  /** Optional: when present with a URL, the pill acts as a link; otherwise same badge styling. */
  pill_link: WpAcfLink | null;
  left_image: WpImage | null;
  right_image: WpImage | null;
};

/** Figma 597:3970 (“Frame 2147228606”) — centered heading + row of audience pills (gradient disc, icon tile, label). */
export type WhoWeAreForItemAccentT = "brand" | "rose";

export type WhoWeAreForItemT = {
  icon: WpImage | null;
  label: string;
  icon_accent: WhoWeAreForItemAccentT;
};

export type WhoWeAreForSectionT = CoreSection & {
  type: "who_we_are_for";
  title: string;
  items: WhoWeAreForItemT[];
  ctas: CtaItem[];
};

/** Figma **693:395** (“Frame 2147229263”) — centered heading + grid of promises: circular icon (brand/rose), title, body. */
export type OurPromisesItemT = {
  icon: WpImage | null;
  title: string;
  description: string;
  icon_accent: WhoWeAreForItemAccentT;
};

export type OurPromisesSectionT = CoreSection & {
  type: "our_promises";
  title: string;
  items: OurPromisesItemT[];
};

export type SplitCopyFramedListRowT = {
  text: string;
  /** Resolved per-row icon, else section `list_default_icon`. `null` uses built-in glyph for the active `list_style`. */
  icon: WpImage | null;
};

/** Unified split: framed photo + copy (replaces legacy `audience_promo_card` + `is_this_for_you` ACF layouts). */
export type SplitCopyFramedSectionT = CoreSection & {
  type: "split_copy_framed";
  /** `card_grid` = padded rounded surface; `flush_flex` = full-width row (legacy is-this). */
  layout_mode: "card_grid" | "flush_flex";
  /** `filled_disc` = promo checklist; `outlined_tile` = editorial checklist. */
  list_style: "filled_disc" | "outlined_tile";
  visual_position: "left" | "right";
  /** Only applies when `layout_mode` is `card_grid`. */
  show_card_shadow: boolean;
  /** Hairline rules above/below the list (legacy is-this). */
  show_list_dividers: boolean;
  /** Legacy is-this inverts the CTA trailing icon for contrast on brand button. */
  cta_trailing_icon_invert: boolean;
  badge_text: string;
  title: string;
  subtitle: string;
  description: string;
  list_default_icon: WpImage | null;
  list: SplitCopyFramedListRowT[];
  footer_note: string;
  button: WpAcfLink | null;
  button_trailing_icon: WpImage | null;
  image: WpImage | null;
};

export type MediaTextChecklistRowT = {
  text: string;
  /** Resolved per-row icon, else section `list_default_icon`. `null` falls back to the built-in brand check. */
  icon: WpImage | null;
};

/** Figma **597:3503** (“Frame 2147228620”) — rounded card: copy + checklist + pricing + CTA; stacked media column for mirror variant (`media_position`). */
export type MediaTextChecklistSectionT = CoreSection & {
  type: "media_text_checklist";
  media_position: "left" | "right";
  /** `soft_surface` ≈ Figma pale blue card; `white_card` = white panel + subtle ring (Kappers-style). */
  panel_style: "soft_surface" | "white_card";
  image_top: WpImage | null;
  image_bottom: WpImage | null;
  title: string;
  subtitle: string;
  description: string;
  checklist_title: string;
  /** Applied to rows with no row-level icon when set. */
  list_default_icon: WpImage | null;
  checklist: MediaTextChecklistRowT[];
  /** Optional testimonial slot rendered between checklist and footer (pricing + CTA). All fields optional; block is hidden when every field is empty. */
  testimonial_heading: string;
  testimonial_body: string;
  testimonial_author_image: WpImage | null;
  testimonial_author_name: string;
  testimonial_author_role: string;
  pricing_label: string;
  button: WpAcfLink | null;
  /** Optional trailing graphic on the primary CTA; default circled arrow when unset. */
  button_trailing_icon: WpImage | null;
};

/** Figma content **597:4037** (“Frame 2147228715”) over decorative shell **597:3568** (“Frame 2147228001”) — centered intro + white checklist rows + masked image with CTA. */
export type FeaturesChecklistRowT = {
  text: string;
  /** Resolved per-row icon, else section `list_default_icon`. `null` falls back to the built-in brand check. */
  icon: WpImage | null;
};

export type FeaturesChecklistSectionT = CoreSection & {
  type: "features_checklist";
  title: string;
  description: string;
  list_default_icon: WpImage | null;
  checklist: FeaturesChecklistRowT[];
  image: WpImage | null;
  button: WpAcfLink | null;
  button_trailing_icon: WpImage | null;
};

export type StorySplitSectionT = CoreSection & {
  type: "story_split";
  image: WpImage | null;
  title: string;
  body: string;
  ctas: CtaItem[];
  showAccentShape: boolean;
};

export type WhyWeDoThisSectionT = CoreSection & {
  type: "why_we_do_this";
  image: WpImage | null;
  /** Optional full-panel decorative overlay (e.g. diagonal shapes from Figma). */
  backgroundGraphic?: WpImage | null;
  /** Optional decorative graphic behind the person (Figma background layer). */
  behindGraphic?: WpImage | null;
  eyebrow: string;
  title: string;
  body: string;
  highlightLine: string;
};

/** Figma **1090:47** (“Group 595”) — blue panel with portrait rows; three stacked story cards (blue / rose top+bottom accents); footer gradient strip */
export type CombinedStrengthsCardAccentT = "brand" | "rose";
export type CombinedStrengthsLeftRowT = { image: WpImage | null; text: string };
export type CombinedStrengthsContentCardT = {
  title: string;
  text: string;
  /** Top/bottom hairline accent; defaults by card index when unset in CMS */
  accent: CombinedStrengthsCardAccentT;
};

export type CombinedStrengthsSectionT = CoreSection & {
  type: "combined_strengths";
  title: string;
  left_rows: CombinedStrengthsLeftRowT[];
  content_cards: CombinedStrengthsContentCardT[];
  footer_logo: WpImage | null;
  footer_text: string;
};

/** Figma 1072:29 — navy visual half with arc + duo photo, pale blue copy half, divider, brand highlight */
export type PartnerIntroSplitSectionT = CoreSection & {
  type: "partner_intro_split";
  title: string;
  body: string;
  /** Mapped from ACF `highlight_line` */
  highlightLine: string;
  image: WpImage | null;
  ctas: CtaItem[];
};

/** Figma 1063:27 — badge + headline + rich text, right masked image with tilted brand panel */
export type OriginStorySplitSectionT = CoreSection & {
  type: "origin_story_split";
  eyebrow: string;
  title: string;
  body: string;
  image: WpImage | null;
  ctas: CtaItem[];
};

/** About page — light gradient card: avatar + title row, brand subtitle, rich text, conclusion; photo + tilted panel (Figma: content `597:2954`, visuals from `597:2279` / `597:2287` / `597:2288`; node `597:2279` alone is only the bg/spark layer). */
export type FounderStorySplitSectionT = CoreSection & {
  type: "founder_story_split";
  avatar: WpImage | null;
  title: string;
  subtitle: string;
  content: string;
  conclusion: string;
  main_image: WpImage | null;
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

export type SalonValueCardChecklistItemT = {
  text: string;
};

export type SalonValueCardT = {
  accent: SalonValueCardAccentT;
  /** Shown on the coloured tile for this card; applies to all checklist lines. */
  icon: WpImage | null;
  /** Optional: same image on every checklist row (replaces default circle + check). */
  checklistIcon: WpImage | null;
  title: string;
  checklistItems: SalonValueCardChecklistItemT[];
};

/** Figma: eyebrow + headline + intro, blue gradient visual, three accent cards. When no panel visual (empty `visualImage`), render centered headline + optional footer CTA pill (597:2910-style). */
export type SalonValuePropositionSectionT = CoreSection & {
  type: "salon_value_proposition";
  eyebrow: string;
  title: string;
  intro: string;
  /** Composite illustration for the gradient panel */
  visualImage: WpImage | null;
  cards: SalonValueCardT[];
  /** Line above the footer CTA (centered variant, when panel visual is empty). */
  footerTitle?: string;
  footerCtaLink?: WpAcfLink | null;
  footerCtaIcon?: WpImage | null;
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
  /** Cards side-by-side per slide at md+ (carousel); mobile stacks within slide. Default 2. */
  items_per_view?: 1 | 2 | 3;
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

/** Figma **1322:32** (“Frame 2147230002”) — brand circle + browser mockup; heading, three steps with dividers, pill CTA. */
export type StepsWithMediaStepIconColorT = "blue" | "pink";

export type StepsWithMediaStepT = {
  number: string;
  icon_color: StepsWithMediaStepIconColorT;
  title: string;
  description: string;
};

export type StepsWithMediaSectionT = CoreSection & {
  type: "steps_with_media";
  title: string;
  steps: StepsWithMediaStepT[];
  cta_link: WpAcfLink | null;
  browser_image: WpImage | null;
};

/** Figma **1397:31** (“Group 605”) — navy rounded panel: pill badge, headline, WYSIWYG body, laptop mockup. */
export type DemoPreviewSplitSectionT = CoreSection & {
  type: "demo_preview_split";
  badge: string;
  title: string;
  body: string;
  mockup_image: WpImage | null;
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
  /** Full-bleed section surface behind FAQ + contact columns. */
  sectionBackground: "white" | "navy";
  title: string;
  intro: string;
  items: FaqItemT[];
  /** Full-width navy pill(s) under the FAQ list; optional trailing icon (e.g. circled arrow). */
  pricingCtas: { text: string; link: WpAcfLink | null; trailing_icon: WpImage | null }[];
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

/** Figma **1417:36** — pale blue shell, centered title + subtitle (ACF), white card, built-in lead form → OMB Form Builder headless REST. */
export type FreeDemoFormSectionT = CoreSection & {
  type: "free_demo_form";
  title: string;
  subtitle: string;
  footer_note: string;
  /** Published `cfb_form` post ID from ACF **`omb_form`** only (not CF7 `form`). */
  ombFormId: number;
  successMode: "inline" | "redirect";
  redirectLink: WpAcfLink | null;
  trackingContext: string;
};

/** Figma **696:4046** — “Is deze demo voor jou?”: two qualification cards, gradient portrait column, navy footer CTA band. */
export type IsDemoForYouListRowT = {
  text: string;
};

export type IsDemoForYouSectionT = CoreSection & {
  type: "is_demo_for_you";
  title: string;
  for_you_heading: string;
  /** Optional: one icon for every row in the “for you” card; built-in check when unset. */
  for_you_list_icon: WpImage | null;
  for_you_list: IsDemoForYouListRowT[];
  not_for_you_heading: string;
  /** Optional: one icon for every row in the “not for you” card; built-in X when unset. */
  not_for_you_list_icon: WpImage | null;
  not_for_you_list: IsDemoForYouListRowT[];
  portrait_image: WpImage | null;
  /** Optional rings / texture over the brand gradient panel. */
  panel_overlay: WpImage | null;
  footer_message: string;
  cta_link: WpAcfLink | null;
  cta_trailing_icon: WpImage | null;
};

export type LatestPostsSectionT = CoreSection & {
  type: "latest_posts";
  title: string;
  source: "post" | "service";
  count: number;
  showExcerpt: boolean;
  items: { id: number; title: string; excerpt: string; href: string }[];
};

/** Resolved post row for blog overview cards (from WordPress in `enrichSections`). */
export type BlogPostOverviewCardT = {
  id: number;
  title: string;
  excerpt: string;
  href: string;
  dateLabel: string;
  authorName: string;
  authorAvatarUrl: string | null;
  readMinutes: number;
  image: { url: string; alt: string } | null;
};

export type BlogPostOverviewSectionT = CoreSection & {
  type: "blog_post_overview";
  title: string;
  intro: string;
  showSearch: boolean;
  showFeatured: boolean;
  /** When set, this post is pinned in the featured slot on page 1 (overrides “newest first”). */
  featuredPostId: number | null;
  postsPerPage: number;
  readMoreLabel: string;
  /** Path without leading slash, same segments as URL after locale (for forms and pagination). */
  archivePath: string;
  items: BlogPostOverviewCardT[];
  total: number;
  totalPages: number;
  currentPage: number;
  searchQuery: string;
};

export type CaseStudyOverviewMetricT = {
  label: string;
  value: string;
};

export type CaseStudyOverviewCardT = {
  id: number;
  title: string;
  excerpt: string;
  href: string;
  image: { url: string; alt: string } | null;
  /** Shown as the brand line above the card title (e.g. “Project: …”). */
  projectLabel: string;
  /** Outcome metrics for the featured block (from CPT ACF); empty on grid cards if unused. */
  metrics: CaseStudyOverviewMetricT[];
};

export type CaseStudyOverviewSectionT = CoreSection & {
  type: "case_study_overview";
  title: string;
  intro: string;
  /** Optional KPI row below the intro (Figma 866:4217). */
  heroStats: CaseStudyOverviewMetricT[];
  showFeatured: boolean;
  featuredCaseStudyId: number | null;
  /** Hero KPI stat row only (1–4); case study card list stays 3 columns at `lg` for now. */
  gridColumns: 1 | 2 | 3 | 4;
  /** Rows of case studies per page; with a fixed 3-column list, `postsPerPage` = `min(50, 3 × gridRows)`. */
  gridRows: number;
  /** Derived from fixed list columns (3) × `gridRows` (used for REST pagination). */
  postsPerPage: number;
  readMoreLabel: string;
  archivePath: string;
  items: CaseStudyOverviewCardT[];
  total: number;
  totalPages: number;
  currentPage: number;
  searchQuery: string;
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

/** Figma 368:339 — gradient intro strip + two pricing package columns */
export type PricingDualCardsFeatureItemT = {
  icon?: WpImage | null;
  text?: string;
};

export type PricingDualCardsCardItemT = {
  /** White elevated card vs tinted panel (surface bg + inverted pills). */
  panel_style?: "white" | "tinted";
  title?: string;
  description?: string;
  features?: PricingDualCardsFeatureItemT[];
  price_highlight?: string;
  price_secondary?: string;
  price_footer?: string;
  ctas?: CtaItem[];
};

export type PricingDualCardsSectionT = CoreSection & {
  type: "pricing_dual_cards";
  badge?: string;
  title?: string;
  intro?: string;
  /** Cut-out on the right of the blue hero (PNG/WebP transparent). */
  hero_person_image?: WpImage | null;
  cards?: PricingDualCardsCardItemT[];
};

/** Figma **1306:29** (“Frame 574”) — two tall rounded cards: navy “problem” vs brand-blue “solution”, TR grid wash, bottom-right cutout portraits; solution card adds checklist rows. */
export type ProblemSolutionListItemT = {
  text: string;
};

export type ProblemSolutionSectionT = CoreSection & {
  type: "problem_solution";
  problem_title: string;
  problem_text: string;
  problem_image: WpImage | null;
  solution_title: string;
  solution_text: string;
  /** Optional: one image used for every checklist row (e.g. calendar icon). Empty = built-in check disc. */
  solution_list_icon: WpImage | null;
  solution_list: ProblemSolutionListItemT[];
  /** Optional WYSIWYG below the checklist (e.g. closing line about reviews). Empty = hidden. */
  solution_bottom_text: string;
  solution_image: WpImage | null;
};

/** Figma **597:2720** (“Frame 2147228539”) — centered headline + two rounded panels (brand gradient vs navy + overlay); primary path CTA + alternate path with demo + download. */
export type TalkDualCardsSectionT = CoreSection & {
  type: "talk_dual_cards";
  title: string;
  left_body: string;
  left_link: WpAcfLink | null;
  left_button_icon: WpImage | null;
  /** Optional decorative graphic (e.g. grid) anchored bottom-right on the brand gradient panel. */
  left_corner_graphic: WpImage | null;
  right_body: string;
  right_primary_link: WpAcfLink | null;
  right_secondary_link: WpAcfLink | null;
  right_primary_button_icon: WpImage | null;
  right_secondary_button_icon: WpImage | null;
  /** Decorative top wave / vector over the navy card (optional). */
  right_overlay_graphic: WpImage | null;
};

export type RichTextSectionT = CoreSection & {
  type: "rich_text";
  title: string;
  body: string;
  contentWidth: "default" | "narrow" | "wide";
};

/** Single case study — narrative block (Figma 879:27 “Probleem”, “Resultaat”, etc.). */
export type CaseStudyChapterSectionT = CoreSection & {
  type: "case_study_chapter";
  heading: string;
  body: string;
  /** Hairline rule under the block (Figma section separators). */
  showDivider: boolean;
  /** Stable anchor for Inhoudsopgave (from ACF row key). */
  tocAnchorId: string;
};

/** Product / UI screenshot: optional title above; optional WYSIWYG description below; optional hairline under block. */
export type CaseStudyProductShotSectionT = CoreSection & {
  type: "case_study_product_shot";
  image: WpImage | null;
  /** Optional headline above the shot (ACF `title`; legacy `caption` merged in normalize). */
  title: string;
  /** Optional body under the image (ACF `description`). */
  description: string;
  /** Hairline rule under the block (ACF `show_divider_after`; same as Chapter). */
  showDivider: boolean;
};

/** Client quote + optional video (Figma “Klantenrecensie”). */
export type CaseStudyClientReviewSectionT = CoreSection & {
  type: "case_study_client_review";
  sectionHeading: string;
  quote: string;
  videoUrl: string;
  videoPoster: WpImage | null;
  personName: string;
  personRole: string;
  personPhoto: WpImage | null;
  /** Stable anchor for Inhoudsopgave (from ACF row `_key`). */
  tocAnchorId: string;
};

/** Mid-page conversion band (Figma navy rounded CTA). */
export type CaseStudyConversionCtaSectionT = CoreSection & {
  type: "case_study_conversion_cta";
  title: string;
  subtitle: string;
  cta: WpAcfLink | null;
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

export type TeamBehindSalonoraMemberAccentT = "brand" | "rose";

export type TeamBehindSalonoraMemberT = {
  name: string;
  bio: string;
  photo: WpImage | null;
  accent: TeamBehindSalonoraMemberAccentT;
  facebook?: WpAcfLink | null;
  instagram?: WpAcfLink | null;
  linkedin?: WpAcfLink | null;
};

/** Figma: composite section on About page — background `597:2404`, wordmark `597:2719`, content/cards `597:2975` (“Het Team Achter Salonora”). */
export type TeamBehindSalonoraSectionT = CoreSection & {
  type: "team_behind_salonora";
  title: string;
  members: TeamBehindSalonoraMemberT[];
  bottomText: string;
  /** Optional background wordmark image (Figma “THE TEAM”). */
  backgroundWordmark?: WpImage | null;
  /** Optional bubble/grid overlay layer (Figma background frame `597:2404`). */
  backgroundOverlay?: WpImage | null;
  /** Optional corner decoration images. */
  cornerTopRight?: WpImage | null;
  cornerBottomLeft?: WpImage | null;
  cornerLinesTopLeft?: WpImage | null;
  cornerLinesBottomRight?: WpImage | null;
};

export type AnySectionT =
  | HeroSectionT
  | CardsSectionT
  | CostComparisonSectionT
  | BenefitsGridSectionT
  | PricingPackagesSectionT
  | GuaranteeSplitSectionT
  | GuaranteesPromiseSplitSectionT
  | GrowthPlansSplitSectionT
  | FoundersBannerSectionT
  | WhoWeAreForSectionT
  | OurPromisesSectionT
  | FeaturesChecklistSectionT
  | MediaTextChecklistSectionT
  | StorySplitSectionT
  | WhyWeDoThisSectionT
  | CombinedStrengthsSectionT
  | PartnerIntroSplitSectionT
  | OriginStorySplitSectionT
  | FounderStorySplitSectionT
  | ImageIntroSplitSectionT
  | IsDemoForYouSectionT
  | SalonValuePropositionSectionT
  | WhyOwnersChooseSectionT
  | WhySalonoraDifferentSectionT
  | WhySalonoraAndersSectionT
  | TestimonialsSectionT
  | AnnouncementBarSectionT
  | ProcessStepsSectionT
  | HowItWorksStepsSectionT
  | ScrollingTickerSectionT
  | SplitCopyFramedSectionT
  | StepsWithMediaSectionT
  | DesignShowcaseGridSectionT
  | DemoPreviewSplitSectionT
  | FaqContactSplitSectionT
  | FormEmbedSectionT
  | FreeDemoFormSectionT
  | LatestPostsSectionT
  | BlogPostOverviewSectionT
  | CaseStudyOverviewSectionT
  | CtaSectionT
  | PricingCtaSectionT
  | PricingDualCardsSectionT
  | ProblemSolutionSectionT
  | TalkDualCardsSectionT
  | RichTextSectionT
  | CaseStudyChapterSectionT
  | CaseStudyProductShotSectionT
  | CaseStudyClientReviewSectionT
  | CaseStudyConversionCtaSectionT
  | FaqSectionT
  | FeatureHighlightGridSectionT
  | FeatureHighlightSplitSectionT
  | TeamBehindSalonoraSectionT;

export type LatestPostResolved = { id: number; title: string; excerpt: string; href: string };
