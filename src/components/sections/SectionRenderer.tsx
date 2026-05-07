import { sectionRegistry, getSectionKey } from "@/lib/acf/section-registry";
import { assertNever } from "@/lib/utils/assert-never";
import type { AnySectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function SectionRenderer({ sections, lang }: { sections: AnySectionT[]; lang: Locale }) {
  return (
    <>
      {sections.map((section) => {
        if (!getSectionKey(section.type)) return null;
        switch (section.type) {
          case "hero":
            return <sectionRegistry.hero key={section.id} section={section} lang={lang} />;
          case "cards":
            return <sectionRegistry.cards key={section.id} section={section} lang={lang} />;
          case "cost_comparison":
            return <sectionRegistry.cost_comparison key={section.id} section={section} lang={lang} />;
          case "benefits_grid":
            return <sectionRegistry.benefits_grid key={section.id} section={section} lang={lang} />;
          case "pricing_packages":
            return <sectionRegistry.pricing_packages key={section.id} section={section} lang={lang} />;
          case "guarantee_split":
            return <sectionRegistry.guarantee_split key={section.id} section={section} lang={lang} />;
          case "story_split":
            return <sectionRegistry.story_split key={section.id} section={section} lang={lang} />;
          case "why_we_do_this":
            return <sectionRegistry.why_we_do_this key={section.id} section={section} lang={lang} />;
          case "origin_story_split":
            return (
              <sectionRegistry.origin_story_split key={section.id} section={section} lang={lang} />
            );
          case "partner_intro_split":
            return (
              <sectionRegistry.partner_intro_split key={section.id} section={section} lang={lang} />
            );
          case "image_intro_split":
            return <sectionRegistry.image_intro_split key={section.id} section={section} lang={lang} />;
          case "salon_value_proposition":
            return <sectionRegistry.salon_value_proposition key={section.id} section={section} lang={lang} />;
          case "why_owners_choose":
            return <sectionRegistry.why_owners_choose key={section.id} section={section} lang={lang} />;
          case "why_salonora_different":
            return <sectionRegistry.why_salonora_different key={section.id} section={section} lang={lang} />;
          case "why_salonora_anders":
            return <sectionRegistry.why_salonora_anders key={section.id} section={section} lang={lang} />;
          case "testimonials":
            return <sectionRegistry.testimonials key={section.id} section={section} lang={lang} />;
          case "announcement_bar":
            return <sectionRegistry.announcement_bar key={section.id} section={section} lang={lang} />;
          case "process_steps":
            return <sectionRegistry.process_steps key={section.id} section={section} lang={lang} />;
          case "how_it_works_steps":
            return <sectionRegistry.how_it_works_steps key={section.id} section={section} lang={lang} />;
          case "faq_contact_split":
            return <sectionRegistry.faq_contact_split key={section.id} section={section} lang={lang} />;
          case "form_embed":
            return <sectionRegistry.form_embed key={section.id} section={section} lang={lang} />;
          case "latest_posts":
            return <sectionRegistry.latest_posts key={section.id} section={section} lang={lang} />;
          case "cta":
            return <sectionRegistry.cta key={section.id} section={section} lang={lang} />;
          case "pricing_cta":
            return <sectionRegistry.pricing_cta key={section.id} section={section} lang={lang} />;
          case "pricing_dual_cards":
            return (
              <sectionRegistry.pricing_dual_cards key={section.id} section={section} lang={lang} />
            );
          case "rich_text":
            return <sectionRegistry.rich_text key={section.id} section={section} lang={lang} />;
          case "faq":
            return <sectionRegistry.faq key={section.id} section={section} lang={lang} />;
          case "scrolling_ticker":
            return <sectionRegistry.scrolling_ticker key={section.id} section={section} lang={lang} />;
          case "design_showcase_grid":
            return (
              <sectionRegistry.design_showcase_grid key={section.id} section={section} lang={lang} />
            );
          case "feature_highlight_grid":
            return (
              <sectionRegistry.feature_highlight_grid key={section.id} section={section} lang={lang} />
            );
          case "feature_highlight_split":
            return (
              <sectionRegistry.feature_highlight_split key={section.id} section={section} lang={lang} />
            );
          default:
            assertNever(section);
        }
      })}
    </>
  );
}
