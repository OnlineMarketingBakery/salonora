import { HeroSection } from "@/components/sections/hero/HeroSection";
import { CardsSection } from "@/components/sections/cards/CardsSection";
import { CostComparisonSection } from "@/components/sections/cost-comparison/CostComparisonSection";
import { BenefitsGridSection } from "@/components/sections/benefits-grid/BenefitsGridSection";
import { PricingPackagesSection } from "@/components/sections/pricing-packages/PricingPackagesSection";
import { GuaranteeSplitSection } from "@/components/sections/guarantee-split/GuaranteeSplitSection";
import { StorySplitSection } from "@/components/sections/story-split/StorySplitSection";
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
import { CtaSection } from "@/components/sections/cta/CtaSection";
import { PricingCtaSection } from "@/components/sections/pricing-cta/PricingCtaSection";
import { RichTextSection } from "@/components/sections/rich-text/RichTextSection";
import { FaqSection } from "@/components/sections/faq/FaqSection";
import { HowItWorksStepsSectionShell } from "@/components/sections/how-it-works-steps/shell";
import { ScrollingTickerSectionShell } from "@/components/sections/scrolling-ticker/shell";

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
  cta: asSection(CtaSection as (p: { section: never; lang: Locale }) => ReactNode),
  pricing_cta: asSection(PricingCtaSection as (p: { section: never; lang: Locale }) => ReactNode),
  rich_text: asSection(RichTextSection as (p: { section: never; lang: Locale }) => ReactNode),
  faq: asSection(FaqSection as (p: { section: never; lang: Locale }) => ReactNode),
  scrolling_ticker: asSection(
    ScrollingTickerSectionShell as (p: { section: never; lang: Locale }) => ReactNode
  ),
} satisfies SectionRegistryShape;

export function getSectionKey(type: string): type is AnySectionT["type"] {
  return type in sectionRegistry;
}
