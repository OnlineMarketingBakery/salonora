import dynamic from "next/dynamic";
import { HeroSection } from "@/components/sections/hero/HeroSection";
import { CardsSection } from "@/components/sections/cards/CardsSection";
import { CostComparisonSection } from "@/components/sections/cost-comparison/CostComparisonSection";
import { BenefitsGridSection } from "@/components/sections/benefits-grid/BenefitsGridSection";
import { PricingPackagesSection } from "@/components/sections/pricing-packages/PricingPackagesSection";
import { GuaranteeSplitSection } from "@/components/sections/guarantee-split/GuaranteeSplitSection";
import { StorySplitSection } from "@/components/sections/story-split/StorySplitSection";
import { WhyWeDoThisSection } from "@/components/sections/why-we-do-this";
import { ImageIntroSplitSection } from "@/components/sections/image-intro-split/ImageIntroSplitSection";
import { SalonValuePropositionSection } from "@/components/sections/salon-value-proposition/SalonValuePropositionSection";
import { WhyOwnersChooseSection } from "@/components/sections/why-owners-choose/WhyOwnersChooseSection";
import { WhySalonoraDifferentSection } from "@/components/sections/why-salonora-different/WhySalonoraDifferentSection";
import { WhySalonoraAndersSection } from "@/components/sections/why-salonora-anders/WhySalonoraAndersSection";
import { TestimonialsSection } from "@/components/sections/testimonials/TestimonialsSection";
import { AnnouncementBarSection } from "@/components/sections/announcement-bar/AnnouncementBarSection";
import { ProcessStepsSection } from "@/components/sections/process-steps/ProcessStepsSection";
import { FaqContactSplitSection } from "@/components/sections/faq-contact-split/FaqContactSplitSection";
import { FormEmbedSection } from "@/components/sections/form-embed/FormEmbedSection";
import { LatestPostsSection } from "@/components/sections/latest-posts/LatestPostsSection";
import { BlogPostOverviewSection } from "@/components/sections/blog-post-overview/BlogPostOverviewSection";
import { CaseStudyOverviewSection } from "@/components/sections/case-study-overview/CaseStudyOverviewSection";
import { CtaSection } from "@/components/sections/cta/CtaSection";
import { PricingCtaSection } from "@/components/sections/pricing-cta/PricingCtaSection";
import { RichTextSection } from "@/components/sections/rich-text/RichTextSection";
import { FaqSection } from "@/components/sections/faq/FaqSection";
import { HowItWorksStepsSectionShell } from "@/components/sections/how-it-works-steps/shell";
import { ScrollingTickerSectionShell } from "@/components/sections/scrolling-ticker/shell";

const DesignShowcaseGridSectionLazy = dynamic(
  () =>
    import("@/components/sections/design-showcase-grid").then((mod) => ({
      default: mod.DesignShowcaseGridSection,
    })),
  { ssr: true }
);

const FeatureHighlightGridSectionLazy = dynamic(
  () =>
    import("@/components/sections/feature-highlight-grid").then((mod) => ({
      default: mod.FeatureHighlightGridSection,
    })),
  { ssr: true }
);

const FeatureHighlightSplitSectionLazy = dynamic(
  () =>
    import("@/components/sections/feature-highlight-split").then((mod) => ({
      default: mod.FeatureHighlightSplitSection,
    })),
  { ssr: true }
);

const OriginStorySplitSectionLazy = dynamic(
  () =>
    import("@/components/sections/origin-story-split").then((mod) => ({
      default: mod.OriginStorySplitSection,
    })),
  { ssr: true }
);

const PartnerIntroSplitSectionLazy = dynamic(
  () =>
    import("@/components/sections/partner-intro-split").then((mod) => ({
      default: mod.PartnerIntroSplitSection,
    })),
  { ssr: true }
);

const FounderStorySplitSectionLazy = dynamic(
  () =>
    import("@/components/sections/founder-story-split").then((mod) => ({
      default: mod.FounderStorySplitSection,
    })),
  { ssr: true }
);

const CombinedStrengthsSectionLazy = dynamic(
  () =>
    import("@/components/sections/combined-strengths").then((mod) => ({
      default: mod.CombinedStrengthsSection,
    })),
  { ssr: true }
);

const PricingDualCardsSectionLazy = dynamic(
  () =>
    import("@/components/sections/pricing-dual-cards").then((mod) => ({
      default: mod.PricingDualCardsSection,
    })),
  { ssr: true }
);

const ProblemSolutionSectionLazy = dynamic(
  () =>
    import("@/components/sections/problem-solution").then((mod) => ({
      default: mod.ProblemSolutionSection,
    })),
  { ssr: true }
);

const TalkDualCardsSectionLazy = dynamic(
  () =>
    import("@/components/sections/talk-dual-cards").then((mod) => ({
      default: mod.TalkDualCardsSection,
    })),
  { ssr: true }
);

const TeamBehindSalonoraSectionLazy = dynamic(
  () =>
    import("@/components/sections/team-behind-salonora").then((mod) => ({
      default: mod.TeamBehindSalonoraSection,
    })),
  { ssr: true }
);

const GuaranteesPromiseSplitSectionLazy = dynamic(
  () =>
    import("@/components/sections/guarantees-promise-split").then((mod) => ({
      default: mod.GuaranteesPromiseSplitSection,
    })),
  { ssr: true }
);

const GrowthPlansSplitSectionLazy = dynamic(
  () =>
    import("@/components/sections/growth-plans-split").then((mod) => ({
      default: mod.GrowthPlansSplitSection,
    })),
  { ssr: true }
);

const FoundersBannerSectionLazy = dynamic(
  () =>
    import("@/components/sections/founders-banner").then((mod) => ({
      default: mod.FoundersBannerSection,
    })),
  { ssr: true }
);

const WhoWeAreForSectionLazy = dynamic(
  () =>
    import("@/components/sections/who-we-are-for").then((mod) => ({
      default: mod.WhoWeAreForSection,
    })),
  { ssr: true }
);

const MediaTextChecklistSectionLazy = dynamic(
  () =>
    import("@/components/sections/media-text-checklist").then((mod) => ({
      default: mod.MediaTextChecklistSection,
    })),
  { ssr: true }
);

const FeaturesChecklistSectionLazy = dynamic(
  () =>
    import("@/components/sections/features-checklist").then((mod) => ({
      default: mod.FeaturesChecklistSection,
    })),
  { ssr: true }
);

import type { AnySectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import type { ReactNode } from "react";

type SectionComponent = (props: { section: AnySectionT; lang: Locale }) => ReactNode;

const asSection = (C: (p: { section: never; lang: Locale }) => ReactNode): SectionComponent =>
  C as SectionComponent;

type SectionRegistryShape = Record<AnySectionT["type"], SectionComponent>;

export const sectionRegistry = {
  hero: asSection(HeroSection as (p: { section: never; lang: Locale }) => ReactNode),
  cards: asSection(CardsSection as (p: { section: never; lang: Locale }) => ReactNode),
  cost_comparison: asSection(CostComparisonSection as (p: { section: never; lang: Locale }) => ReactNode),
  benefits_grid: asSection(BenefitsGridSection as (p: { section: never; lang: Locale }) => ReactNode),
  pricing_packages: asSection(PricingPackagesSection as (p: { section: never; lang: Locale }) => ReactNode),
  guarantee_split: asSection(GuaranteeSplitSection as (p: { section: never; lang: Locale }) => ReactNode),
  story_split: asSection(StorySplitSection as (p: { section: never; lang: Locale }) => ReactNode),
  why_we_do_this: asSection(WhyWeDoThisSection as (p: { section: never; lang: Locale }) => ReactNode),
  image_intro_split: asSection(ImageIntroSplitSection as (p: { section: never; lang: Locale }) => ReactNode),
  salon_value_proposition: asSection(SalonValuePropositionSection as (p: { section: never; lang: Locale }) => ReactNode),
  why_owners_choose: asSection(WhyOwnersChooseSection as (p: { section: never; lang: Locale }) => ReactNode),
  why_salonora_different: asSection(WhySalonoraDifferentSection as (p: { section: never; lang: Locale }) => ReactNode),
  why_salonora_anders: asSection(WhySalonoraAndersSection as (p: { section: never; lang: Locale }) => ReactNode),
  testimonials: asSection(TestimonialsSection as (p: { section: never; lang: Locale }) => ReactNode),
  announcement_bar: asSection(AnnouncementBarSection as (p: { section: never; lang: Locale }) => ReactNode),
  process_steps: asSection(ProcessStepsSection as (p: { section: never; lang: Locale }) => ReactNode),
  how_it_works_steps: asSection(HowItWorksStepsSectionShell as (p: { section: never; lang: Locale }) => ReactNode),
  faq_contact_split: asSection(FaqContactSplitSection as (p: { section: never; lang: Locale }) => ReactNode),
  form_embed: asSection(FormEmbedSection as (p: { section: never; lang: Locale }) => ReactNode),
  latest_posts: asSection(LatestPostsSection as (p: { section: never; lang: Locale }) => ReactNode),
  blog_post_overview: asSection(
    BlogPostOverviewSection as (p: { section: never; lang: Locale }) => ReactNode
  ),
  case_study_overview: asSection(
    CaseStudyOverviewSection as (p: { section: never; lang: Locale }) => ReactNode
  ),
  origin_story_split: asSection(
    OriginStorySplitSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  partner_intro_split: asSection(
    PartnerIntroSplitSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  founder_story_split: asSection(
    FounderStorySplitSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  combined_strengths: asSection(
    CombinedStrengthsSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  cta: asSection(CtaSection as (p: { section: never; lang: Locale }) => ReactNode),
  pricing_cta: asSection(PricingCtaSection as (p: { section: never; lang: Locale }) => ReactNode),
  rich_text: asSection(RichTextSection as (p: { section: never; lang: Locale }) => ReactNode),
  faq: asSection(FaqSection as (p: { section: never; lang: Locale }) => ReactNode),
  scrolling_ticker: asSection(
    ScrollingTickerSectionShell as (p: { section: never; lang: Locale }) => ReactNode
  ),
  design_showcase_grid: asSection(
    DesignShowcaseGridSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  feature_highlight_grid: asSection(
    FeatureHighlightGridSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  feature_highlight_split: asSection(
    FeatureHighlightSplitSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  pricing_dual_cards: asSection(
    PricingDualCardsSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  problem_solution: asSection(
    ProblemSolutionSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  talk_dual_cards: asSection(
    TalkDualCardsSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  team_behind_salonora: asSection(
    TeamBehindSalonoraSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  guarantees_promise_split: asSection(
    GuaranteesPromiseSplitSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  growth_plans_split: asSection(
    GrowthPlansSplitSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  founders_banner: asSection(
    FoundersBannerSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  who_we_are_for: asSection(
    WhoWeAreForSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  media_text_checklist: asSection(
    MediaTextChecklistSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
  features_checklist: asSection(
    FeaturesChecklistSectionLazy as (p: { section: never; lang: Locale }) => ReactNode
  ),
} satisfies SectionRegistryShape;

export function getSectionKey(type: string): type is AnySectionT["type"] {
  return type in sectionRegistry;
}
